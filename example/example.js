const { serviceLayer, executeQuery, data } = scope;

const palletCode = data.U_SPS_PalletCode;

if (!palletCode) {

    throw new Error(
        'U_SPS_PalletCode é obrigatório'
    );
}

// =====================================================
// BUSCA DOCENTRY + ITEM DO CABEÇALHO
// =====================================================

const sql = `
SELECT
    T0."DocEntry",
    T1."ItemCode",
    UPPER(T1."ItemName") AS "ItemName"
FROM "@SPS_PALLET_GROUP" T0
INNER JOIN "BEAS_FTPOS" T1
    ON T0."U_SPS_BELNR_ID" = T1."BELNR_ID"
   AND T0."U_SPS_BELPOS_ID" = T1."BELPOS_ID"
WHERE
    T0."U_SPS_PalletCode" = '${palletCode}'
`;

const result = await executeQuery(sql);

if (result.length === 0) {

    throw new Error(
        `Palete "${palletCode}" não encontrado`
    );
}

const docEntry = result[0].DocEntry;

// =====================================================
// BUSCA DADOS NO SERVICE LAYER
// =====================================================

const slResult = await serviceLayer({
    url: `SPS_PALLET_GROUP(${docEntry})`,
    method: 'GET'
});

// =====================================================
// ADICIONA ITEM DO CABEÇALHO
// =====================================================

slResult.ItemCode = result[0].ItemCode;
slResult.ItemName = result[0].ItemName;

// =====================================================
// RETORNO
// =====================================================

return slResult;