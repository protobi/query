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
    
    var result = Query.query(rows, {
          "=x0+x1+x2": 100
        },
        getter
    )
    assert.deepEqual(
        result,
        [rows[1], rows[3]]
    )
    
    var r2 = Query.query(rows, "x0<25")
    // console.log(r2)

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
  })
})