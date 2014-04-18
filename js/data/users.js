/*

USER JSON

[
    '{{repeat(2,3)}}',
 
    {
        _id: '{{index}}',
        employeeID: '{{numeric(10000,100000)}}',
        firstname: '{{firstName}}',
        lastname: '{{surname}}',
        email: '{{email}}',
        username:  '{{firstName}}{{numeric(10,99)}}',
        password: '{{lorem(1)}}{{numeric(10,10000)}}',
        lastonline: '{{date(YYYY-MM-ddThh:mm:ss Z)}}',
        lastlat: '{{numeric(-90.000001, 90)}}',
        lastlong: '{{numeric(-180.000001, 180)}}',
        districts: ['{{repeat(7)}}','{{numeric(0,40)}}' ],
        refs: [
            '{{repeat(0,5)}}',
            {
                id: '{{index}}',
                name: '{{firstName}} {{surname}}',
                group: '{{numeric(0,40)}}',
                deleted:'{{bool}}'
            }
        ],
        policy:[
            '{{repeat(0,5)}}',
            {
                id: '{{index}}',
                name: '{{firstName}} {{surname}}',
                group: '{{numeric(0,40)}}',
                created: '{{date(YYYY-MM-ddThh:mm:ss Z)}}',
                synch: '{{bool}}',
                deleted:'{{bool}}'
         }
        ]

    }
]
*/


[
    {
        "_id": 0,
        "employeeID": 12490,
        "firstname": "Whitney",
        "lastname": "Tillman",
        "email": "whitneytillman@farmex.com",
        "username": "Harrison73",
        "password": "nisi2685",
        "lastonline": "1995-01-27T19:35:01 +08:00",
        "lastlat": -9.036344,
        "lastlong": 167.719975,
        "districts": [
            27,
            13,
            13,
            12,
            3,
            24,
            12
        ],
        "refs": [
            {
                "id": 0,
                "name": "Glover Owens",
                "group": 14,
                "deleted": false
            },
            {
                "id": 1,
                "name": "Moody Chang",
                "group": 21,
                "deleted": false
            },
            {
                "id": 2,
                "name": "Maude Spencer",
                "group": 6,
                "deleted": false
            },
            {
                "id": 3,
                "name": "Singleton Morin",
                "group": 36,
                "deleted": true
            }
        ],
        "policy": [
            {
                "id": 0,
                "name": "Tamara Baird",
                "group": 27,
                "created": "2003-09-15T01:06:42 +07:00",
                "synch": false,
                "deleted": true
            },
            {
                "id": 1,
                "name": "Ella Hubbard",
                "group": 4,
                "created": "2010-07-28T17:53:21 +07:00",
                "synch": false,
                "deleted": false
            },
            {
                "id": 2,
                "name": "Kristi Rodriquez",
                "group": 17,
                "created": "2002-09-19T16:00:13 +07:00",
                "synch": true,
                "deleted": true
            },
            {
                "id": 3,
                "name": "Marion Goff",
                "group": 24,
                "created": "2012-10-04T13:39:28 +07:00",
                "synch": true,
                "deleted": true
            },
            {
                "id": 4,
                "name": "Mullen Molina",
                "group": 34,
                "created": "2000-12-02T15:57:23 +08:00",
                "synch": true,
                "deleted": false
            }
        ]
    },
    {
        "_id": 1,
        "employeeID": 58077,
        "firstname": "Susan",
        "lastname": "Holt",
        "email": "susanholt@farmex.com",
        "username": "Florine42",
        "password": "nulla2451",
        "lastonline": "2010-04-03T15:27:25 +07:00",
        "lastlat": 60.817451,
        "lastlong": -16.458603,
        "districts": [
            4,
            20,
            18,
            28,
            12,
            34,
            36
        ],
        "refs": [
            {
                "id": 0,
                "name": "Araceli Levy",
                "group": 19,
                "deleted": false
            }
        ],
        "policy": [
            {
                "id": 0,
                "name": "Lori Lancaster",
                "group": 37,
                "created": "2009-11-08T03:47:22 +08:00",
                "synch": true,
                "deleted": false
            }
        ]
    }
]