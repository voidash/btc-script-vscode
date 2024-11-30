/**
 * @typedef {Object} convertedOp
 * @property {String} op
 * @property {any} [val]
 *  
 * Convert real number opcode to generic number opcode 
 * @param {String} opcode 
 * @returns{convertedOp}
 */
function convertNumbers(opcode) {
	if(opcode.match(/OP_\w+/)) {
		switch (opcode) {
			case "OP_0":
			case "OP_FALSE":
				return { op: "OP_NUMBER", val: 0}
			case "OP_1NEGATE":
				return { op: "OP_NUMBER", val: -1}
			case "OP_1":
			case "OP_TRUE":
				return { op: "OP_NUMBER", val: 1}
			case "OP_2":
				return { op: "OP_NUMBER", val: 2}
			case "OP_3":
				return { op: "OP_NUMBER", val: 3}
			case "OP_4":
				return { op: "OP_NUMBER", val: 4}
			case "OP_5":
				return { op: "OP_NUMBER", val: 5}
			case "OP_6":
				return { op: "OP_NUMBER", val: 6}
			case "OP_7":
				return { op: "OP_NUMBER", val: 7}
			case "OP_8":
				return { op: "OP_NUMBER", val: 8}
			case "OP_9":
				return { op: "OP_NUMBER", val: 9}
			case "OP_10":
				return { op: "OP_NUMBER", val: 10}
			case "OP_11":
				return { op: "OP_NUMBER", val: 11}
			case "OP_12":
				return { op: "OP_NUMBER", val: 12}
			case "OP_13":
				return { op: "OP_NUMBER", val: 13}
			case "OP_14":
				return { op: "OP_NUMBER", val: 14}
			case "OP_15":
				return { op: "OP_NUMBER", val: 15}
			case "OP_16":
				return { op: "OP_NUMBER", val: 16}
		}
	}

	if(opcode.match(/(0[oO][0-7]+\b|\b0[xX][0-9a-fA-F]+\b|\b\d+\b)(?=,)?/)) {
		// convert opcode to 	
		let num = eval(opcode);
		console.log(num)
		if (num.toString(2).length <= 4160) {
			return { op: "OP_PUSHBYTES", val: num }
		}
	}
	return {op : opcode} 
}

/**
 * Convert real hash opcode to generic hash opcode 
 * @param {String} opcode 
 * @returns {String}
 */
function convertHash(opcode) {
	switch (opcode.trim()) {
		case "OP_RIPEMD160":
		case "OP_SHA1":
		case "OP_SHA256":
		case "OP_HASH160":
		case "OP_HASH256":
			return "OP_HASH"
	}
	return opcode
}

/**
 * Opcodes that requires more studying or just can be ignored in simulation
 * @param {String} opcode 
 * @returns {String}
 */
function convertNop(opcode) {
	switch (opcode.trim()) {
		case "OP_CHECKLOCKTIMEVERIFY":
		case "OP_CHECKSEQUENCEVERIFY":
		case "OP_PUSHDATA1": // requires more thought on if adding this to simulation makes sense
		case "OP_PUSHDATA2":
		case "OP_PUSHDATA4":
		case "OP_CODESEPARATOR":
			return "OP_NOP"
	}
	return opcode
}

/**
 * convert operations according to the opcode definition. 
 * Stuff like sha256, ripemd160, hash160, hash256 is converted into OP_HASH
 * OP_CODESEPARATOR, OP_CHECKLOCKTIMEVERIFY, OP_CHECKSEQUENCEVERIFY, OP_PUSHDATA1 etc are convered to OP_NOP
 * OP_FALSE, OP_TRUE, OP_2...OP_16 etc will be converted to OP_NUM
 * @param {String} opcode 
 * @returns {convertedOp}
 */
function convertOpcode(opcode) {
    return convertNumbers(convertHash(convertNop(opcode)))
}


module.exports = {
 convertOpcode
} 