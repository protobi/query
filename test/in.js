
  var assert = require('assert');
  var _ = require("lodash");
  var Query = require("../query");



  describe("Underscore Query Tests", function() {
    it("Elementary functions", function () {
      assert.equal(Query.lhs.rhs.$in(3,[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in([3],[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in([3,5],[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in([1,5],[2,3,4]),false)


      assert.equal(Query.lhs.rhs.$in(9,[2,3,4]),false)
      assert.equal(Query.lhs.rhs.$in([3],[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in(["3"],[2,3,4]),true)

      assert.equal(Query.lhs.rhs.$in([1,2,3,4],[3]),true)


      return assert(true);
    });
  })
    