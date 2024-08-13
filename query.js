(function () {
  function objectify(a) {
    var rows = [];
    for (var key in a) {
      var o = {};
      o[key] = a[key];
      rows.push(o);
    }
    return rows;
  }

  function isNA(val) {
    return val === '' || val === undefined || val === null
  }

  function notNA(val) {
    return val !== '' && val !== undefined && val !== null
  }

  function _get(row, key, getter) {
    if (typeof key == 'number') return key;
    else if (getter) return getter(row, key)
    else return row[key]
  }

// polyfill, since String.startsWith is part of ECMAScript 6,
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (searchString, position) {
        position = position || 0;
        return this.lastIndexOf(searchString, position) === position;
      }
    });
  }

// polyfill, since String.endsWith is part of ECMAScript 6,
  if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
      value: function (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      }
    });
  }

  // should turn this function around so it works more like this
  //
  // var truth = Query(q).satisfies(obj)

  var Query = {

    satisfies: function (row, constraints, getter) {
      if (typeof constraints === 'string') return this.Query(constraints, getter)(row)
      else return Query.lhs._rowsatisfies(row, constraints, getter);
    },

    Query: function (constraints, getter) {
      return function (row) {
        return Query.lhs._rowsatisfies(row, constraints, getter);
      }
    },

    join: function (left_rows, right_rows, left_key, right_key) {
      var leftKeyFn, rightKeyFn;
      if (typeof left_key == 'string') leftKeyFn = function (row) {
        return row[left_key];
      }
      else leftKeyFn = left_key;

      if (!right_key) rightKeyFn = leftKeyFn;
      if (typeof right_key == 'string') rightKeyFn = function (row) {
        return row[left_key];
      }
      else rightKeyFn = right_key;

      return left_rows;
    },

    query: function (rows, constraints, getter) {
      if (typeof getter == 'string') {
        var method = getter;
        getter = function (obj, key) {
          return obj[method](key);
        };
      }
      var filter = new Query.Query(constraints, getter);
      return (rows||[]).filter(filter);
    },

    lhs: { // queries that are not yet referenced to a particular attribute, e.g. {$not: {likes: 0}}

      // test whether a row satisfies a constraints hash,
      _rowsatisfies: function (row, constraints, getter) {
        for (var key in constraints) {
          if (this[key]) {
            if (!this[key](row, constraints[key], getter)) return false;
          }
          else {
            var val = (getter ? getter(row, key) : row[key]);
            var res = this.rhs._satisfies(val, constraints[key], row, getter)
            if (!res) return false;
          }
        }
        return true;
      },

      /**
       * Custom extension that returns true iff the number of given constraints satisfied by this row equals a given number.
       * This can be used to test logic of the form "Exactly N of the following statements are true"
       * @param row
       * @param condition
       * @param getter
       * @returns {*}
       */
      $count: function (row, condition, getter) {
        let subconditions = condition.$conditions || condition.$constraints
        var res = subconditions.map(function (c) {
          return Query.satisfies(row, c, getter);
        }).filter(function (v) {return v}).length
        return this.rhs._satisfies(res, condition.$constraint)
      },

      /**
       * Custom extension that returns true iff all values in an array are equal (ignoring empty string, null and undefined).
       * This can be used to test if a survey respondent gave all the same answer to a particular set of questions.
       *
       * @method $same
       * @param row
       * @param condition
       * @param getter
       * @returns {boolean}
       */

      $same: function (row, condition, getter) {
        if (Array.isArray(condition)) {
          var vals = condition
              .map(function (key) {
                return (getter ? getter(row, key) : row[key])
              })
              .filter(notNA)

          if (vals.length == 0) return true;
          for (var i = 0; i < vals.length; i++) {
            if (vals[i] != vals[0]) return false
          }
          return true
        }
        throw new Error("$same requires array value ")
      },

      $not: function (row, constraint, getter) {
        return !this._rowsatisfies(row, constraint, getter);
      },

      $or: function (row, constraint, getter) {
        if (!Array.isArray(constraint)) {
          constraint = objectify(constraint);
        }
        for (var i = 0; i < constraint.length; i++) {
          if (this._rowsatisfies(row, constraint[i], getter)) return true;
        }
        return false;
      },

      $and: function (row, constraint, getter) {
        if (!Array.isArray(constraint)) {
          constraint = objectify(constraint);
        }

        for (var i = 0; i < constraint.length; i++) {
          if (!this._rowsatisfies(row, constraint[i], getter)) return false;
        }
        return true;
      },

      $nor: function (row, constraint, getter) {
        return !this.$or(row, constraint, getter)
      },

      $where: function (row, fnDef) {
        throw new Error("$where constraints no longer supported")
        // var fn
        // if (typeof fnDef === 'function') fn = fnDef;
        // else if (typeof fnDef == 'string') {
        //   fn = new Function(
        //       "row", "process", "module", "exports", "__dirname", "__filename", "require", "console", "setImmediate", "setTimeout", "setInterval", "global", "WebAssembly",
        //       fnDef
        //   )
        // }
        // else fn = _.identity
        // var res = fn.call(row)
        // return res;
      },

      $expr: function (row, expr, getter) {
        var val;
        var result = true

        for (var key in expr) {
          if (this.rhs[key]) {
            var parts = expr[key]
            var constraint = parts[0]
            var aggrexp = parts[1]

            var operation = Object.keys(aggrexp)[0]
            var operands = aggrexp[operation]
            var value = this.agg[operation](row, operands, getter)
            result = result && this.rhs[key](value, constraint)

          }
        }
        return result;
      },

      /**
       * Partial implementation of MongoDB aggregate expressions
       */
      agg: {
        $sum: function (row, operands, getter) {
          var sum = 0;
          for (var i = 0; i < operands.length; i++) {
            var key = operands[i]
            var val = _get(row, key, getter)
            if (val == +val) {
              sum += +val;
            }
          }
          return sum;
        },

        $min: function (row, operands, getter) {
          var min = +Infinity;
          for (var i = 0; i < operands.length; i++) {
            var key = operands[i]
            var val = _get(row, key, getter)
            if (val == +val) val = +val;
            if (val < min) {
              min = val
            }
          }
          return min;
        },

        $max: function (row, operands, getter) {
          var max = -Infinity;
          for (var i = 0; i < operands.length; i++) {
            var key = operands[i]
            var val = _get(row, key, getter)
            if (val == +val) val = +val;
            if (val > max) {
              max = val
            }
          }
          return max;
        },

        $divide: function (row, operands, getter) {
          var num = _get(row, operands[0], getter)
          var den = _get(row, operands[1], getter)
          return num / den
        },

        $same: function (row, condition, getter) {
          if (Array.isArray(condition)) {
            var vals = condition
                .map(function (key) {
                  return (getter ? getter(row, key) : row[key])
                })
                .filter(notNA)

            if (vals.length == 0) return true;
            for (var i = 0; i < vals.length; i++) {
              if (vals[i] != vals[0]) return false
            }
            return true
          }
          throw new Error("$same requires array value ")
        },
      },

      rhs: {  // queries that reference a particular attribute, e.g. {likes: {$gt: 10}}

        $cb: function (value, constraint) {
          return constraint(value)
        },

        // test whether a single value matches a particular constraint
        _satisfies: function (value, constraint, row, getter) {
          if (constraint === value) return true;
          if (typeof value === 'string') {
            if (((value[0] === '[') || (value[0] === '{'))) {
              try {
                value = JSON.parse(value)
              }
              catch (e) {
              }
            }
          }
          if (constraint instanceof RegExp)  return this.$regex(value, new RegExp(constraint))
          else if (Array.isArray(constraint)) return this.$in(value, constraint);
          else if (constraint && typeof constraint === 'object') {
            if (constraint instanceof Date) return this.$eq(value, constraint.getTime())
            else if (constraint.$regex) return this.$regex(value, new RegExp(constraint.$regex, constraint.$options))
            else if (constraint instanceof RegExp) return this.$regex(value, constraint)
            else {
              for (var key in constraint) {
                if (!this[key]) return this.$eq(value, constraint, row, getter)
                else if (!this[key](value, constraint[key], row, getter)) return false;
              }
              return true;
            }
          }
          else if (constraint === '' || constraint === null || constraint === undefined) return this.$null(value);
          else if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++)
              if (this.$eq(value[i], constraint)) return true;
            return false;
          }

          else return this.$eq(value, constraint, row, getter);
        },

        $eq: function (value, constraint) {

          if (value === constraint) return true;
          else if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++)
              if (this.$eq(value[i], constraint)) return true;
            return false;
          }
          else if (constraint === null || constraint === undefined || constraint === '') {
            return this.$null(value);
          }
          else if (value === null || value === '' || value === undefined) return false; //we know from above the constraint is not null
          else if (value instanceof Date) {

            if (constraint instanceof Date) {
              return value.getTime() == constraint.getTime();
            }
            else if (typeof constraint == 'number') {
              return value.getTime() == constraint;
            }
            else if (typeof constraint == 'string') return value.getTime() == (new Date(constraint)).getTime()
          }
          else {
            return value == constraint
          }
        },

        $exists: function (value, constraint) {
          return (value != undefined) == (constraint && true);
        },

        $deepEquals: function (value, constraint) {
          if (typeof _ == 'undefined' || typeof _.isEqual == 'undefined') {
            return JSON.stringify(value) == JSON.stringify(constraint); //
          }
          else {
            return _.isEqual(value, constraint);
          }
        },

        $not: function (values, constraint) {
          return !this._satisfies(values, constraint);

        },

        $ne: function (values, constraint) {
          return !this._satisfies(values, constraint);
        },

        $nor: function (values, constraint) {
          return !this.$or(values, constraint);
        },

        $and: function (values, constraint) {

          if (!Array.isArray(constraint)) {
            throw new Error("Logic $and takes array of constraint objects");
          }
          for (var i = 0; i < constraint.length; i++) {
            var res = this._satisfies(values, constraint[i]);
            if (!res) return false;
          }
          return true;
        },

        // Identical to $in, but allows for different semantics
        $or: function (values, constraint) {

          if (!Array.isArray(values)) {
            values = [values];
          }

          for (var v = 0; v < values.length; v++) {
            for (var i = 0; i < constraint.length; i++) {
              if (this._satisfies(values[v], constraint[i])) {
                return true;
              }
            }
          }

          return false;
        },

        /**
         * returns true if all of the values in the array are null
         * @param values
         * @returns {boolean}
         */
        $null: function (values) {
          var result;
          if (values === '' || values === null || values === undefined) {
            return true;
          }
          else if (Array.isArray(values)) {
            if (values.length == 0) return true;
            for (var v = 0; v < values.length; v++) {
              if (!this.$null(values[v])) {
                return false;
              }
            }
            return true;
          }
          else return false;
        },

        /**
         * returns true if any of the values are keys of the constraint
         * @param values
         * @param constraint
         * @returns {boolean}
         */
        $in: function (values, constraint) {
          if (!Array.isArray(constraint)) throw new Error("$in requires an array operand");
          var result = false;
          if (!Array.isArray(values)) {
            values = [values];
          }
          for (var v = 0; v < values.length; v++) {
            var val = values[v];
            for (var i = 0; i < constraint.length; i++) {
              if (constraint.indexOf(val) >= 0 || this._satisfies(val, constraint[i])) {
                result = true;
                break;
              }
            }
          }

          return result;
        },

        $likeI: function (values, constraint) {
          return String(values).toLowerCase().indexOf(constraint) >= 0;
        },

        $like: function (values, constraint) {
          return values.indexOf(constraint) >= 0;
        },

        $startsWith: function (values, constraint) {
          if (!values) return false;
          return values.startsWith(constraint);
        },

        $endsWith: function (values, constraint) {
          if (!values) return false;
          return values.endsWith(constraint);
        },

        $elemMatch: function (values, constraint) {
          if (Array.isArray(values)) {
            for (var i = 0; i < values.length; i++) {
              if ( Query.lhs.rhs._satisfies(values[i], constraint)) return true
            }
            return false;
          }
          else return Query.lhs.rhs._satisfies(values, constraint)
        },

        $contains: function (values, constraint) {
          return values.indexOf(constraint) >= 0;
        },

        $nin: function (values, constraint) {
          return !this.$in(values, constraint);
        },

        $regex: function (values, constraint) {
          var result = 0;

          if (Array.isArray(values)) {
            for (var i = 0; i < values.length; i++) {
              //see https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
              if ((new RegExp(constraint)).test(values[i])) {
                return true;
              }
            }
          }
          else return constraint.test(values);
        },

        $gte: function (values, ref) {

          if (Array.isArray(values)) {
            var self = this;
            return values.every(function (v) {
              return self.$gte(v, ref)
            })
          }

          return !this.$null(values) && values >= this.resolve(ref)
        },

        $gt: function (values, ref) {
          if (Array.isArray(values)) {
            var self = this;
            return values.every(function (v) {
              return self.$gt(v, ref)
            })
          }
          return !this.$null(values) && values > this.resolve(ref);
        },

        $lt: function (values, ref) {
          if (Array.isArray(values)) {
            var self = this;
            return values.every(function (v) {
              return self.$lt(v, ref)
            })
          }
          return !this.$null(values) && values < this.resolve(ref);
        },

        $lte: function (values, ref) {
          if (Array.isArray(values)) {
            var self = this;
            return values.every(function (v) {
              return self.$lte(v, ref)
            })
          }
          return !this.$null(values) && values <= this.resolve(ref);
        },

        $before: function (values, ref) {
          if (typeof ref === 'string') ref = Date.parse(ref);
          if (typeof values === 'string') values = Date.parse(values);
          return this.$lte(values, ref)
        },

        $after: function (values, ref) {
          if (typeof ref === 'string') ref = Date.parse(ref);
          if (typeof values === 'string') values = Date.parse(values);

          return this.$gte(values, ref)
        },

        $type: function (values, ref) {
          return typeof values == ref;
        },

        $all: function (values, ref) {
          throw new Error("$all not implemented")
        },

        $size: function (values, ref) {
          return (typeof values == 'object' && (values.length == ref || Object.keys(values).length == ref));
        },

        $mod: function (values, ref) {
          return values % ref[0] == ref[1]
        },

        $equal: function () {
          return this.$eq(arguments);
        },

        $between: function (values, ref) {
          return this._satisfies(values, {$gt: ref[0], $lt: ref[1]})
        },

        resolve: function (ref) {
          if (typeof ref === 'object') {
            if (ref["$date"]) return Date.parse(ref["$date"])
          }
          return ref;
        }
      }
    }
  };

  // Provide means to parse dot notation for deep Mongo queries, optional for performance
  Query.undot = function (obj, key) {
    var keys = key.split('.'), sub = obj;
    for (var i = 0; i < keys.length; i++) {
      sub = sub[keys[i]]
    }
    return sub;
  };

  // dot notation for deep Mongo queries including arrays, optional for performance
  Query.undotArray = function (obj, key) {
    var keys = key.split('.'), sub = obj;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (Array.isArray(sub)) {
        var intKey = parseInt(key);
        if (!isNaN(intKey)) {
          // Array key was a number e.g some.path.5
          sub = sub[intKey];
        }
        else {
          // Prop name was not a number
          if (Array.isArray(sub[0])) {
            // Array of arrays - flatten
            sub = sub.reduce(function (result, element) {
              return result.concat(element);
            }, []);
          }
          // must be a prop name from object within the array
          sub = sub.map(function (value) {
            // Recursive to handle multiple nested arrays
            return Query.undotArray(value, key);
          });
        }
      }
      else {
        sub = sub[key];
      }
    }
    return sub;
  };

  Query.lhs.rhs.$equal = Query.lhs.rhs.$eq;
  Query.lhs.rhs.$any = Query.lhs.rhs.$or;
  Query.lhs.rhs.$all = Query.lhs.rhs.$and;

  Query.valueSatisfiesConstraint = function (value, constraint) {
    return this.lhs.rhs._satisfies(value, constraint)
  }

  // PSV 2020-05-15 Removed per PR#1
  // Array.prototype.query = function (q) {
  //   return Query.query(this, q);
  // }

  //This allows a query object with regex values to be serialized to JSON
  //http://stackoverflow.com/questions/12075927/serialization-of-regexp
  //However, it doesn't solve the problem of parsing them back to regex on input
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  if (typeof module != 'undefined') module.exports = Query;
  else if (typeof define != 'undefined' && define.amd) define('query', [], function () {
    return Query;
  })
  else if (typeof window != 'undefined') window.Query = Query;
  else if (typeof GLOBAL != undefined && GLOBAL.global) GLOBAL.global.Query = Query;

  return Query;
})(this);
