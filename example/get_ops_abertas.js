const { executeQuery, data } = scope;

// =====================================================
// FILTROS RECEBIDOS NO BODY (POST)
// =====================================================
const filterABGKZ = data.ABGKZ || null;
const filterBELNR_ID = data.BELNR_ID || null;
const filterAUFTRAG = data.AUFTRAG || null;
const filterBELPOS_ID = data.BELPOS_ID || null;
const filterTYP = data.TYP || null;
const filterLimit = data.Limit ? parseInt(data.Limit) : null;
const filterOrder = (data.Order && data.Order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

// Monta os pedaços de WHERE dinâmico para ABGKZ
const condHaupABGKZ = filterABGKZ ? `AND T0."ABGKZ" = '${filterABGKZ}'` : ``;
const condPosABGKZ = filterABGKZ ? `AND T1."ABGKZ" = '${filterABGKZ}' AND T0."ABGKZ" = '${filterABGKZ}'` : ``;
const condRotABGKZ = filterABGKZ ? `AND T2."ABGKZ" = '${filterABGKZ}' AND T1."ABGKZ" = '${filterABGKZ}' AND T0."ABGKZ" = '${filterABGKZ}'` : ``;
const condMatABGKZ = filterABGKZ ? `AND T2."ABGKZ" = '${filterABGKZ}' AND T1."ABGKZ" = '${filterABGKZ}' AND T0."ABGKZ" = '${filterABGKZ}'` : ``;

// Filtro de ID Dinâmico EXCLUSIVO para o Cabeçalho (OPs)
const condHaupID = filterBELNR_ID ? `AND T0."BELNR_ID" = ${filterBELNR_ID}` : ``;

// Filtros de AUFTRAG Dinâmicos
const condHaupAuf = filterAUFTRAG ? `AND T0."AUFTRAG" = '${filterAUFTRAG}'` : ``;
const condT1Auf = filterAUFTRAG ? `AND T1."AUFTRAG" = '${filterAUFTRAG}'` : ``;
const condT2Auf = filterAUFTRAG ? `AND T2."AUFTRAG" = '${filterAUFTRAG}'` : ``;

// Filtros de TYP (Cabeçalho FTHAUPT)
const condHaupTyp = filterTYP ? `AND T0."TYP" = '${filterTYP}'` : ``;
const condT1Typ = filterTYP ? `AND T1."TYP" = '${filterTYP}'` : ``;
const condT2Typ = filterTYP ? `AND T2."TYP" = '${filterTYP}'` : ``;

// Filtros de BELPOS_ID Dinâmicos (Posições)
const condT0PosID = filterBELPOS_ID ? `AND T0."BELPOS_ID" = ${filterBELPOS_ID}` : ``;
const condUBeasPosID = filterBELPOS_ID ? `AND T1."U_beas_belposid" = ${filterBELPOS_ID}` : ``;
const condResPosID = filterBELPOS_ID ? `AND T0."BASE_LINENUM" = ${filterBELPOS_ID}` : ``;

// =========================================================
// 1. BUSCA DADOS BRUTOS (EVITANDO LOOPS NO BANCO)
// Fazemos JOIN com FTHAUPT para trazer apenas o que
// pertence a OPs abertas (ABGKZ = 'J').
// =====================================================

// Cabeçalhos (OPs)
const sqlOps = `
    SELECT T0."BELNR_ID", T0."AUFTRAG", T0."TYP", TO_DATE(T0."BELDAT") as "BELDAT"
    FROM "BEAS_FTHAUPT" T0
    WHERE 1=1 ${condHaupABGKZ} ${condHaupID} ${condHaupAuf} ${condHaupTyp}
    ORDER BY 1 ${filterOrder}
    ${filterLimit ? `LIMIT ${filterLimit}` : ``}
`;
const opsResult = await executeQuery(sqlOps);

if (!opsResult || opsResult.length === 0) {
    return []; // Se não tem OP aberta, retorna array vazio
}

// Extrai os IDs das OPs retornadas (respeitando o limite) para filtrar as queries filhas com precisão cirúrgica
const opsIds = opsResult.map(op => op.BELNR_ID).join(',');
const condT1ID      = `AND T1."BELNR_ID" IN (${opsIds})`;
const condT2ID      = `AND T2."BELNR_ID" IN (${opsIds})`;
const condUBeasID   = `AND T1."U_beas_belnrid" IN (${opsIds})`;
const condBaseDocID = `AND T0."BASE_DOCENTRY" IN (${opsIds})`;

// Posições
const sqlPos = `
    SELECT T0."BELNR_ID", T0."BELPOS_ID", T0."ZU_BELPOS_ID", T0."ItemCode", T0."ItemName", T0."MENGE_VERBRAUCH" as "MENGE", T2."Phantom"
    FROM "BEAS_FTPOS" T0
    JOIN "BEAS_FTHAUPT" T1 ON T1."BELNR_ID" = T0."BELNR_ID"
    JOIN "OITM" T2 ON T0."ItemCode" = T2."ItemCode"
    WHERE 1=1 ${condPosABGKZ} ${condT1ID} ${condT1Auf} ${condT1Typ} ${condT0PosID}
    ORDER BY 1 DESC,2
`;
const posResult = await executeQuery(sqlPos);

// Roteiro (Operações)
const sqlRot = `
    SELECT T0."BELNR_ID", T0."BELPOS_ID", T0."POS_ID", T0."APLATZ_ID", T0."BEZ", T0."AG_ID", 
    CASE WHEN T0."MENGE_JE" = 0 THEN 0 ELSE ROUND(T1."MENGE_VERBRAUCH" / T0."MENGE_JE" * T0."TEAPLATZ", 4) END as "EstimatedTime"
    FROM "BEAS_FTAPL" T0
    JOIN "BEAS_FTPOS" T1 ON T1."BELNR_ID" = T0."BELNR_ID" AND T1."BELPOS_ID" = T0."BELPOS_ID"
    JOIN "BEAS_FTHAUPT" T2 ON T2."BELNR_ID" = T0."BELNR_ID"
    WHERE 1=1 ${condRotABGKZ} ${condT2ID} ${condT2Auf} ${condT2Typ} ${condT0PosID}
    ORDER BY 1 DESC,2,3
`;
const roteiroResult = await executeQuery(sqlRot);

// Lista de Materiais
const sqlMat = `
    SELECT T0."BELNR_ID", T0."BELPOS_ID", T0."POS_ID", T0."ART1_ID" as "ItemCode", T0."WhsCode", T0."BINCODE", T0."ItemName", T0."TOTALQUANTITY_WHUNIT" as "Quantity", CASE WHEN T0."INPUT_QTY" >= 0 THEN 'RawMaterial' ELSE 'ByProduct' END as "Type", T0."BookedQty"
    FROM "BEAS_FTSTL" T0
    JOIN "BEAS_FTPOS" T1 ON T0."BELNR_ID" = T1."BELNR_ID" AND T0."BELPOS_ID" = T1."BELPOS_ID"
    JOIN "BEAS_FTHAUPT" T2 ON T2."BELNR_ID" = T1."BELNR_ID"
    WHERE 1=1 ${condMatABGKZ} ${condT2ID} ${condT2Auf} ${condT2Typ} ${condT0PosID}
    ORDER BY 1 DESC,2,3
`;
const matResult = await executeQuery(sqlMat);

// Solicitações de Transferência de Estoque (Transfer Requests - OWTQ/WTQ1)
// O cross-join com OITL/ITL1 permite rastrear detalhes de lote caso alocados previamente
const sqlTransferReq = `
    SELECT T0."DocEntry" ,T0."DocNum" ,T1."LineNum" ,T1."U_beas_belnrid", T1."U_beas_belposid"
    ,IFNULL(T1."U_beas_posid", 0) as "U_beas_posid",T1."FromWhsCod" as "WhsCodeFrom",
    T1."WhsCode" as "WhsCodeTo" ,T4."DistNumber" ,T3."AllocQty" as "Quantity"
    FROM "OWTQ" T0
    INNER JOIN "WTQ1" T1 ON T0."DocEntry" = T1."DocEntry"
    LEFT JOIN "OITL" T2 ON T1."ObjType" = T2."ApplyType" AND T1."DocEntry" = T2."ApplyEntry" AND T1."LineNum" = T2."ApplyLine"
    LEFT JOIN "ITL1" T3 ON T2."LogEntry" = T3."LogEntry"
    LEFT JOIN "OBTN" T4 ON T3."MdAbsEntry" = T4."AbsEntry"
    WHERE 1=1 ${condUBeasID} ${condUBeasPosID}
`;

const transfReqResult = await executeQuery(sqlTransferReq);


// Transferências de Estoque Realizadas (Stock Transfers - OWTR/WTR1)
// Filtramos pela quantidade > 0 para pegar apenas lotes/documentos de fato movimentados
const sqlStockTransfer = `
    SELECT T0."DocEntry" ,T0."DocNum" ,T1."LineNum" ,T1."U_beas_belnrid", T1."U_beas_belposid"
    ,IFNULL(T1."U_beas_posid", 0) as "U_beas_posid",T1."FromWhsCod" as "WhsCodeFrom",
    T1."WhsCode" as "WhsCodeTo" ,T4."DistNumber" ,T3."Quantity"
    FROM "OWTR" T0
    INNER JOIN "WTR1" T1 ON T0."DocEntry" = T1."DocEntry"
    LEFT JOIN "OITL" T2 ON T1."ObjType" = T2."ApplyType" AND T1."DocEntry" = T2."ApplyEntry" AND T1."LineNum" = T2."ApplyLine"
    LEFT JOIN "ITL1" T3 ON T2."LogEntry" = T3."LogEntry"
    LEFT JOIN "OBTN" T4 ON T3."MdAbsEntry" = T4."AbsEntry"
    WHERE T3."Quantity" > 0 ${condUBeasID} ${condUBeasPosID}
`;

const transfResult = await executeQuery(sqlStockTransfer);


// Saídas de Insumos da Ordem de Produção (Issues - OIGE/IGE1)
// O CASE garante pegar a quantidade do lote caso seja administrado por lote (ManBtchNum = 'Y')
const sqlIssue = `
    SELECT T0."DocEntry",T0."DocNum" ,T1."LineNum" ,T1."U_beas_belnrid", T1."U_beas_belposid"
    ,IFNULL(T1."U_beas_posid", 0) as "U_beas_posid",
    T1."WhsCode" as "WhsCodeTo" ,T4."DistNumber" ,CASE WHEN T5."ManBtchNum" = 'Y' THEN ABS(T3."Quantity") ELSE T1."Quantity" END as "Quantity", T5."ManBtchNum"
    FROM "OIGE" T0
    INNER JOIN "IGE1" T1 ON T0."DocEntry" = T1."DocEntry"
    LEFT JOIN "OITL" T2 ON T1."ObjType" = T2."ApplyType" AND T1."DocEntry" = T2."ApplyEntry" AND T1."LineNum" = T2."ApplyLine"
    LEFT JOIN "ITL1" T3 ON T2."LogEntry" = T3."LogEntry"
    LEFT JOIN "OBTN" T4 ON T3."MdAbsEntry" = T4."AbsEntry"
    INNER JOIN "OITM" T5 ON T1."ItemCode" = T5."ItemCode"
    WHERE 1=1 ${condUBeasID} ${condUBeasPosID}
`;

const issueResult = await executeQuery(sqlIssue);

// Entradas de Produção (Receipts - OIGN/IGN1)
// Trazemos tudo que foi apontado (produzido) para as Posições/BOMs mapeados
const sqlReceipt = `
    SELECT T0."DocEntry",T0."DocNum" ,T1."LineNum" ,T1."U_beas_belnrid", T1."U_beas_belposid"
    ,IFNULL(T1."U_beas_posid", 0) as "U_beas_posid",
    T1."WhsCode" as "WhsCodeTo" ,T4."DistNumber" ,CASE WHEN T5."ManBtchNum" = 'Y' THEN ABS(T3."Quantity") ELSE T1."Quantity" END as "Quantity", T5."ManBtchNum"
    FROM "OIGN" T0
    INNER JOIN "IGN1" T1 ON T0."DocEntry" = T1."DocEntry"
    LEFT JOIN "OITL" T2 ON T1."ObjType" = T2."ApplyType" AND T1."DocEntry" = T2."ApplyEntry" AND T1."LineNum" = T2."ApplyLine"
    LEFT JOIN "ITL1" T3 ON T2."LogEntry" = T3."LogEntry"
    LEFT JOIN "OBTN" T4 ON T3."MdAbsEntry" = T4."AbsEntry"
    INNER JOIN "OITM" T5 ON T1."ItemCode" = T5."ItemCode"
    WHERE 1=1 ${condUBeasID} ${condUBeasPosID}
`;

const receiptResult = await executeQuery(sqlReceipt);


// Reservas Vinculadas à Ordem de Trabalho (BEAS_RESERVATION_LINE)
// BASE_TYPE = 'wo' garante que a reserva foi feita para Produção
const sqlReservation = `
    SELECT T0."BASE_DOCENTRY" as "BELNR_ID", T0."BASE_LINENUM" as "BELPOS_ID", T0."BASE_LINENUM2" as "POS_ID",
    T0."DistNumber", T0."Quantity", T0."WhsCode", T0."BINCODE"
    FROM "BEAS_RESERVATION_LINE" T0
    WHERE T0."BASE_TYPE" = 'wo' ${condBaseDocID} ${condResPosID}
`;

const reservationResult = await executeQuery(sqlReservation);


const sqlTimeReceipt = `
    SELECT T0."BELNR_ID" ,T0."BELPOS_ID" ,T0."POS_ID" ,TO_VARCHAR(T0."ANFZEIT", 'YYYY-MM-DD HH24:MI:SS') as "ANFZEIT" ,TO_VARCHAR(T0."ENDZEIT", 'YYYY-MM-DD HH24:MI:SS') as "ENDZEIT"
    ,T0."ZEIT" as "Duration" ,T0."MENGE_GUT" as "Quantity" ,T0."PERS_ID"
    FROM "BEAS_ARBZEIT" T0
    JOIN "BEAS_FTHAUPT" T2 ON T2."BELNR_ID" = T0."BELNR_ID"
    WHERE 1=1 ${condT2ID} ${condT2Auf} ${condT2Typ} ${condT0PosID} ${filterABGKZ ? `AND T2."ABGKZ" = '${filterABGKZ}'` : ''}
`;

const timeResult = await executeQuery(sqlTimeReceipt);

// =====================================================
// 2. MONTAGEM DO JSON EM MEMÓRIA (MUITO RÁPIDO)
// =====================================================

const opsMap = {};

// Inicializa as OPs no mapa
opsResult.forEach(op => {
    opsMap[op.BELNR_ID] = {
        BELNR_ID: op.BELNR_ID,
        AUFTRAG: op.AUFTRAG,
        TYP: op.TYP,
        CreateDate: op.BELDAT,
        WorkOrderPos: []
    };
});

// Mapeia e distribui as Posições para dentro de suas OPs
const posMap = {};
posResult.forEach(pos => {
    const key = `${pos.BELNR_ID}_${pos.BELPOS_ID}`;

    const newPos = {
        BELPOS_ID: pos.BELPOS_ID,
        ZU_BELPOS_ID: pos.ZU_BELPOS_ID,
        ItemCode: pos.ItemCode,
        ItemName: pos.ItemName ? pos.ItemName.replace(/"/g, '″') : null,
        PlannedQty: parseFloat(pos.MENGE),
        Phantom: pos.Phantom,
        WorkoderRouting: [],
        WorkorderBom: [],
        TransferRequest: [],
        StockTransfer: [],
        Issue: [],
        Receipt: []
    };

    posMap[key] = newPos;

    if (opsMap[pos.BELNR_ID]) {
        opsMap[pos.BELNR_ID].WorkOrderPos.push(newPos);
    }
});

// Distribui os Roteiros para dentro de suas Posições
roteiroResult.forEach(rot => {
    const key = `${rot.BELNR_ID}_${rot.BELPOS_ID}`;
    if (posMap[key]) {
        posMap[key].WorkoderRouting.push({
            POS_ID: rot.POS_ID,
            APLATZ_ID: rot.APLATZ_ID,
            AG_ID: rot.AG_ID,
            EstimatedTime: parseFloat(rot.EstimatedTime),
            TimeReceipt: []
        });
    }
});

// Distribui os Materiais para dentro de suas Posições
matResult.forEach(mat => {
    const key = `${mat.BELNR_ID}_${mat.BELPOS_ID}`;
    if (posMap[key]) {
        posMap[key].WorkorderBom.push({
            POS_ID: mat.POS_ID,
            Type: mat.Type,
            ItemCode: mat.ItemCode,
            ItemName: mat.ItemName ? mat.ItemName.replace(/"/g, '″') : null,
            INPUT_QTY: mat.INPUT_QTY,
            Quantity: parseFloat(mat.Quantity),
            WhsCode: mat.WhsCode,
            BinCode: mat.BINCODE,
            ConsumedQty: parseFloat(mat.BookedQty),
            RemainingQty: parseFloat(mat.Quantity) - parseFloat(mat.BookedQty),
            TransferRequest: [],
            Transfer: [],
            Issue: [],
            Receipt: [],
            Reservation: []
        });
    }
});

// Distribui as Transferências Reais (OWTR/WTR1)
// Segue a mesma lógica do TransferRequest: PosID=0 vai para Posição, PosID>0 vai para o Material (BOM)
transfResult.forEach(tr => {
    const key = `${tr.U_beas_belnrid}_${tr.U_beas_belposid}`;
    const pos = posMap[key];

    if (pos) {
        const trObj = {
            DocEntry: tr.DocEntry,
            DocNum: tr.DocNum,
            LineNum: tr.LineNum,
            WhsCodeFrom: tr.WhsCodeFrom,
            WhsCodeTo: tr.WhsCodeTo,
            DistNumber: tr.DistNumber,
            Quantity: parseFloat(tr.Quantity) || 0
        };

        if (tr.U_beas_posid === 0) {
            // PosID 0 => Pertence à Posição
            pos.StockTransfer.push(trObj);
        } else {
            // PosID > 0 => Pertence ao Componente Específico (BOM)
            const bomItem = pos.WorkorderBom.find(b => b.POS_ID === tr.U_beas_posid);
            if (bomItem) {
                bomItem.Transfer.push(trObj);
            }
        }
    }
});


// Distribui as Transfer Requests
transfReqResult.forEach(tr => {
    const key = `${tr.U_beas_belnrid}_${tr.U_beas_belposid}`;
    const pos = posMap[key];

    if (pos) {
        const trObj = {
            DocEntry: tr.DocEntry,
            DocNum: tr.DocNum,
            LineNum: tr.LineNum,
            WhsCodeFrom: tr.WhsCodeFrom,
            WhsCodeTo: tr.WhsCodeTo,
            DistNumber: tr.DistNumber,
            Quantity: parseFloat(tr.Quantity) || 0
        };

        if (tr.U_beas_posid === 0) {
            // PosID 0 => Pertence à Posição
            pos.TransferRequest.push(trObj);
        } else {
            // PosID > 0 => Pertence ao Componente Específico (BOM)
            const bomItem = pos.WorkorderBom.find(b => b.POS_ID === tr.U_beas_posid);
            if (bomItem) {
                bomItem.TransferRequest.push(trObj);
            }
        }
    }
});

// Distribui as Saídas/Consumos de Estoque (OIGE/IGE1)
issueResult.forEach(tr => {
    const key = `${tr.U_beas_belnrid}_${tr.U_beas_belposid}`;
    const pos = posMap[key];

    if (pos) {
        const trObj = {
            DocEntry: tr.DocEntry,
            DocNum: tr.DocNum,
            LineNum: tr.LineNum,
            WhsCodeTo: tr.WhsCodeTo,
            DistNumber: tr.DistNumber,
            Quantity: parseFloat(tr.Quantity) || 0,
            ManBtchNum: tr.ManBtchNum
        };

        if (tr.U_beas_posid === 0) {
            pos.Issue.push(trObj);
        } else {
            const bomItem = pos.WorkorderBom.find(b => b.POS_ID === tr.U_beas_posid);
            if (bomItem) {
                bomItem.Issue.push(trObj);
            }
        }
    }
});

// Distribui as Entradas de Produto Acabado (OIGN/IGN1)
receiptResult.forEach(tr => {
    const key = `${tr.U_beas_belnrid}_${tr.U_beas_belposid}`;
    const pos = posMap[key];

    if (pos) {
        const trObj = {
            DocEntry: tr.DocEntry,
            DocNum: tr.DocNum,
            LineNum: tr.LineNum,
            WhsCodeTo: tr.WhsCodeTo,
            DistNumber: tr.DistNumber,
            Quantity: parseFloat(tr.Quantity) || 0,
            ManBtchNum: tr.ManBtchNum
        };

        if (tr.U_beas_posid === 0) {
            pos.Receipt.push(trObj);
        } else {
            const bomItem = pos.WorkorderBom.find(b => b.POS_ID === tr.U_beas_posid);
            if (bomItem) {
                bomItem.Receipt.push(trObj);
            }
        }
    }
});

// Distribui as Reservas (BEAS_RESERVATION_LINE)
// A reserva é atrelada obrigatoriamente a um componente de material (WorkorderBom)
reservationResult.forEach(res => {
    const key = `${res.BELNR_ID}_${res.BELPOS_ID}`;
    const pos = posMap[key];

    if (pos) {
        const resObj = {
            DistNumber: res.DistNumber,
            Quantity: parseFloat(res.Quantity) || 0,
            WhsCode: res.WhsCode,
            BINCODE: res.BINCODE
        };

        const bomItem = pos.WorkorderBom.find(b => b.POS_ID === res.POS_ID);
        if (bomItem) {
            bomItem.Reservation.push(resObj);
        }
    }
});

// Distribui os Apontamentos de Tempo (Time Receipts)
timeResult.forEach(tr => {
    const key = `${tr.BELNR_ID}_${tr.BELPOS_ID}`;
    const pos = posMap[key];

    if (pos) {
        const trObj = {
            ANFZEIT: tr.ANFZEIT,
            ENDZEIT: tr.ENDZEIT,
            Duration: parseFloat(tr.Duration) || 0,
            Quantity: parseFloat(tr.Quantity) || 0,
            PERS_ID: tr.PERS_ID
        };

        const rotItem = pos.WorkoderRouting.find(r => r.POS_ID === tr.POS_ID);
        if (rotItem) {
            rotItem.TimeReceipt.push(trObj);
        }
    }
});

// =====================================================
// 3. RETORNO FINAL (ARRAY DE OPs NA ORDEM DO BANCO)
// =====================================================
return opsResult.map(op => opsMap[op.BELNR_ID]);
