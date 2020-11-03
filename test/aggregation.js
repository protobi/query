var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


describe("Count satisfied constraints", function () {

  it('sum, min, max', function () {
    var rows = [
      {x0: 0, x1: 50, x2: 30},
      {x0: 10, x1: 50, x2: 40},
      {x0: 25, x1: 50, x2: 30},
      {x0: 40, x1: 50, x2: 10},
    ]

    var r1 = Query.query(rows, {
      $expr: {
        $eq: [100, {$sum: ["x0", "x1", "x2"]}]
      }
    })

    assert.deepEqual(
        r1,
        [rows[1], rows[3]]
    )

    var r2 = Query.query(rows, {
      $expr: {
        $ne: [100, {$sum: ["x0", "x1", "x2"]}]
      }
    })

    assert.deepEqual(
        r2,
        [rows[0], rows[2]]
    )

    var r3 = Query.query(rows, {
      $expr: {
        $gte: [40, {$max: ["x0", "x2"]}]
      }
    })

    assert.deepEqual(
        r3,
        [rows[1], rows[3]]
    )

    var r4 = Query.query(rows, {
      $expr: {
        $eq: [10, {$min: ["x0", "x2"]}]
      }
    })

    assert.deepEqual(
        r4,
        [rows[1], rows[3]]
    )

  })

  it('$same', function () {
    var rows = [
      {x0: 0, x1: 0, x2: 1, x3: 0, x4: 1, x5: 0, x6: 0, x6_other: "whoa"},
      {x0: 0, x1: 0, x2: 0, x3: 0, x4: 0, x5: 0, x6: 0, x6_other: "yikes"},
      {x0: 1, x1: 1, x2: 1, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "easy"},
      {x0: 1, x1: 1, x2: null, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "um"},
      {x0: undefined, x1: 1, x2: '', x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "so"},
      {x0: 1, x1: 1, x2: undefined, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "basically"},
      {x0: null, x1: 0, x2: 0, x3: null, x4: 0, x5: 0, x6: 0, x6_other: "well"},
      {x0: null, x1: '', x2: undefined, x6_other: "well"},
      {x0: null, x1: '', x2: undefined, x3: 1, x6_other: "well"},
      {x0: null, x1: '', x2: undefined, x3: 1, x4: 0, x6_other: "well"},
    ]

    var result = Query.query(rows, {
          $expr: {

            $eq: [true, {$same: ['x0', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6']}]
          }
        },
        _.get
    )
    assert.deepEqual(
        result,
        [rows[1], rows[2], rows[3], rows[4], rows[5], rows[6], rows[7], rows[8]]
    )

  })

  it('sum, min, max', function () {
    var rows = [
      {a: 0, x0: 0, x1: 50, x2: 30, x4: 20},
      {a: 10, x0: 10, x1: 50, x2: 40, x4: 0},
      {a: 20, x0: 25, x1: 50, x2: 30, x4: -5},
      {a: 30, x0: 40, x1: 50, x2: 10, x4: 0},
    ]

    var r1 = Query.query(rows, {
      $and: [
        {
          $expr: {
            $lt: [10, {$min: ["x0", "x1", "x2"]}]
          }
        }, 
        {
          a: {$not: 0}
        }
      ]
    })

    assert.deepEqual(
        r1,
        []
    )

  })
})