
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

      return assert(true);
    });
  })
    