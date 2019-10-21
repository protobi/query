var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


describe("Count satisfied constraints", function () {
  it('counts', function () {

    var rows = [
      {
        title: "Home",
        colors: ["red", "yellow", "blue"],
        likes: 12,
        featured: true,
        content: "Dummy content about coffeescript"
      }, {
        title: "About",
        colors: ["red"],
        likes: 2,
        featured: true,
        content: "dummy content about javascript"
      }, 
      {
        title: "Contact",
        colors: ["red", "blue"],
        likes: 20,
        content: "Dummy content about PHP"
      }
    ];

    var result = Query.query(rows, {
          $count: {

            "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
            "$constraint": {$lte: 1}
          }
        },
        _.get
    )


    assert.deepEqual(
        result,
        [rows[1]]
    )

    assert.deepEqual(
        Query.query(rows, {
              $count: {

                "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
                "$constraint": {$gt: 1}
              }
            },
            _.get
        ),
        [rows[0], rows[2]]
    )

    assert.deepEqual(
        Query.query(rows, {
              $count: {

                "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
                "$constraint": 3
              }
            },
            _.get
        ),
        [rows[0]]
    )

    // var res = Query.satisfies(rows[0], {likes: {"$gt":5}}, _.get)
// var res = Query.query(rows, {likes: {"$gt":5}}, _.get)
//     var res = Query.query(rows, {title: "Home"}, _.get)
    // console.log(Query.lhs.rhs.$lt(5,4))
    //
    // var res = Query.query(rows, {likes: {"$gt":5}})
    // console.log(res)
    //
  })
})