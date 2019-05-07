Query
===================

A lightweight API to query Javascript arrays using MongoDB syntax in the browser and Node.js.


Installation
============

#### Browser
Query can be installed standalone, which will expose global Query object;
`<script type="text/javascript" src="query.min.js"></script>`

Query can be required using require.js:
```js
define(['query', function(Query) { ... my script ... });
```

#### Server side (node.js) installation
You can install with NPM: `npm install protobi/query`
`query = require("query");`

#### Extend _ or Array prototype
It can be convenient in your own code to extend Array or Underscore/Lodash:

```js
Array.prototype.query = function(q) { return Query.query(this, q); });
```
or
```js
_.mixin(Query);
```

Basic Usage
===========

The following are some basic examples:

```js
Query.query( MyCollection, {
    featured:true,
    likes: {$gt:10}
});
// Returns all models where the featured attribute is true and there are
// more than 10 likes

Query.query( MyCollection, {tags: { $any: ["coffeescript", "backbone", "mvc"]}});
// Finds models that have either "coffeescript", "backbone", "mvc" in their "tags" attribute

Query.query(MyCollection, {
  // Models must match all these queries
  $and:{
    title: {$like: "news"}, // Title attribute contains the string "news"
    likes: {$gt: 10}
  }, // Likes attribute is greater than 10

  // Models must match one of these queries
  $or:{
    featured: true, // Featured attribute is true
    category:{$in:["code","programming","javascript"]}
  }
  //Category attribute is either "code", "programming", or "javascript"
});
```

Or if CoffeeScript is your thing (the source is written in plain Javascript), try this:

```coffeescript
Query.query MyCollection,
  $and:
    likes: $lt: 15
  $or:
    content: $like: "news"
    featured: $exists: true
  $not:
    colors: $contains: "yellow"
```



Query API
===

### $equal
Performs a strict equality test using `===`. If no operator is provided and the query value isn't a regex then `$equal` is assumed.

If the attribute in the model is an array then the query value is searched for in the array in the same way as `$contains`

If the query value is an object (including array) then a deep comparison is performed using underscores `_.isEqual`

```javascript
_.query( MyCollection, { title:"Test" });
// Returns all models which have a "title" attribute of "Test"

_.query( MyCollection, { title: {$equal:"Test"} }); // Same as above

_.query( MyCollection, { colors: "red" });
// Returns models which contain the value "red" in a "colors" attribute that is an array.

MyCollection.query ({ colors: ["red", "yellow"] });
// Returns models which contain a colors attribute with the array ["red", "yellow"]
```

### $contains
Assumes that the model property is an array and searches for the query value in the array

```js
_.query( MyCollection, { colors: {$contains: "red"} });
// Returns models which contain the value "red" in a "colors" attribute that is an array.
// e.g. a model with this attribute colors:["red","yellow","blue"] would be returned
```

### $ne
"Not equal", the opposite of $equal, returns all models which don't have the query value

```js
_.query( MyCollection, { title: {$ne:"Test"} });
// Returns all models which don't have a "title" attribute of "Test"
```

### $lt, $lte, $gt, $gte
These conditional operators can be used for greater than and less than comparisons in queries

```js
_.query( MyCollection, { likes: {$lt:10} });
// Returns all models which have a "likes" attribute of less than 10
_.query( MyCollection, { likes: {$lte:10} });
// Returns all models which have a "likes" attribute of less than or equal to 10
_.query( MyCollection, { likes: {$gt:10} });
// Returns all models which have a "likes" attribute of greater than 10
_.query( MyCollection, { likes: {$gte:10} });
// Returns all models which have a "likes" attribute of greater than or equal to 10
```

These may further be combined:

```js
_.query( MyCollection, { likes: {$gt:2, $lt:20} });
// Returns all models which have a "likes" attribute of greater than 2 or less than 20
// This example is also equivalent to $between: [2,20]
_.query( MyCollection, { likes: {$gte:2, $lte:20} });
// Returns all models which have a "likes" attribute of greater than or equal to 2, and less than or equal to 20
_.query( MyCollection, { likes: {$gte:2, $lte: 20, $ne: 12} });
// Returns all models which have a "likes" attribute between 2 and 20 inclusive, but not equal to 12
```



### $between
To check if a value is in-between 2 query values use the $between operator and supply an array with the min and max value

```js
_.query( MyCollection, { likes: {$between:[5,15] } });
// Returns all models which have a "likes" attribute of greater than 5 and less then 15
```

### $in
An array of possible values can be supplied using $in, a model will be returned if any of the supplied values is matched

```js
_.query( MyCollection, { title: {$in:["About", "Home", "Contact"] } });
// Returns all models which have a title attribute of either "About", "Home", or "Contact"
```

### $nin
"Not in", the opposite of $in. A model will be returned if none of the supplied values is matched

```js
_.query( MyCollection, { title: {$nin:["About", "Home", "Contact"] } });
// Returns all models which don't have a title attribute of either
// "About", "Home", or "Contact"
```

