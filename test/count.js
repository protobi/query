var assert = require('assert')
var _ = require("lodash");
var Query = require("../query");


describe("Count satisfied constraints", function () {

  it('$same', function() {
    var rows = [
      {x0: 0, x1: 0, x2: 1, x3: 0, x4: 1, x5: 0, x6: 0, x6_other: "whoa"},
      {x0: 0, x1: 0, x2: 0, x3: 0, x4: 0, x5: 0, x6: 0, x6_other: "yikes"},
      {x0: 1, x1: 1, x2: 1, x3: 1, x4: 1, x5: 1, x6: 1, x6_other: "easy"}
    ]

    var result = Query.query(rows, {
          $same: ['x0','x1','x2','x3','x4','x5','x6']
        },
        _.get
    )
    console.log(result)

    assert.deepEqual(
        result,
        [rows[1],rows[2]]
    )

  })
  it('$count', function () {

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