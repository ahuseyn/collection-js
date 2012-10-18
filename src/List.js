
/*
* An ordered collection backed by an Array.
* List has access to all Sequence and Iterable methods.
* List can be seen as a richer Array.
*/
var List = createType('List', Sequence);

List.fromArray = function(array) {
	return List.apply(null, array);
};

List.prototype._init = function() {
	this.items = cloneArray(arguments);
};

List.prototype.items = null;

/*
* Appends the item at the last position of this list.
*/
List.prototype.add = function(item) {
	this.items.push(item);
	return this;
};

/*
* Adds the item at a specific index.
*/
List.prototype.addAt = function(item, index) {
	this._assertRange(index);
	this.items.splice(index, 0, item);
	return this;
};

/*
* Replaces the item at the given index with a new value.
*/
List.prototype.update = function(index, item) {
	this._assertRange(index);
	var previousItem = this.items[index];
	if (previousItem !== item) {
		this.items[index] = item;
	}
	return this;
};

/*
* Inserts an item in this sorted list using binary search according
* to the same sortFunction that was used to sort the list
* or that matches the current item ordering.
*/
List.prototype.insert = function(item, sortFunction) {
	sortFunction = sortFunction || this._defaultSortFunction;
	var low = 0, high = this.size();
	while (low < high) {
   	var mid = (low + high) >> 1;
      sortFunction(item, this.items[mid]) > 0 
      	? low = mid + 1
      	: high = mid;
   }
   this.addAt(item, low);
   return this;
};

/*
* Removes the item from this list.
*/
List.prototype.remove = function(item) {
	var index = this.indexOf(item);
	if (index > -1) {
		return this.items.splice(index, 1)[0];
	}
	return false;
};

/*
* Removes and returns the item located at the specified index.
*/
List.prototype.removeAt = function(index) {
	var item = this.items.splice(index, 1)[0];
	return item;
};

/*
* Removes the first item from this list.
* This is the mutable version of Iterable's drop(1).
*/
List.prototype.removeFirst = function() {
	this._assertNotEmpty('removeFirst');
	return this.removeAt(0);
};

/*
* Removes the last item from this list.
* This is the mutable version of Iterable's dropRight(1).
*/
List.prototype.removeLast = function() {
	this._assertNotEmpty('removeLast');
	return this.removeAt(this.items.length - 1);
};

/*
* Removes all items from this list.
*/
List.prototype.removeAll = function() {
	var size = this.size();
	if (size > 0) {
		this.items.splice(0, size);
	}
	return this;
};

/*
* Removes all items satisfying a predicate from this list.
* Returns the List of removed items.
* This is a mutable, reversed version of Iterable's filter.
*/
List.prototype.removeIf = function(predicate) {
	var removed = [];
	for (var i=0, length=this.items.length; i < length; i++) {
		if (predicate(this.items[i])) {
			removed.push(this.items[i]);
			this.items.splice(i, 1);
			i--;
		}
	}
	return List.fromArray(removed);
};

/*
* Sorts this list by using a sort function.
* The signature for the sort function is the same as for Arrays'.
*/
List.prototype.sort = function(sortFunction) {
	this.items.sort(sortFunction);
	return this;
};

/*
* Sorts this list by comparing the items transformed by an extractor function.
* The extractor function would typically return a property of each item or compute a value.
*/
List.prototype.sortBy = function(extractor) {
	var self = this;
	this.items.sort(function(a, b) {
		var A = extractor(a), B = extractor(b);
		return (A < B) ? -1 : (A > B) ? +1 : 0;
	});
	return this;
};

/*
* Converts this list to a Set.
*/
List.prototype.toSet = function() {
	return Set.fromArray(this.items);
};

List.prototype._defaultSortFunction = function(a, b) {
	return (a < b) ? -1 : (a > b) ? 1 : 0;
};

List.prototype._assertRange = function(index) {
	if (index < 0 || index > this.size()) {
		throw new Error('Illegal insertion at index ' + index + ' in List with size ' + (this.size() - 1));
	}
};


Collection.List = List;