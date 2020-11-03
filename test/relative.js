var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


describe("Count satisfied constraints", function () {


  function getter(row, val) {
    var res
    if (typeof val == 'string') res= _.get(row, val)
    else res = val;
    return res;
  }


  it('lt', function () {
    var rows = [
      {a: 0,  x0: 0,  x1: 50, x2: 30, x4: 20},
      {a: 10, x0: 10, x1: 50, x2: 40, x4: 0},
      {a: 20, x0: 25, x1: 50, x2: 30, x4: -5},
      {a: 30, x0: 40, x1: 50, x2: 10, x4: 0},
    ]

    var r1 = Query.query(rows, { x0: {$lt: 30}})

    assert.deepEqual(
        r1,
        [rows[0], rows[1], rows[2]]
    )

    var r2 = Query.query(rows, { x0: {$lt: "x2"}}, getter)

    // assert.deepEqual(
    //     r2,
    //     [rows[0], rows[1], rows[2]]
    // )

  })
})