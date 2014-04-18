/*
[
    '{{repeat(5,8)}}', 
    {
        _id: '{{index}}',
        ref_id: '{{numeric(0,10)}}',
        user_id: '{{numeric(0,3)}}',
        firstname: '{{firstName}}',
        lastname: '{{surname}}',
        email: '{{email}}',
        created: '{{date(YYYY-MM-ddThh:mm:ss Z)}}',
        company: '{{company}}',
        phone: '+1 {{phone}}',
        address: '{{numeric(100,999)}} {{street}}, {{city}}, {{state}}, {{numeric(100,10000)}}'
    }
]
*/

[
    {
        "_id": 0,
        "ref_id": 5,
        "user_id": 0,
        "firstname": "Pearson",
        "lastname": "Padilla",
        "email": "pearsonpadilla@niquent.com",
        "created": "1992-07-05T19:59:19 +07:00",
        "company": "Xelegyl",
        "phone": "+1 (900) 491-2886",
        "address": "385 Orange Street, Wedgewood, Oregon, 25988"
    },
    {
        "_id": 1,
        "ref_id": 4,
        "user_id": 0,
        "firstname": "Guerra",
        "lastname": "Suarez",
        "email": "guerrasuarez@xelegyl.com",
        "created": "2005-10-16T00:28:50 +07:00",
        "company": "Portica",
        "phone": "+1 (860) 437-3118",
        "address": "242 Malbone Street, Konterra, Wisconsin, 30628"
    },
    {
        "_id": 2,
        "ref_id": 0,
        "user_id": 3,
        "firstname": "Mavis",
        "lastname": "Willis",
        "email": "maviswillis@portica.com",
        "created": "1988-03-11T09:06:30 +08:00",
        "company": "Rubadub",
        "phone": "+1 (843) 584-2324",
        "address": "973 Bush Street, Defiance, Wyoming, 84869"
    },
    {
        "_id": 3,
        "ref_id": 9,
        "user_id": 1,
        "firstname": "Doris",
        "lastname": "Irwin",
        "email": "dorisirwin@rubadub.com",
        "created": "2003-12-09T07:17:16 +08:00",
        "company": "Firewax",
        "phone": "+1 (956) 483-3716",
        "address": "945 Taaffe Place, Wilmington, Michigan, 91553"
    },
    {
        "_id": 4,
        "ref_id": 3,
        "user_id": 0,
        "firstname": "Norman",
        "lastname": "Rodgers",
        "email": "normanrodgers@firewax.com",
        "created": "1999-12-21T10:26:27 +08:00",
        "company": "Xyqag",
        "phone": "+1 (940) 562-3947",
        "address": "208 Krier Place, Gouglersville, New Jersey, 21836"
    },
    {
        "_id": 5,
        "ref_id": 0,
        "user_id": 1,
        "firstname": "Shaw",
        "lastname": "Dickerson",
        "email": "shawdickerson@xyqag.com",
        "created": "2007-09-26T22:39:20 +07:00",
        "company": "Podunk",
        "phone": "+1 (830) 462-3290",
        "address": "411 Montague Street, Salunga, Colorado, 43876"
    }
]