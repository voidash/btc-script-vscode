const {Ok, Err} = require('./utils');

class Stack {
	constructor() {
	  /**
	   * @type {any[]} - The items in the stack.
	   */
	  this.items = [];
	}
  
	/**
	 * Add a number to the stack.
	 * @param {any} val 
	 * @returns {Boolean} - A success result with no value.
	 */
	push(val) {
	  this.items.push(val);
	  return true ;
	}
  
	/**
	 * Take the top number off the stack.
	 * @returns {any} - A success result with the popped value, or an error result if the stack is empty.
	 */
	pop() {
	  if (this.items.length === 0) {
		Err("Oops, the stack is empty!");
	  }
	  return this.items.pop();
	}
  
	/**
	 * See what the top number is.
	 * @returns {any} - A success result with the top value, or an error result if the stack is empty.
	 */
	peek() {
	  if (this.items.length === 0) {
		Err("Oops, the stack is empty!");
	  }
	  if (this.items.length < 0) {
		Err("Oops, Negative Num");
	  }
	  return this.items[this.items.length - 1];
	}

	/**
	 * See what the top number is.
     * @param {number} elem - peeking top most element will be 0
	 * @returns {any} - A success result with the top value, or an error result if the stack is empty.
	 */
	peekNth(elem) {
	  if (this.items.length === 0) {
		Err("Oops, the stack is empty!");
	  }

	  if (this.items.length < 0) {
		Err("Oops, Negative Num"); 
	  }

      if (this.items.length <= elem) {
		Err("elem is not available");
      }

	  return this.items[this.items.length - 1 - elem];
	}
  
	/**
	 * Check if the stack is empty.
	 * @returns {boolean} - True if the stack is empty, false otherwise.
	 */
	isEmpty() {
	  return this.items.length === 0;
	}
  
	/**
	 * Find out how many items are in the stack.
	 * @returns {number} - The number of items in the stack.
	 */
	size() {
	  return this.items.length;
	}
  
	/**
	 * Print the stack contents as a string.
	 * @returns {string} - The stack contents in the format "[item1, item2, ...]".
	 */
	print() {
	  return `[${this.items.join(", ")}]`;
	}
  
	/**
	 * Print the stack contents to the console.
	 * @returns {void}
	 */
	println() {
	  console.log(this.print());
	}
  }

  module.exports = {
    Stack
  } 