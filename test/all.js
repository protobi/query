
var assert = require('assert')
var _ = require("lodash")
var Query = require("../query")



describe("$all operator tests", function() {
  it("Elementary functions", function () {
    // Basic $all functionality
    assert.equal(Query.lhs.rhs.$all([3, 5, 7, 9], [3, 5, 7]), true) // has all three
    assert.equal(Query.lhs.rhs.$all([3, 5, 9], [3, 5, 7]), false) // missing 7
    assert.equal(Query.lhs.rhs.$all([3], [3]), true) // single element match
    assert.equal(Query.lhs.rhs.$all([3], [3, 5]), false) // missing 5

    // Empty constraint array - vacuous truth
    assert.equal(Query.lhs.rhs.$all([], []), true) // empty has all of nothing
    assert.equal(Query.lhs.rhs.$all([1, 2, 3], []), true) // anything has all of nothing
    assert.equal(Query.lhs.rhs.$all(null, []), true) // null has all of nothing

    // Scalar values treated as single-element arrays
    assert.equal(Query.lhs.rhs.$all(5, [5]), true)
    assert.equal(Query.lhs.rhs.$all(5, [5, 7]), false)

    // Type coercion (like $in)
    assert.equal(Query.lhs.rhs.$all(["3", 5, 7], [3, 5]), true) // "3" == 3

    return assert(true)
  })

  it("Patient conditions use case", function() {
    var patients = [
      {id: 1, conditions: [3, 5, 7, 9, 11]}, // has diabetes, obesity, apnea + others
      {id: 2, conditions: [3, 5, 9]}, // has diabetes, obesity but not apnea
      {id: 3, conditions: [3, 7]}, // has diabetes, apnea but not obesity
      {id: 4, conditions: []}, // no conditions
      {id: 5, conditions: [3, 5, 7]} // has exactly the three we're looking for
    ]

    // Find patients with all of: diabetes (3), obesity (5), and apnea (7)
    var result = Query.query(patients, {conditions: {$all: [3, 5, 7]}})

    assert.equal(result.length, 2)
    assert.equal(result[0].id, 1) // has all three plus more
    assert.equal(result[1].id, 5) // has exactly the three

    return assert(true)
  })

  it("Works with Query.query", function() {
    var rows = [
      {i: 0, x: [1, 2, 3]},
      {i: 1, x: [3, 5, 7]},
      {i: 2, x: [5, 7, 9, 11]},
      {i: 3, x: []},
      {i: 4, x: [5, 7]}
    ]

    var result = Query.query(rows, {x: {$all: [5, 7]}})
    assert.deepEqual(result.map(function(row) { return row.i }), [1, 2, 4])

    // Empty constraint
    result = Query.query(rows, {x: {$all: []}})
    assert.equal(result.length, 5) // all rows match

    return assert(true)
  })
})
