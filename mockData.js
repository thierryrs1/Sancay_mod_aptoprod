export const DEFAULT_OPS_DATA = [
  {
    "BELNR_ID": 39,
    "AUFTRAG": "OP_ESO04_0626",
    "TYP": "OP",
    "BELDAT": "10 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 30,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PESO001",
        "ItemName": "ESOFAGO LIMPO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 50,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PESO002",
        "ItemName": "MEMBRANA ESOFAGO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "PESO00A",
        "ItemName": "ESOFAGO CORTE - AGRUPADO",
        "MENGE": 2500,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "PESO001",
            "ItemName": "ESOFAGO LIMPO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "PESO002",
            "ItemName": "MEMBRANA ESOFAGO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "RESE001",
            "ItemName": "RESIDUO ESOFAGO UMIDO",
            "INPUT_QTY": -1
          }
        ]
      },
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      }
    ]
  },
  {
    "BELNR_ID": 40,
    "AUFTRAG": "OP_EST05_0626",
    "TYP": "OP",
    "BELDAT": "10 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "REST",
        "ItemName": "AGRUPADO - EST ESOFAGUITO",
        "MENGE": 2500,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "R400004",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "R310001-2",
            "ItemName": "BARGAIN BAG",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "RESE001",
            "ItemName": "RESIDUO ESOFAGO UMIDO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "RESE002",
            "ItemName": "RESIDUO ESOFAGO SECO",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESTSC",
        "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 60,
            "APLATZ_ID": "ESTUFA"
          },
          {
            "POS_ID": 50,
            "APLATZ_ID": "SERRA"
          },
          {
            "POS_ID": 40,
            "APLATZ_ID": "DESBANDEJAMENTO"
          },
          {
            "POS_ID": 30,
            "APLATZ_ID": "ESTUFA"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO001",
            "ItemName": "ESOFAGO LIMPO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 20,
        "ItemCode": "PESO001",
        "ItemName": "ESOFAGO LIMPO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 30,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R400004",
        "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 70,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 60,
            "ItemCode": "R400004-RP",
            "ItemName": "REPROCESSO - Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R310001-2",
        "ItemName": "BARGAIN BAG",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          }
        ]
      }
    ]
  },
  {
    "BELNR_ID": 41,
    "AUFTRAG": "OP_ESO07_0626",
    "TYP": "OP",
    "BELDAT": "11 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 30,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 20,
        "ItemCode": "PESO001",
        "ItemName": "ESOFAGO LIMPO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESTSC",
        "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 60,
            "APLATZ_ID": "ESTUFA"
          },
          {
            "POS_ID": 50,
            "APLATZ_ID": "SERRA"
          },
          {
            "POS_ID": 40,
            "APLATZ_ID": "DESBANDEJAMENTO"
          },
          {
            "POS_ID": 30,
            "APLATZ_ID": "ESTUFA"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO001",
            "ItemName": "ESOFAGO LIMPO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R400004",
        "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 70,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 60,
            "ItemCode": "R400004-RP",
            "ItemName": "REPROCESSO - Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R310001-2",
        "ItemName": "BARGAIN BAG",
        "MENGE": 2500,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 70,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESE001",
        "ItemName": "RESIDUO ESOFAGO UMIDO",
        "MENGE": 2500,
        "roteiro": [],
        "listaDeMateriais": []
      },
      {
        "BELPOS_ID": 80,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESE002",
        "ItemName": "RESIDUO ESOFAGO SECO",
        "MENGE": 2500,
        "roteiro": [],
        "listaDeMateriais": []
      },
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "REST",
        "ItemName": "AGRUPADO - EST ESOFAGUITO",
        "MENGE": 2500,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "R400004",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "R310001-2",
            "ItemName": "BARGAIN BAG",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "RESE001",
            "ItemName": "RESIDUO ESOFAGO UMIDO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "RESE002",
            "ItemName": "RESIDUO ESOFAGO SECO",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 100,
        "ZU_BELPOS_ID": 90,
        "ItemCode": "PESO000",
        "ItemName": "ESOFAGO PR",
        "MENGE": 2000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FESA001",
            "ItemName": "ESOFAGO ABERTO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "FESF002",
            "ItemName": "ESOFAGO FECHADO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 110,
        "ZU_BELPOS_ID": 90,
        "ItemCode": "PESO001",
        "ItemName": "ESOFAGO LIMPO",
        "MENGE": 2000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 120,
        "ZU_BELPOS_ID": 90,
        "ItemCode": "PESO002",
        "ItemName": "MEMBRANA ESOFAGO",
        "MENGE": 2000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 130,
        "ZU_BELPOS_ID": 90,
        "ItemCode": "RESE001",
        "ItemName": "RESIDUO ESOFAGO UMIDO",
        "MENGE": 2000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 90,
        "ZU_BELPOS_ID": null,
        "ItemCode": "PESO00A",
        "ItemName": "ESOFAGO CORTE - AGRUPADO",
        "MENGE": 2000,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "PESO001",
            "ItemName": "ESOFAGO LIMPO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "PESO002",
            "ItemName": "MEMBRANA ESOFAGO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "RESE001",
            "ItemName": "RESIDUO ESOFAGO UMIDO",
            "INPUT_QTY": 1
          }
        ]
      }
    ]
  },
  {
    "BELNR_ID": 42,
    "AUFTRAG": "OP_ESO01_0626",
    "TYP": "OP",
    "BELDAT": "12 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 20,
        "ItemCode": "PESO001",
        "ItemName": "ESOFAGO LIMPO",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESTSC",
        "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 60,
            "APLATZ_ID": "ESTUFA"
          },
          {
            "POS_ID": 50,
            "APLATZ_ID": "SERRA"
          },
          {
            "POS_ID": 40,
            "APLATZ_ID": "DESBANDEJAMENTO"
          },
          {
            "POS_ID": 30,
            "APLATZ_ID": "ESTUFA"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO001",
            "ItemName": "ESOFAGO LIMPO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU046",
            "ItemName": "METABISULFITO",
            "INPUT_QTY": 0.012
          }
        ]
      },
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R400004",
        "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 70,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 60,
            "ItemCode": "R400004-RP",
            "ItemName": "REPROCESSO - Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "R310001-2",
        "ItemName": "BARGAIN BAG",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "EMBALAGEM"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU168",
            "ItemName": "CAIXA DE PAPEL 380X290X360",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU109",
            "ItemName": "ETIQUETA 100X140MM BOPP HOT MELT 3P 90M",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU145",
            "ItemName": "SACO PLASTICO 100X73X010",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU074",
            "ItemName": "PALLET DE MADEIRA",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESE001",
        "ItemName": "RESIDUO ESOFAGO UMIDO",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "MESA_MANIPULACAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PESO000",
            "ItemName": "ESOFAGO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 70,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "RESE002",
        "ItemName": "RESIDUO ESOFAGO SECO",
        "MENGE": 3000,
        "roteiro": [],
        "listaDeMateriais": []
      },
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "REST",
        "ItemName": "AGRUPADO - EST ESOFAGUITO",
        "MENGE": 3000,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "RESTSC",
            "ItemName": "Mastigável de esôfago - ESOFAGUITO - SECO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "R400004",
            "ItemName": "Mastigável de esôfago bovino - ESOFAGUITO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "R310001-2",
            "ItemName": "BARGAIN BAG",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "RESE001",
            "ItemName": "RESIDUO ESOFAGO UMIDO",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "RESE002",
            "ItemName": "RESIDUO ESOFAGO SECO",
            "INPUT_QTY": 1
          }
        ]
      }
    ]
  },
  {
    "BELNR_ID": 43,
    "AUFTRAG": "OP_CRO03_0626",
    "TYP": "OP",
    "BELDAT": "12 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC000",
        "ItemName": "COURO COLAGENO PR",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "FULAO"
          },
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FCRC001",
            "ItemName": "COURO COLAGENO MP",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU135",
            "ItemName": "DESENCALANTE PBL NVP",
            "INPUT_QTY": 0.0126
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU136",
            "ItemName": "DESENGRAXANTE PBL DPA",
            "INPUT_QTY": 0.002
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU134",
            "ItemName": "PEROXIDO DE HIDROGENIO",
            "INPUT_QTY": 0.0096
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU082",
            "ItemName": "CLORO (DESINFETANTE DE AGUA PARA USO HUMANO)",
            "INPUT_QTY": 0.0048
          }
        ]
      },
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC001",
        "ItemName": "COURO CORTE STICK 6\"",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC002",
        "ItemName": "COURO CORTE STICK 12\"",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC003",
        "ItemName": "COURO CORTE STICK 24\"",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC004",
        "ItemName": "COURO CORTE STICK 30\"- 34\"",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 70,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC016",
        "ItemName": "COURO CORTE PEDAÇO",
        "MENGE": 3000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "RESC001",
            "ItemName": "RESIDUO COURO UMIDO",
            "INPUT_QTY": -1
          }
        ]
      },
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "PCRC00A",
        "ItemName": "COURO CORTE - AGRUPADO",
        "MENGE": 3000,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "PCRC001",
            "ItemName": "COURO CORTE STICK 6\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "PCRC002",
            "ItemName": "COURO CORTE STICK 12\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "PCRC003",
            "ItemName": "COURO CORTE STICK 24\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "PCRC004",
            "ItemName": "COURO CORTE STICK 30\"- 34\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 60,
            "ItemCode": "PCRC016",
            "ItemName": "COURO CORTE PEDAÇO",
            "INPUT_QTY": 1
          }
        ]
      }
    ]
  },
  {
    "BELNR_ID": 44,
    "AUFTRAG": "OP_CRO04_0626",
    "TYP": "OP",
    "BELDAT": "12 jun. 2026 0:00:00.0",
    "BPLName": "?",
    "posicoes": [
      {
        "BELPOS_ID": 20,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC000",
        "ItemName": "COURO COLAGENO PR",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "DESCONGELAR"
          },
          {
            "POS_ID": 20,
            "APLATZ_ID": "FULAO"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "FCRC001",
            "ItemName": "COURO COLAGENO MP",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "INSU135",
            "ItemName": "DESENCALANTE PBL NVP",
            "INPUT_QTY": 0.0126
          },
          {
            "POS_ID": 30,
            "ItemCode": "INSU136",
            "ItemName": "DESENGRAXANTE PBL DPA",
            "INPUT_QTY": 0.002
          },
          {
            "POS_ID": 40,
            "ItemCode": "INSU134",
            "ItemName": "PEROXIDO DE HIDROGENIO",
            "INPUT_QTY": 0.0096
          },
          {
            "POS_ID": 50,
            "ItemCode": "INSU082",
            "ItemName": "CLORO (DESINFETANTE DE AGUA PARA USO HUMANO)",
            "INPUT_QTY": 0.0048
          }
        ]
      },
      {
        "BELPOS_ID": 30,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC001",
        "ItemName": "COURO CORTE STICK 6\"",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 40,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC002",
        "ItemName": "COURO CORTE STICK 12\"",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 50,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC003",
        "ItemName": "COURO CORTE STICK 24\"",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 60,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC004",
        "ItemName": "COURO CORTE STICK 30\"- 34\"",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 20,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          }
        ]
      },
      {
        "BELPOS_ID": 70,
        "ZU_BELPOS_ID": 10,
        "ItemCode": "PCRC016",
        "ItemName": "COURO CORTE PEDAÇO",
        "MENGE": 11000,
        "roteiro": [
          {
            "POS_ID": 10,
            "APLATZ_ID": "CORTE"
          }
        ],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "RESC001",
            "ItemName": "RESIDUO COURO UMIDO",
            "INPUT_QTY": -1
          }
        ]
      },
      {
        "BELPOS_ID": 10,
        "ZU_BELPOS_ID": null,
        "ItemCode": "PCRC00A",
        "ItemName": "COURO CORTE - AGRUPADO",
        "MENGE": 11000,
        "roteiro": [],
        "listaDeMateriais": [
          {
            "POS_ID": 10,
            "ItemCode": "PCRC000",
            "ItemName": "COURO COLAGENO PR",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 20,
            "ItemCode": "PCRC001",
            "ItemName": "COURO CORTE STICK 6\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 30,
            "ItemCode": "PCRC002",
            "ItemName": "COURO CORTE STICK 12\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 40,
            "ItemCode": "PCRC003",
            "ItemName": "COURO CORTE STICK 24\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 50,
            "ItemCode": "PCRC004",
            "ItemName": "COURO CORTE STICK 30\"- 34\"",
            "INPUT_QTY": 1
          },
          {
            "POS_ID": 60,
            "ItemCode": "PCRC016",
            "ItemName": "COURO CORTE PEDAÇO",
            "INPUT_QTY": 1
          }
        ]
      }
    ]
  }
];

