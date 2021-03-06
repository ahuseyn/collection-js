
/*
* An unordered collection that does not allow duplicates.
*
* Unlike with plain JS objects used as sets, any JS primitive or object can
* be added to a Set.
*
* The default behavior of a Set containing objects is to use reference equality;
* This behavior can be changed to user-defined equality by creating the Set using Set.withKey().
*/
var Set = createType('Set');

/*
* Creates a new Set containing all the specified array items.
*/
Set.fromArray = function(array) {
   return Set.apply(null, array);
};

/*
* Creates a new Set which uses a key function to determine whether
* it contains an item, as opposed to using reference equality.
*/
Set.withKey = function(keyFunction) {
   var items = slice.call(arguments, 1);
   return Set(keyArgs(keyFunction, items));
};

Set.prototype.map = null;

Set.prototype._init = function() {
   var keyFunction = getKeyFunction(arguments);
   var items = getArgs(arguments);
   this.map = Map.withKey(keyFunction);
   
   for (var i = 0, length = items.length; i < length; i++) {
      this.add(items[i]);
   }
};

/*
* Adds the item to this set if it is not already present.
* Returns true if the item was added, false if it was already in this set.
*/
Set.prototype.add = function(item) {
   if (this.contains(item)) return false;
   this.map.put(item, 1); 
   return true;
};

/*
* Tests whether this set contains the specified item.
*/
Set.prototype.contains = function(item) {
   return this.map.containsKey(item);
};

/*
* Removes the item from this set.
* Returns true if the item was removed, false if the item was not in this set.
*/
Set.prototype.remove = function(item) {
   return (this.map.remove(item) == 1);
};

/*
* Removes all items satisfying a predicate.
*/
Set.prototype.removeIf = function(predicate) {
   this.map.removeIf(predicate);
   return this;
};

/*
* Removes all items from this set.
*/
Set.prototype.removeAll = function() {
   this.map.removeAll();
   return this;
};

/*
* Applies a function to all items of this set.
*/
Set.prototype.each = function(callback) {
   this.map.each(callback)
};

/*
* Returns the number of items in this set. 
*/
Set.prototype.size = function() {
   return this.map.size();
};

/*
* Computes the union between this set and another set.
* Returns a set consisting of the items that are in this set or in the other set.
*/
Set.prototype.union = function(that) {
   var result = Set();
   this.each(function(item) {result.add(item)});
   that.each(function(item) {result.add(item)});
   return result;
};

/*
* Computes the intersection between this set and another set.
* Returns a set consisting of the items that are both in this set and in the other set.
*/
Set.prototype.intersect = function(that) {
   var contains = bind(that.contains, that); // Never going to use prototypes again...
   return this._filter(contains);
};

/*
* Computes the difference of this set and another set.
* Returns a set containing the items of this set that are not also contained in the other set.
*/  
Set.prototype.diff = function(that) {
   var contains = bind(that.contains, that);
   return this._filter(not(contains));
};

Set.prototype._filter = function(predicate) {
   var result = Set();
   this.each(function(item) {
      if (predicate(item)) result.add(item);
   });
   return result;
};

/*
* Converts this set to a List.
*/
Set.prototype.toList = function() {
   return this.map.keys();
};

/*
* Converts this set to an Array.
*/
Set.prototype.toArray = function() {
   return this.toList().items;
};

/*
* Creates a copy of this set.
*/
Set.prototype.clone = function() {
   return Set.withKey.apply(null,
      [this.map.getId].concat(this.map.keys().items));
};

Set.prototype.toString = function() {
   return 'Set(' + this.toArray().join(', ') + ')';
};


Collection.Set = Set;