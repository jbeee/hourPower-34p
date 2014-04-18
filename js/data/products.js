/*

[
    '{{repeat(10)}}', 
    {
        _id: '{{index}}',
        name_full: '{{company}}',
        name_shrt: 'BBB',
        minface: '{{numeric(200,2000,%=0,0.00)}}',
        maxface: '{{numeric(50000,100000,%=0,0.00)}}',
        defaultface: '{{numeric(5000,40000,%=0,0.00)}}',
        minage: 18,
        maxage: '{{numeric(50,80)}}',
        
        M:[ { 
            TU: '{{numeric(50,80)}}',
            NTU: '{{numeric(50,80)}}'         
            
        }],
        F:[{ 
            TU: '{{numeric(50,80)}}',
            NTU: '{{numeric(50,80)}}'         
            
       } ]
   
         }
    ]


*/



{
        "_id": 0,
        "name_full": "Whole Life",
        "name_shrt": "WHL",
        'type':'ALP',
        "minface": "1000",
        "maxface": "99999",
        "defaultface": "7500",
        "minage": 18,
        "maxage": 80,
        "TU":
            {   
                
                "M": {
                        "Regular":{[
                                {"19",2.555}
                            ]}                  

                     }
            }
        
    }







[
    {
        "_id": 0,
        "name_full": "Whole Life",
        "name_shrt": "WHL",
        'type':'ALP',
        "minface": "1000",
        "maxface": "99999",
        "defaultface": "7500",
        "minage": 18,
        "maxage": 80,
        "M": [
            {
                "TU": 78,
                "NTU": 60
            }
        ],
        "F": [
            {
                "TU": 61,
                "NTU": 53
            }
        ]
    },
    {
        "_id": 1,
        "name_full": "10 Year Somethin Somethin",
        "name_shrt": "TYR",
        'type':'ALP',
        "minface": "323.00",
        "maxface": "89,196.00",
        "defaultface": "16,050.00",
        "minage": 18,
        "maxage": 52,
        "M": [
            {
                "TU": 62,
                "NTU": 64
            }
        ],
        "F": [
            {
                "TU": 71,
                "NTU": 51
            }
        ]
    },
    {
        "_id": 2,
        "name_full": "Jimbies",
        "name_shrt": "BBB",
        "minface": "1,060.00",
        "maxface": "94,721.00",
        "defaultface": "28,528.00",
        "minage": 18,
        "maxage": 58,
        "M": [
            {
                "TU": 68,
                "NTU": 52
            }
        ],
        "F": [
            {
                "TU": 57,
                "NTU": 76
            }
        ]
    },
    {
        "_id": 3,
        "name_full": "Zentia",
        "name_shrt": "BBB",
        "minface": "427.00",
        "maxface": "62,425.00",
        "defaultface": "38,620.00",
        "minage": 18,
        "maxage": 50,
        "M": [
            {
                "TU": 78,
                "NTU": 65
            }
        ],
        "F": [
            {
                "TU": 67,
                "NTU": 70
            }
        ]
    },
    {
        "_id": 4,
        "name_full": "Snacktion",
        "name_shrt": "BBB",
        "minface": "1,652.00",
        "maxface": "81,336.00",
        "defaultface": "17,492.00",
        "minage": 18,
        "maxage": 54,
        "M": [
            {
                "TU": 77,
                "NTU": 80
            }
        ],
        "F": [
            {
                "TU": 58,
                "NTU": 56
            }
        ]
    },
    {
        "_id": 5,
        "name_full": "Zerbina",
        "name_shrt": "BBB",
        "minface": "1,262.00",
        "maxface": "71,633.00",
        "defaultface": "37,759.00",
        "minage": 18,
        "maxage": 77,
        "M": [
            {
                "TU": 66,
                "NTU": 58
            }
        ],
        "F": [
            {
                "TU": 71,
                "NTU": 61
            }
        ]
    },
    {
        "_id": 6,
        "name_full": "Poshome",
        "name_shrt": "BBB",
        "minface": "977.00",
        "maxface": "93,171.00",
        "defaultface": "8,123.00",
        "minage": 18,
        "maxage": 74,
        "M": [
            {
                "TU": 63,
                "NTU": 80
            }
        ],
        "F": [
            {
                "TU": 79,
                "NTU": 78
            }
        ]
    },
    {
        "_id": 7,
        "name_full": "Fishland",
        "name_shrt": "BBB",
        "minface": "1,794.00",
        "maxface": "85,600.00",
        "defaultface": "10,871.00",
        "minage": 18,
        "maxage": 59,
        "M": [
            {
                "TU": 72,
                "NTU": 63
            }
        ],
        "F": [
            {
                "TU": 61,
                "NTU": 75
            }
        ]
    },
    {
        "_id": 8,
        "name_full": "Assurity",
        "name_shrt": "BBB",
        "minface": "399.00",
        "maxface": "69,579.00",
        "defaultface": "12,302.00",
        "minage": 18,
        "maxage": 73,
        "M": [
            {
                "TU": 65,
                "NTU": 67
            }
        ],
        "F": [
            {
                "TU": 71,
                "NTU": 55
            }
        ]
    },
    {
        "_id": 9,
        "name_full": "Boilcat",
        "name_shrt": "BBB",
        "minface": "1,025.00",
        "maxface": "90,951.00",
        "defaultface": "30,176.00",
        "minage": 18,
        "maxage": 58,
        "M": [
            {
                "TU": 68,
                "NTU": 54
            }
        ],
        "F": [
            {
                "TU": 66,
                "NTU": 55
            }
        ]
    }
]