### $all
Assumes the model property is an array and only returns models where all supplied values are matched.

```js
_.query( MyCollection, { colors: {$all:["red", "yellow"] } });
// Returns all models which have "red" and "yellow" in their colors attribute.
// A model with the attribute colors:["red","yellow","blue"] would be returned
// But a model with the attribute colors:["red","blue"] would not be returned
```

### $any
Assumes the model property is an array and returns models where any of the supplied values are matched.

```js
_.query( MyCollection, { colors: {$any:["red", "yellow"] } });
// Returns models which have either "red" or "yellow" in their colors attribute.
```

### $size
Assumes the model property has a length (i.e. is either an array or a string).
Only returns models the model property's length matches the supplied values

```js
_.query( MyCollection, { colors: {$size:2 } });
// Returns all models which 2 values in the colors attribute
```

### $exists or $has
Checks for the existence of an attribute. Can be supplied either true or false.

```js
_.query( MyCollection, { title: {$exists: true } });
// Returns all models which have a "title" attribute
_.query( MyCollection, { title: {$has: false } });
// Returns all models which don't have a "title" attribute
```

### $like
Assumes the model attribute is a string and checks if the supplied query value is a substring of the property.
Uses indexOf rather than regex for performance reasons

```js
_.query( MyCollection, { title: {$like: "Test" } });
//Returns all models which have a "title" attribute that
//contains the string "Test", e.g. "Testing", "Tests", "Test", etc.
```

### $likeI
The same as above but performs a case insensitive search using indexOf and toLowerCase (still faster than Regex)

```js
_.query( MyCollection, { title: {$likeI: "Test" } });
//Returns all models which have a "title" attribute that
//contains the string "Test", "test", "tEst","tesT", etc.
```

### $regex
Checks if the model attribute matches the supplied regular expression. The regex query can be supplied without the `$regex` keyword

```js
_.query( MyCollection, { content: {$regex: /coffeescript/gi } });
// Checks for a regex match in the content attribute
_.query( MyCollection, { content: /coffeescript/gi });
// Same as above
```

### $cb
A callback function can be supplied as a test. The callback will receive the attribute and should return either true or false.
`this` will be set to the current model, this can help with tests against computed properties

```js
_.query( MyCollection, { title: {$cb: function(attr){ return attr.charAt(0) === "c";}} });
// Returns all models that have a title attribute that starts with "c"

_.query( MyCollection, { computed_test: {$cb: function(){ return this.computed_property() > 10;}} });
// Returns all models where the computed_property method returns a value greater than 10.
```

For callbacks that use `this` rather than the model attribute, the key name supplied is arbitrary and has no
effect on the results. If the only test you were performing was like the above test it would make more sense
to simply use `MyCollection.filter`. However if you are performing other tests or are using the paging / sorting /
caching options of backbone query, then this functionality is useful.

### $elemMatch
This operator allows you to perform queries in nested arrays similar to [MongoDB](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24elemMatch)
For example you may have a collection of models in with this kind of data stucture:


```js
var Posts = new QueryCollection([
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
]);
```
To search for posts which have the text "really" in any of the comments you could search like this:

```js
Posts.query({
  comments: {
    $elemMatch: {
      text: /really/i
    }
  }
});
```

All of the operators above can be performed on `$elemMatch` queries, e.g. `$all`, `$size` or `$lt`.
`$elemMatch` queries also accept compound operators, for example this query searches for all posts that
have at least one comment without the word "really" and with the word "totally".
```js
Posts.query({
  comments: {
    $elemMatch: {
      $not: {
        text: /really/i
      },
      $and: {
        text: /totally/i
      }
    }
  }
});
```


### $computed
This operator allows you to perform queries on computed properties. For example you may want to perform a query
for a persons full name, even though the first and last name are stored separately in your db / model.
For example

```js
testModel = Backbone.Model.extend({
  full_name: function() {
    return (this.get('first_name')) + " " + (this.get('last_name'));
  }
});

a = new testModel({
  first_name: "Dave",
  last_name: "Tonge"
});

b = new testModel({
  first_name: "John",
  last_name: "Smith"
});

MyCollection = new QueryCollection([a, b]);

_.query( MyCollection, {
  full_name: { $computed: "Dave Tonge" }
});
// Returns the model with the computed `full_name` equal to Dave Tonge

_.query( MyCollection, {
  full_name: { $computed: { $likeI: "john smi" } }
});
// Any of the previous operators can be used (including elemMatch is required)
```

### Dot notation
Use `Query.undot` which is a getter function that parses the dots into an array of subkeys:
```js
result = _.query(collection, {
        "stats.likes": 5
      }, Query.undot);
```


### $count
Provide an array of subconstraints, count how many of  those subconstraints are satisfied,
and test whether that count satisfies a final constraint.  

A `$count` constraint takes the following form: 

