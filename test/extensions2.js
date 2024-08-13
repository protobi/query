var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


    describe("Count satisfied constraints", function () {

    it('counts satisfied conditions', function () {
        let rows = [
            {"B2Q25":5,"B2Q26":5,"B2Q27":5,"B2Q28":5,"B2Q29":5,"B2Q30":5,"B2Q31":5,"B2Q32":5,"B2Q33":5},
            {"B2Q25":1,"B2Q26":2,"B2Q27":3,"B2Q28":4,"B2Q29":5,"B2Q30":5,"B2Q31":5,"B2Q32":4,"B2Q33":1},
            {"B2Q25":1,"B2Q26":2,"B2Q27":3,"B2Q28":4,"B2Q29":1,"B2Q30":5,"B2Q31":5,"B2Q32":4,"B2Q33":1},
        ]
        let condition = {
            $count: {
                "$constraints": [
                    {
                        "B2Q33": 5
                    },
                    {
                        "B2Q32": 5
                    },
                    {
                        "B2Q31": 5
                    },
                    {
                        "B2Q30": 5
                    },
                    {
                        "B2Q29": 5
                    },
                    {
                        "B2Q28": 5
                    },
                    {
                        "B2Q27": 5
                    },
                    {
                        "B2Q26": 5
                    },
                    {
                        "B2Q25": 5
                    }
                ],
                "$constraint": {
                        "$gt": 2
                }
            }
        }

        var result = Query.query(rows, condition, _.get)
        console.log(result.length)
    })

})