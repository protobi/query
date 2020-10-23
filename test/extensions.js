var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


describe("Count satisfied constraints", function () {

  it('sums', function () {
    var rows = [
      {x0:  0, x1: 50, x2: 30},
      {x0: 10, x1: 50, x2: 40},
      {x0: 25, x1: 50, x2: 30},
      {x0: 40, x1: 50, x2: 10},
    ]

    function getter(row, val) {
      if (typeof val=='string' && val[0]=='=') {
        var fn = new Function("row", "try { with (row) { return " + val.slice(1) + "} } catch (e) { console.error(e)}")
        try {
          return fn(row)
        }
        catch (e) {
          console.error(e)
        }
      }
      else return _.get(row,val)
    }
    //
    // var result = Query.query(rows, {
    //       "=x0+x1+x2": 100
    //     },
    //     getter
    // )
    // assert.deepEqual(
    //     result,
    //     [rows[1], rows[3]]
    // )
    //
    var r2 = Query.query(rows, "x0<25")
    console.log(r2)

  })
  //
  //
  // it('$same', function () {
  //   var rows = [
  //     {x0: 0, x1: 0, x2: 1, x3: 0, x4: 1, x5: 0, x6: 0, x6_other: "whoa"},
  //     {x0: 0, x1: 0, x2: 0, x3: 0, x4: 0, x5: 0, x6: 0, x6_other: "yikes"},
  //     {x0: 1, x1: 1, x2: 1, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "easy"},
  //     {x0: 1, x1: 1, x2: null, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "um"},
  //     {x0: undefined, x1: 1, x2: '', x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "so"},
  //     {x0: 1, x1: 1, x2: undefined, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "basically"},
  //     {x0: null, x1: 0, x2: 0, x3: null, x4: 0, x5: 0, x6: 0, x6_other: "well"},
  //     {x0: null, x1: '', x2: undefined, x6_other: "well"},
  //     {x0: null, x1: '', x2: undefined, x3: 1, x6_other: "well"},
  //     {x0: null, x1: '', x2: undefined, x3: 1, x4: 0, x6_other: "well"},
  //   ]
  //
  //   var result = Query.query(rows, {
  //         $same: ['x0', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6']
  //       },
  //       _.get
  //   )
  //   assert.deepEqual(
  //       result,
  //       [rows[1], rows[2], rows[3], rows[4], rows[5], rows[6], rows[7], rows[8]]
  //   )
  //
  // })
  //
  //
  // it('$count', function () {
  //
  //   var rows = [
  //     {
  //       title: "Home",
  //       colors: ["red", "yellow", "blue"],
  //       likes: 12,
  //       featured: true,
  //       content: "Dummy content about coffeescript"
  //     }, {
  //       title: "About",
  //       colors: ["red"],
  //       likes: 2,
  //       featured: true,
  //       content: "dummy content about javascript"
  //     },
  //     {
  //       title: "Contact",
  //       colors: ["red", "blue"],
  //       likes: 20,
  //       content: "Dummy content about PHP"
  //     }
  //   ];
  //
  //   var result = Query.query(rows, {
  //         $count: {
  //           "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
  //           "$constraint": {$lte: 1}
  //         }
  //       },
  //       _.get
  //   )
  //
  //
  //   assert.deepEqual(
  //       result,
  //       [rows[1]]
  //   )
  //
  //   assert.deepEqual(
  //       Query.query(rows, {
  //             $count: {
  //
  //               "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
  //               "$constraint": {$gt: 1}
  //             }
  //           },
  //           _.get
  //       ),
  //       [rows[0], rows[2]]
  //   )
  //
  //   assert.deepEqual(
  //       Query.query(rows, {
  //             $count: {
  //
  //               "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
  //               "$constraint": 3
  //             }
  //           },
  //           _.get
  //       ),
  //       [rows[0]]
  //   )
  // })
})