```js
   
   {  
      $count: {
          $constraints:  [  <constraint>, <constraint>, ... ],   // array of subconstraints
          $constraint:  <constraint>                             // constraint on count of subconstraints
      }
  }
```

For instance, to return a list of rows for which at least two subconstraints are true:
```js
    Query.query(rows, {
              $count: {

                "$constraints": [{likes: {"$gt": 5}}, {colors: "red"}, {title: "Home"}],
                "$constraint": {$gte: 2}
              }
            }
        ),
```

For callbacks that use `this` rather than the model attribute, the key name supplied is arbitrary and has no
effect on the results. If the only test you were performing was like the above test it would make more sense
to simply use `MyCollection.filter`. However if you are performing other tests or are using the paging / sorting /
caching options of backbone query, then this functionality is useful.



Combined Queries
================

Multiple queries can be combined together. By default all supplied queries use the `$and` operator. However it is possible
to specify either `$or`, `$nor`, `$not` to implement alternate logic.

### $and

```js
_.query( MyCollection, { $and: { title: {$like: "News"}, likes: {$gt: 10}}});
// Returns all models that contain "News" in the title and have more than 10 likes.
_.query( MyCollection, { title: {$like: "News"}, likes: {$gt: 10} });
// Same as above as $and is assumed if not supplied
```

### $or

```js
_.query( MyCollection, { $or: { title: {$like: "News"}, likes: {$gt: 10}}});
// Returns all models that contain "News" in the title OR have more than 10 likes.
```

### $nor
The opposite of `$or`

```js
_.query( MyCollection, { $nor: { title: {$like: "News"}, likes: {$gt: 10}}});
// Returns all models that don't contain "News" in the title NOR have more than 10 likes.
```

### $not
The opposite of `$and`

```js
_.query( MyCollection, { $not: { title: {$like: "News"}, likes: {$gt: 10}}});
// Returns all models that don't contain "News" in the title AND DON'T have more than 10 likes.
```

If you need to perform multiple queries on the same key, then you can supply the query as an array:
```js
_.query( MyCollection, {
    $or:[
        {title:"News"},
        {title:"About"}
    ]
});
// Returns all models with the title "News" or "About".
```


Compound Queries
================

It is possible to use multiple combined queries, for example searching for models that have a specific title attribute,
and either a category of "abc" or a tag of "xyz"

```js
_.query( MyCollection, {
    $and: { title: {$like: "News"}},
    $or: {likes: {$gt: 10}, color:{$contains:"red"}}
});
//Returns models that have "News" in their title and
//either have more than 10 likes or contain the color red.
```

Getters
================
Getters may be supplied as a function.  The getter function takes two arguments, specifying an object and a key.
The example getter below behaves exactly as if no getter were provided:

```js
_.query(MyCollection, {likes: 12}, function(obj, key) { return obj[key]; });
```

Alternately, getters may be supplied as a string naming a method on the object itself, which takes a single returns a value for the key e.g.
```js
a = new Backbone.Collection([
        {
          id: 1,
          title: "test"
        }, {
          id: 2,
          title: "about"
        }
      ]);
      result = _.query(a.models, {
        title: "about"
      }, "get");
```
History
====================
This module originated as a proprietary module for Protobi core, implementing MongoDB syntax for Javascript data arrays.
As might be expected the API turned out to be  similar to another library implementing MongoDB-like syntax,
 [underscore-query](https://github.com/davidgtonge/underscore-query) by [@davidgtonge](https://github.com/davidgtonge),
 which was developed independently.  This API matches much of underscore-query's documentation,
 and the code passes most of unit tests in the underscore-query module.

Ultimately, I aim to bring this library into sync with underscore-query and merge this one away.
For now have made a few changes to make them as compatible as possible and leveraged the thorough test suite and README developed for underscore-query.

This library has few changes to more closely match MongoDB query syntax:
   - `$and` and `$or` constraints specified as linear arrays of constraint objects, rather than associative arrays, as in MongoDB
   - Recursive application of `$and` and `$or`, such that these can be used on the left hand side as in MongoDB
   - Supports `$where` clauses as in MongoDB

This also makes two non-standard extensions to MongoDB query syntax:
   - uses `==` rather than `===` as the  `$eq` comparator, to accomodate data that may have been loaded from CSV and
    thus may store numbers as strings (e.g. `"3"` vs `3`)
   - Makes dot parsing attributes optional, to support data where variable names may include embedded dots (e.g. `802.11g`)

It does not do some useful extensions that underscore-query offers:
   - Chaining to build query objects
   - Scoring
   - Pass the current object model as `this` to `$cb` functions (here, use the $where clause for that)
   - Support `$computed` (here use the `$where` clause for this)

There are also a few implementation differences:
* This library is not tied to underscore or lodash, although it will use them for `$deepEquals` if they are present,
otherwise it reverts to a simple string comparison of `JSON.stringify()` results.
* The library can be included via AMD (Require.js), CommonJS (Node.js) or directly `<script>` tag.
