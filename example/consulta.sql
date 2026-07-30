SELECT 
    '[' || 
    IFNULL(STRING_AGG(
        '{' ||
        '"BELNR_ID":' || CAST(OP."BELNR_ID" AS VARCHAR) || ',' ||
        '"AUFTRAG":"' || REPLACE(IFNULL(OP."AUFTRAG", ''), '"', '\"') || '",' ||
        '"TYP":"' || REPLACE(IFNULL(OP."TYP", ''), '"', '\"') || '",' ||
        '"BELDAT":"' || CAST(OP."BELDAT" AS VARCHAR) || '",' ||
        '"posicoes":[' || 
            IFNULL((
                SELECT STRING_AGG(
                    '{' ||
                    '"BELPOS_ID":' || CAST(POS."BELPOS_ID" AS VARCHAR) || ',' ||
                    '"ZU_BELPOS_ID":' || IFNULL(CAST(POS."ZU_BELPOS_ID" AS VARCHAR), 'null') || ',' ||
                    '"ItemCode":"' || REPLACE(IFNULL(POS."ItemCode", ''), '"', '\"') || '",' ||
                    '"ItemName":"' || REPLACE(IFNULL(POS."ItemName", ''), '"', '\"') || '",' ||
                    '"MENGE":' || CAST(POS."MENGE" AS VARCHAR) || ',' ||
                    '"roteiro":[' || 
                        IFNULL((
                            SELECT STRING_AGG(
                                '{' ||
                                '"POS_ID":' || CAST(ROT."POS_ID" AS VARCHAR) || ',' ||
                                '"APLATZ_ID":"' || REPLACE(IFNULL(ROT."APLATZ_ID", ''), '"', '\"') || '"' ||
                                '}', ','
                            )
                            FROM "BEAS_FTAPL" ROT
                            WHERE ROT."BELNR_ID" = POS."BELNR_ID" AND ROT."BELPOS_ID" = POS."BELPOS_ID"
                        ), '') ||
                    '],' ||
                    '"listaDeMateriais":[' || 
                        IFNULL((
                            SELECT STRING_AGG(
                                '{' ||
                                '"POS_ID":' || CAST(MAT."POS_ID" AS VARCHAR) || ',' ||
                                '"ItemCode":"' || REPLACE(IFNULL(MAT."ItemCode", ''), '"', '\"') || '",' ||
                                '"ItemName":"' || REPLACE(IFNULL(MAT."ItemName", ''), '"', '\"') || '",' ||
                                '"INPUT_QTY":' || CAST(MAT."MENGE" AS VARCHAR) ||
                                '}', ','
                            )
                            FROM "BEAS_FTSTL" MAT
                            WHERE MAT."BELNR_ID" = POS."BELNR_ID" AND MAT."BELPOS_ID" = POS."BELPOS_ID"
                        ), '') ||
                    ']' ||
                    '}', ','
                )
                FROM "BEAS_FTPOS" POS
                WHERE POS."BELNR_ID" = OP."BELNR_ID"
            ), '') ||
        ']' ||
        '}', ','
    ), '') ||
    ']' AS "JSON_FINAL"
FROM "BEAS_FTHAUPT" OP
WHERE OP."ABGKZ" = 'J'
