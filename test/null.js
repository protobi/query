// Generated by CoffeeScript 1.8.0
(function() {

  var assert = require('assert');
  var _ = require("lodash");
  var Logic = require("../query");

  _.mixin(Logic);

  describe("Underscore Query Tests", function() {

    it("Handles false match for null", function() {
      var rows = [
        { a: 0, b:1 },
        { a: null, b:2 },
        { a: undefined, b:3 },
        { a: '', b:4 },
        { a: NaN, b:4 }
      ]
      var result = _.query(rows, { a: null});
      assert.equal(result.length,   3)


      var result = _.query(rows, { a: 0});
      assert.equal(result.length,   1)


     var result = _.query(rows, { a: ''});
     assert.equal(result.length, 3)

     var result = _.query(rows, { a: undefined});
     assert.equal(result.length, 3)

           var result = _.query(rows, { a: {$lte: 0}});
      assert.equal(result.length, 1)

      var result = _.query(rows, { a: {$lt: 0}});
      assert.equal(result.length, 0)



    });
  });

}).call(this);