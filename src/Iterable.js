
/*
* Iterable is used internally to provide functional style methods to indexed collections.
* The contract a collection must follow to inherit from Iterable is:
* - Exposing a property named items, the Array representation of the collection.
* - Either specify a fromArray method or override _createNew so that new collections 
* can be built from an existing instance.
* 
* None of the Iterable methods mutates the collection.
*
* For any method accepting a callback or predicate as a parameter, you need to ensure
* the value of 'this' inside the method is either bound or not used.
*/
var Iterable = function() {};

/*
* The current Array representation of the collection.
* It should be considered read-only and never modified directly.
*/
Iterable.prototype.items = null;

/*
* Returns the number of items in this collection. 
*/
Iterable.prototype.size = function() {
   return this.items.length;
};

/*
* Indicates whether this collection is empty.
*/
Iterable.prototype.isEmpty = function() {
   return this.size() == 0;
};

/*
* Returns the item located at the specified index.
*/
Iterable.prototype.itemAt = function(index) {
   return this.items[index];
};

/*
* Returns the first item of this collection.
*/
Iterable.prototype.first = function() {
   return this.items[0];
};

/*
* Returns the last item of this collection.
*/
Iterable.prototype.last = function() {
   return this.items[this.items.length - 1];
};

/*
* Applies a function to all items of this collection.
*/
Iterable.prototype.each = function(callback) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      this._invoke(callback, i, i);
   }
};

/*
* Builds a new collection by applying a function to all items of this collection.
*
* ArrayMap will require that you return [key, value] tuples to create a new ArrayMap.
*
* Note: If you intended to invoke filter and map in succession 
* you can merge these operations into just one map() call
* by returning Collection.NOT_MAPPED for the items that shouldn't be in the final collection.
*/
Iterable.prototype.map = function(callback) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      var mapped = this._invoke(callback, i);
      if (mapped != Collection.NOT_MAPPED) result.push(mapped);
   }
   return this._createNew(result);
};

Collection.NOT_MAPPED = {};

/*
* Builds a List of the extracted properties of this collection of objects.
* This is a special case of map(). The property can be arbitrarily nested.
*/
Iterable.prototype.pluck = function(property) {
   var doPluck = getPluckFunction(property);
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      result.push(doPluck(this.items[i]));
   }
   return List.fromArray(result);
}

/*
* Selects all items of this collection which satisfy a predicate.
*/
Iterable.prototype.filter = function(predicate) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) result.push(this.items[i]);
   }
   return this._createNew(result);
};

/*
* Counts the number of items in this collection which satisfy a predicate.
*/
Iterable.prototype.count = function(predicate) {
   var count = 0;
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) count++;
   }
   return count;
};

/*
* Finds the first item of the collection satisfying a predicate, if any.
*/
Iterable.prototype.find = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) return this.items[i];
   }
   return undefined;
};

/*
* Finds the first item of this collection of objects that owns a property set to a given value.
* This is a special case of find(). The property can be arbitrarily nested.
*/
Iterable.prototype.findBy = function(property, value) {
   var doPluck = getPluckFunction(property);
         
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (doPluck(this.items[i]) === value) return this.items[i];
   }
   return undefined;
};

/*
* Tests whether a predicate holds for some of the items of this collection.
*/
Iterable.prototype.some = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) return true;
   }
   return false;
};

/*
* Tests whether a predicate holds for all items of this collection.
*/
Iterable.prototype.every = function(predicate) {
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (!this._invoke(predicate, i)) return false;
   }
   return true;
};

/*
* Partitions items in fixed size collections.
*/
Iterable.prototype.grouped = function(size) {
   var groups = [];
   var current = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      current.push(this.items[i]);

      if ((current.length === size) || (i === length - 1)) {
         groups[groups.length] = this._createNew(current);
         current = [];
      }
   }
   return List.fromArray(groups);
};

/*
* Partitions this collection into a map of Lists according to a discriminator function.
*/
Iterable.prototype.groupBy = function(discriminator) {
   var groups = Map();
   for (var i = 0, length = this.items.length; i < length; i++) {
      var item = this.items[i];
      var itemGroup = this._invoke(discriminator, i);
      var group = groups.get(itemGroup);
      if (!group) groups.put(itemGroup, List());
      groups.get(itemGroup).add(item);
   }
   return groups;
};

/*
* Folds the items of this collection using the specified operator.
*/
Iterable.prototype.fold = function(initialValue, operator) {
   var result = initialValue;
   for (var i = 0, length = this.items.length; i < length; i++) {
      result = this._invoke(operator, i, result);
   }
   return result;
};

/*
* Partitions this collection in two collections according to a predicate.
* The first element of the returned Array contains the items that satisfied the predicate.
*/
Iterable.prototype.partition = function(predicate) {
   var yes = [], no = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      (this._invoke(predicate, i) ? yes : no).push(this.items[i]);
   }
   return [this._createNew(yes), this._createNew(no)];
};

/*
* Selects all items except the first n ones.
*/
Iterable.prototype.drop = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(n));
};

/*
* Selects all items except the last n ones.
*/
Iterable.prototype.dropRight = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(0, this.items.length - n));
};

