var assert = require('assert');
var _ = require("lodash");
var Query = require("../query");

_.mixin(Query);


describe("Underscore Query Tests", function () {
  it("Elementary functions", function () {

    assert.equal(Query.lhs.rhs._satisfies(10,
        {
          $gte: 8,
          $lte: 17
        }
    ), true)

    assert.equal(Query.lhs.rhs.$elemMatch(
        25,
        {
          $gte: 8,
          $lte: 17
        }
    ), false)

    assert.equal(Query.lhs.rhs.$elemMatch(
        [
          10,
          11,
          25
        ], {
          $gte: 12,
          $lte: 17
        }
    ), false)


    assert.equal(Query.lhs.rhs._satisfies(
        [
          10,
          11,
          25
        ], {
          $gte: 12,
          $lte: 17
        }
    ), false)


  });

  it("Elementary functions", function () {
    var rows = [
      {x: [5, 10, 25]},
      {x: [10, 11, 15]},
      {x: [1, 3, 5]},
      {x: [1, 3, 50]}
    ]

    var result = Query.query(rows, {
      x: {
        $elemMatch: {
          $gte: 8,
          $lte: 17
        }
      }
    })
    assert.equal(result.length, 2)

    assert.deepEqual(result, [{x: [5, 10, 25]}, {x: [10, 11, 15]}])

    var result = Query.query(rows, {
      x: {
        $gte: 8,
        $lte: 17
      }
    })
    console.log('result',result)

    assert.equal(result.length, 1)
    assert.deepEqual(result, [ {x: [10, 11, 15]}])

  });

  it("$elemMatch", function () {

    var a, b, result, text_search;
    a = [
      {
        title: "Home",
        comments: [
          "I like this post", "I love this post", "I hate this post"

        ]
      },
      {
        title: "About",
        comments: [
          "I like this page", "I love this page", "I really like this page"

        ]
      },
      {
        title: "About",
        comments: [
          "Not bad", "Quite good", "Seen worse", "Don't hate it"
        ]
      }
    ];

    result = _.query(a, {
      comments: {
        $elemMatch: {
          $likeI: "love"
        }
      }
    });

    assert.equal(result.length, 2);

    result = _.query(a, {
      comments: {
        $likeI: "love"
      }
    });

    assert.equal(result.length, 2);

    result = _.query(a, {
      comments: /post/
    });


    assert.equal(result.length, 1);
    result = Query.query(a, {
      $or: {
        comments: {
          $elemMatch: {
            text: /post/
          }
        },
        title: /about/i
      }
    })

    assert.equal(result.length, 2);
    result = _.query(a,
        {
          comments: {
            $elemMatch: /really/
          }
        });
    assert.equal(result.length, 1);

    var rows = [
      {title: "Home", comments:[
        {text:"I like this post"},
        {text:"I love this post"},
        {text:"I hate this post"}
      ]},
      {title: "About", comments:[
        {text:"I like this page"},
        {text:"I love this page"},
        {text:"I really like this page"}
      ]}
    ];
    result = _.query(rows, {
      comments: {
        $elemMatch: {
          text: "I really like this page"
        }
      }
    });
    assert.equal(result.length, 1);

    result = _.query(rows, {
      comments: {
        $elemMatch: {
          text: /really/i
        }
      }
    });
    assert.equal(result.length, 1);
  })
})
