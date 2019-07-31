
  var assert = require('assert');
  var _ = require("lodash");
  var Query = require("../query");



  describe("Underscore Query Tests", function() {
    it("Elementary functions", function () {
      assert(Query.lhs.rhs.$eq(4, 4))
      assert(Query.lhs.rhs.$eq(4, "4"))
      assert(!Query.lhs.rhs.$eq(4, "four"))
      assert(Query.lhs.rhs.$eq(4, 4.0))
      assert(!Query.lhs.rhs.$eq(null, 0))
      assert(!Query.lhs.rhs.$eq(undefined, 0))
      assert(!Query.lhs.rhs.$eq("", 0))
      assert(!Query.lhs.rhs.$eq(0, null))
      assert(!Query.lhs.rhs.$eq(0, undefined))
      assert(!Query.lhs.rhs.$eq(0, ""))
      
      assert.equal(Query.lhs.rhs.$lte(1,4),true)
      assert.equal(Query.lhs.rhs.$lte(4,4),true)
      assert.equal(Query.lhs.rhs.$lte(5,4),false)
      assert.equal(Query.lhs.rhs.$lt(1,4),true)
      assert.equal(Query.lhs.rhs.$lt(4,4),false)
      assert.equal(Query.lhs.rhs.$lt(5,4),false)

      assert.equal(Query.lhs.rhs.$lt(0,4),true)
      assert.equal(Query.lhs.rhs.$lt('',4),false)
      assert.equal(Query.lhs.rhs.$lt(null,4),false)
      assert.equal(Query.lhs.rhs.$lt(undefined,4),false)

      assert.equal(Query.lhs.rhs.$lte(0,4),true)
      assert.equal(Query.lhs.rhs.$lte('',4),false)
      assert.equal(Query.lhs.rhs.$lte(null,4),false)
      assert.equal(Query.lhs.rhs.$lte(undefined,4),false)

      assert.equal(Query.lhs.rhs.$gte(0,-1),true)
      assert.equal(Query.lhs.rhs.$gte('',-1),false)
      assert.equal(Query.lhs.rhs.$gte(null,-1),false)
      assert.equal(Query.lhs.rhs.$gte(undefined,-1),false)

      

      assert.equal(Query.lhs.rhs.$gt(0,-1),true)
      assert.equal(Query.lhs.rhs.$gt('',-1),false)
      assert.equal(Query.lhs.rhs.$gt(null,-1),false)
      assert.equal(Query.lhs.rhs.$gt(undefined,-1),false)


      assert.equal(Query.lhs.rhs.$in(3,[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in(9,[2,3,4]),false)
      assert.equal(Query.lhs.rhs.$in([3],[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in([3,5],[2,3,4]),true)
      assert.equal(Query.lhs.rhs.$in([1,5],[2,3,4]),false)



      return assert(true);
    });
  })
    