/*
* Drops items till the predicate no longer hold.
*/
Iterable.prototype.dropWhile = function(predicate) {
   var result = this.items.slice();
   var index = 0;
   while (result.length && this._invoke(predicate, index)) {
      result.shift();
      index++;
   }
   return this._createNew(result);
};

/*
* Selects the first n items.
*/
Iterable.prototype.take = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(0, n));
};

/*
* Selects the last n items.
*/
Iterable.prototype.takeRight = function(n) {
   n = Math.min(n, this.items.length);
   return this._createNew(this.items.slice(-n));
};

/*
* Selects items till the predicate no longer hold.
*/
Iterable.prototype.takeWhile = function(predicate) {
   var result = [];
   for (var i = 0, length = this.items.length; i < length; i++) {
      if (this._invoke(predicate, i)) result.push(this.items[i]);
      else break;
   }
   return this._createNew(result);
};

/*
* Returns a new collection with the items in reversed order.
*/
Iterable.prototype.reverse = function() {
   return this._createNew(this.items.slice().reverse());
};

/*
* Selects an interval of items.
*/
Iterable.prototype.slice = function(start, end) {
   return this._createNew(this.items.slice(start, end));
};

/*
* Returns a new sorted collection.
* The sort is stable.
*
* An option Object can be passed to modify the sort behavior.
* All options are compatible with each other.
* The supported options are:
*
* ignoreCase: Assuming strings are going to be sorted, ignore their cases. Defaults to false.
*
* localCompare: Assuming strings are going to be sorted,
*   handle locale-specific characters correctly at the cost of reduced sort speed. Defaults to false.
*
* by: Assuming objects are being sorted, a String (See pluck) or Function either pointing to or computing the value 
*   that should be used for the sort. Defaults to null.
*
* reverse: Reverse the sort. Defaults to false.
*/
Iterable.prototype.sorted = function(options) {
   var o = options || {},
       by = o.by !== undefined ? o.by : null,
       localeCompare = o.localeCompare !== undefined ? o.localeCompare : false,
       ignoreCase = o.ignoreCase !== undefined ? o.ignoreCase : false,
       reverse = o.reverse !== undefined ? o.reverse : false,
       result = [],
       mapped = [],
       missingData = [],
       sortFunction,
       item;

   if (isString(by)) by = getPluckFunction(by);

   for (var i = 0, length = this.items.length; i < length; i++) {
      item = this.items[i];

      if (by && item)
         item = by(item);

      if (item === null || item === undefined || item === '') {
         missingData.push(item);
         continue;
      }

      if (ignoreCase)
         item = item.toUpperCase();

      mapped.push({
         index: i,
         value: item
      });
   }

   if (localeCompare) {
      sortFunction = function(a, b) {
         if (a.value !== b.value) {
            return a.value.localeCompare(b.value);
         }
         return a.index < b.index ? -1 : 1;
      };
   }
   else {
      sortFunction = function(a, b) {
         if (a.value !== b.value) {
            return (a.value < b.value) ? -1 : 1;
         }
         return a.index < b.index ? -1 : 1;
      };
   }

   mapped.sort(sortFunction);

   for (var i = 0, length = mapped.length; i < length; i++) {
      result.push(this.items[mapped[i].index]);
   }

   if (missingData.length) 
      result = result.concat(missingData);

   if (reverse) 
      result.reverse();

   return this._createNew(result);
};

/*
* Displays all items of this collection as a string.
*/
Iterable.prototype.mkString = function(start, sep, end) {
   return start + this.items.join(sep) + end;
};

/*
* Converts this collection to a List.
*/
Iterable.prototype.toList = function() {
   return List.fromArray(this.items);
};

/*
* Converts this collection to an Array.
* If you do not require a new Array instance, consider using the items property instead.
*/
Iterable.prototype.toArray = function() {
   return cloneArray(this.items);
};

/*
* Creates a (shallow) copy of this collection.
*/
Iterable.prototype.clone = function() {
   return this._createNew(this.items.slice());
};

Iterable.prototype.toString = function() {
   return this.constructor.typeName + '(' + this.items.join(', ') + ')';
};

/**
* Creates a new Iterable of the same kind but with a specific set of items.
* The default implementation simply delegates to the type constructor's fromArray factory method.
* Some iterables may override this method to better prepare the newly created instance.
*/
Iterable.prototype._createNew = function(array) {
   return this.constructor.fromArray(array);
};

/**
* Invokes a function for a particular item index.
* This indirection is required as different clients of Iterable may require
* the callbacks and predicates to be called with a specific signature. For instance,
* an associative collection would invoke the function with a key and a value as parameters.
* This default implementation simply call the function with the current item.
*/
Iterable.prototype._invoke = function(func, forIndex, extraParam) {
   return func(this.items[forIndex], extraParam);
};


var getPluckFunction = function(property) {
   var propertyChain = property.split('.');
   if (propertyChain.length == 1)
      return function(item) {
         return item[propertyChain[0]];
      };
   else
      return function(item) {
         var i = 0, currentContext = item, length = propertyChain.length;
         while (i < length) {
            if (currentContext == null && i != length) return undefined;
            currentContext = currentContext[propertyChain[i]];
            i++;
         }
         return currentContext;
      };
};


Collection.Iterable = Iterable;   