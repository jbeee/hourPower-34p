/*

[
    '{{repeat(5)}}', 
    {
        _id: '{{index}}',
		group: '{{company}}{{numeric(0,40)}}',
        subgroups: [
            '{{repeat(1,3)}}',
            '{{numeric(0,3)}}'
        ],
        districts: [
            '{{repeat(0,5)}}',
            '{{numeric(0,5)}}'
        ]
    }
    ]


*/

[
    {
        "_id": 0,
        "group": "VFW",
        "dollar a day": 1.25 - 1.50 - 2.00 - 2.50 - 3.00
        "subgroups": [
            1,
            2
        ],
        "districts": [
            0,
            4,
            5,
            0,
            4
        ]
    },
    {
        "_id": 1,
        "group": "Pathways9",
        "subgroups": [
            1,
            3
        ],
        "districts": [
            1,
            1,
            2
        ]
    },
    {
        "_id": 2,
        "group": "Comcubine29",
        "subgroups": [
            2,
            0,
            1
        ],
        "districts": [
            1,
            3
        ]
    },
    {
        "_id": 3,
        "group": "Crustatia6",
        "subgroups": [
            1,
            0,
            2
        ],
        "districts": [
            1,
            5
        ]
    },
    {
        "_id": 4,
        "group": "Portico21",
        "subgroups": [
            1,
            0,
            1
        ],
        "districts": [
            5
        ]
    }
]