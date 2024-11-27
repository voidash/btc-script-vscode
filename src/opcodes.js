let {Stack} = require('./stack');
let {to_number, deepCopy, ResultException} = require('./utils');


/**
 * @typedef {Object} StateError 
 * @property {String} error
 * @property {State} state
 * 
 * @param {String} message 
 * @param {State} state 
 * @returns {StateError}
 */
function error(message, state) {
    return { error: message, state: state };
}
  
  
/**
 * @typedef {Object} State
 * @property {Stack} main
 * @property {Stack} alt
 * @property {boolean} [if_result]
 * 
 */

/**
 * @typedef {Object} OpcodeFunction
 * @type {function(State): State | StateError}
 * A function that takes a `State` and returns a new `State` or a `StateError`.
 * 
 * @typedef {Object<string, OpcodeFunction>} OpcodeList
 * An object mapping opcode names (e.g., "OP_0NOTEQUAL") to their implementation functions.
 */

/**
 * @type {OpcodeList}
 */
 const opcodeList = {
    /**
     * OP_0NOTEQUAL
     * @param {State} state
     * @returns {State | StateError} 
     * pop [main] => top
     * if top != 0 { push 1 => [main] } else { push 0 => [main]}
    */
    "OP_0NOTEQUAL": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for 0NOTEQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
      const val = new_state.main.pop();
  
      const num_val = to_number(val);
      new_state.main.push(num_val !== 0 ? 1 : 0);
      return new_state;
      } catch(err_val) {
        return error(err_val, state);
      }
    },
  
    /** OP_1ADD
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => top
    * push top + 1 => [main]
    */
    "OP_1ADD": function(state) {
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        let num = to_number(a);
        new_state.main.push(num + 1);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /**
    * OP_1SUB
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => top
    * push top - 1 => [main]
    */
    "OP_1SUB": function(state) {
    const new_state = deepCopy(state);
    try{
      const a = new_state.main.pop();
  
      const num_a = to_number(a);
      new_state.main.push(num_a - 1);
      return new_state;
    } catch (err_a) {
        return error(err_a, state);
    }
    },
  
    /**
    * OP_2DROP
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => top
    * pop [main] => second_top 
    */
    "OP_2DROP": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for 2DROP", state);
      }
      const new_state = deepCopy(state);
      try{
        new_state.main.pop();
        new_state.main.pop();
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_2DUP
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek [main] => top
    * peek 2nd [main] => second
    * push top => [main]
    * push second => [main]
    */
    "OP_2DUP": function(state) {
      if (state.main.size() < 2) {
        return error("requires two items for 2DUP", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.peek();
        const b = new_state.main.peekNth(1);
        new_state.main.push(b);
        new_state.main.push(a);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_2OVER
    * copies the 4th and 3rd element to top of stack
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 3 [main] => third
    * peek 4 [main] => fourth 
    * push fourth => [main]
    * push third => [main]
    */
    "OP_2OVER": function(state) {
      if (state.main.size() < 4) {
        return error("requires four items for 2OVER", state);
      }
      const new_state = deepCopy(state);
      try{
        const third = new_state.main.peekNth(2);
        const fourth = new_state.main.peekNth(3);
        new_state.main.push(fourth);
        new_state.main.push(third);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_2ROT
    * Rotates the 6th and 5th items to top of stack. 5th item on top of stack
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => 1
    * pop [main] => 2
    * pop [main] => 3
    * pop [main] => 4
    * pop [main] => 5
    * pop [main] => 6
    * 
    * push 4 => [main]
    * push 3 => [main]
    * push 2 => [main]
    * push 1 => [main]
    * push 6 => [main]
    * push 5 => [main]
    */
    "OP_2ROT": function(state) {
      if (state.main.size() < 6) {
        return error("Need six items for 2ROT", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
        const c = new_state.main.pop();
        const d = new_state.main.pop();
        const e = new_state.main.pop();
        const f = new_state.main.pop();
    
        new_state.main.push(d);
        new_state.main.push(c);
        new_state.main.push(b);
        new_state.main.push(a);
        new_state.main.push(f);
        new_state.main.push(e);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
    /** 
    * OP_2SWAP
    * Swaps the top two pairs of stack items. 1st and 2nd items exhange place with 3rd and 4th. 
    * 3rd element will be on top of stack
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => 1
    * pop [main] => 2
    * pop [main] => 3
    * pop [main] => 4
    * 
    * push 2 => [main]
    * push 1 => [main]
    * push 4 => [main]
    * push 3 => [main]
    */
   "OP_2SWAP": function(state) {
      if (state.main.size() < 4) {
        return error("Need four items for 2SWAP", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
        const c = new_state.main.pop();
        const d = new_state.main.pop();
    
        new_state.main.push(b);
        new_state.main.push(a);
        new_state.main.push(d);
        new_state.main.push(c);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_3DUP
    * Duplicate top three items on stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 1 [main] => a
    * peek 2 [main] => b 
    * peek 3 [main] => c 
    * push c => [main]
    * push b => [main]
    * push a => [main]
    */
    "OP_3DUP": function(state) {
      if (state.main.size() < 3) {
        return error("Need three items for 3DUP", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.peek();
        const b = new_state.main.peekNth(1);
        const c = new_state.main.peekNth(2);
        new_state.main.push(c);
        new_state.main.push(b);
        new_state.main.push(a);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_ABS
    * changes the top item on stack to its absolute value, removing the negative sign 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => top
    * push abs(top) => [main]
    */
    "OP_ABS": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for ABS", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.main.pop();
        const num_val = to_number(val);
        new_state.main.push(Math.abs(num_val));
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_ADD
    * pops two items from stack, adds it and returns sum to stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => a
    * pop [main] => b 
    * push (a+b) => [main]
    */
    "OP_ADD": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for ADD", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b + num_a);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
      
    },
  
    /** 
    * OP_BOOLAND
    * Pop two items from stack. Pushes 1 if both are not zero; otherwise pushes 0 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => a
    * pop [main] => b 
    * out <= if a != 0 AND b != 0 then { 1 } else { 0 }
    * push out => [main]
    */
    "OP_BOOLAND": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for BOOLAND", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_a !== 0 && num_b !== 0 ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_BOOLOR
    * Pop two items from stack. If one of them is not zero, then output is 1 else 0
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => a
    * pop [main] => b 
    * out <= if a != 0 OR b != 0 then { 1 } else { 0 }
    * push out => [main]
    */
    "OP_BOOLOR": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for BOOLOR", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_a !== 0 || num_b !== 0 ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_CAT
    * Concats two strings, disabled 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => a
    * pop [main] => b 
    * push (a || b) => [main]
    */
    "OP_CAT": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for CAT", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        new_state.main.push(`${String(a)}||${String(b)}`);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_CHECKMULTISIG
    * verifies multiple signatures against a set of public keys. 
    * Requires 'm', then we pop 'm' number of pubkeys then 
    * Requires 'n', then we pop 'n' number of signatures. 
    * There is also a dummy element at the end according to https://en.bitcoin.it/wiki/Script#Crypto
    * 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => m
    * for i to m {
    *   pop [main]  => pubkeys[i]
    * }
    * pop [main] => n
    * for i to m {
    *   pop [main] => signatures[i]
    * }
    * push 1 for now to simulate succesful verification
    * 
    */
    "OP_CHECKMULTISIG": function(state) {
      if (state.main.size() < 1) {
        return error("Need number of pubkeys for CHECKMULTISIG", state);
      }
      const new_state = deepCopy(state);
  
      
    //Get number of pubkeys
    try {
      const n_pubkeys = new_state.main.pop();
      const num_pubkeys = to_number(n_pubkeys);

    // Check if we have enough items for pubkeys
      if (new_state.main.size() < num_pubkeys) {
        return error("Stack underflow: not enough pubkeys", state);
      }
     
    // Remove pubkeys
      for (let i = 0; i < num_pubkeys; i++) {
        new_state.main.pop();
      }
   
     // Get number of signatures
      if (new_state.main.size() < 1) {
        return error("Need number of signatures", state);
      }
      const n_sigs = new_state.main.pop();
      const num_sigs = to_number(n_sigs);
      
     // Check if we have enough items for signatures
      if (new_state.main.size() < num_sigs) {
        return error("Stack underflow: not enough signatures", state);
      }
  
     // Remove signatures
      for (let i = 0; i < num_sigs; i++) {
        new_state.main.pop();
      }
       
      // Remove the extra dummy element that Bitcoin requires
      if (new_state.main.size() < 1) {
        return error("Need dummy element", state);
      }
      new_state.main.pop();
  
      // Always push 1 to simulate successful verification
      new_state.main.push(1);
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /**
    * OP_CHECKMULTISIGVERIFY
    * same as OP_CHECKMULTISIG but with OP_VERIFY 
    * 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => m
    * for i to m {
    *   pop [main]  => pubkeys[i]
    * }
    * pop [main] => n
    * for i to m {
    *   pop [main] => signatures[i]
    * }
    * push 1 for now to simulate succesful verification
    * 
    */
    "OP_CHECKMULTISIGVERIFY": function(state) {
      if (state.main.size() < 1) {
        return error("Need number of pubkeys for CHECKMULTISIGVERIFY", state);
      }
      const new_state = deepCopy(state);
      try {
        // Get number of pubkeys
        const n_pubkeys = new_state.main.pop();
        const num_pubkeys = to_number(n_pubkeys);
    
        // Check if we have enough items for pubkeys
        if (new_state.main.size() < num_pubkeys) {
            return error("Stack underflow: not enough pubkeys", state);
        }
    
        // Remove pubkeys
        for (let i = 0; i < num_pubkeys; i++) {
            new_state.main.pop();
        }
    
        // Get number of signatures
        if (new_state.main.size() < 1) {
            return error("Need number of signatures", state);
        }
        const n_sigs = new_state.main.pop();
        const num_sigs = to_number(n_sigs);
    
        // Check if we have enough items for signatures
        if (new_state.main.size() < num_sigs) {
            return error("Stack underflow: not enough signatures", state);
        }
    
        // Remove signatures
        for (let i = 0; i < num_sigs; i++) {
            new_state.main.pop();
        }
    
        // Remove the extra dummy element that Bitcoin requires
        if (new_state.main.size() < 1) {
            return error("Need dummy element", state);
        }
        new_state.main.pop();
    
        // Always push 1 to simulate successful verification
        new_state.main.push(1);
    
        // Verify the result
        const val = new_state.main.pop();
        const num_val = to_number(val);
    
        if (num_val === 0) {
            return error("Verification failed", state);
        }
    
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_CHECKSIG
    * Verifies if the provided signature matches the public key for the tx hash.  
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * POP [main] => pubkey
    * POP [main] => signature
    * verify and always simulate successful verification 
    */
    "OP_CHECKSIG": function(state) {
      if (state.main.size() < 2) {
        return error("Need pubkey and signature for CHECKSIG", state);
      }
      const new_state = deepCopy(state);
      try {
      new_state.main.pop(); // pubkey
      new_state.main.pop(); // signature
  
      // Always push 1 to simulate successful verification
      new_state.main.push(1);
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_CHECKSIGADD
    * verifies a signature against a public key and adds the result on top of stack element 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * POP [main] => pubkey
    * POP [main] => signature
    * POP [main] => count
    * verify and add count to it 
    * PUSH (1 or 0) + count => [main]
    */
    "OP_CHECKSIGADD": function(state) {
      if (state.main.size() < 3) {
        return error("Need number, pubkey, and signature for CHECKSIGADD", state);
      }
      const new_state = deepCopy(state);
      try {
        new_state.main.pop(); // pubkey
        new_state.main.pop(); // signature
        const n = new_state.main.pop(); // current count
    
        const num_n = to_number(n);
    
        // Always add 1 to simulate successful signature check
        new_state.main.push(num_n + 1);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_CHECKSIGVERIFY
    * Verifies a signature against a public key. Pushes nothing but script is failed if verification is invalid  
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * POP [main] => pubkey
    * POP [main] => signature
    * verify if it matches otherwise fail the script  
    */
    "OP_CHECKSIGVERIFY": function(state) {
      if (state.main.size() < 2) {
        return error("Need pubkey and signature for CHECKSIGVERIFY", state);
      }
      const new_state = deepCopy(state);
      try {
      new_state.main.pop(); // pubkey
      new_state.main.pop(); // signature
  
      // Always push 1 to simulate successful verification
      new_state.main.push(1);
  
      // Verify the result
      const val = new_state.main.pop();
      const num_val = to_number(val);
      if (num_val === 0) {
        return error("Verification failed", state);
      }
  
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_DEPTH
    * pushes the current number of stack items onto stack
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * len_stack = len([main])
    * push len_stack => [main]
    */
    "OP_DEPTH": function(state) {
      const new_state = deepCopy(state);
      new_state.main.push(new_state.main.size());
      return new_state;
    },
  
    /** 
    * OP_DROP
    * Drops the first element in the stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => dropped 
    */
    "OP_DROP": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for DROP", state);
      }
      const new_state = deepCopy(state);
      try {
        new_state.main.pop();
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_DUP
    * Duplicates the top element on the stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 1 [main] => first
    * push first => [main]
    */
    "OP_DUP": function(state) {
      if (state.main.size() === 0) {
        return error("Stack underflow", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.main.peek()
        new_state.main.push(val);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_ELSE
    * else conditional branch
    * @param {State} state
    * @returns {State | StateError} 
    */
    "OP_ELSE": function(state) {
      if (state.if_result === undefined) {
        return error("ELSE without matching IF", state);
      }
      const new_state = deepCopy(state);
      new_state.if_result = !new_state.if_result;
      return new_state;
    },
  
    /** 
    * OP_ENDIF
    * ends the conditional 
    * @param {State} state
    * @returns {State | StateError} 
    */
    "OP_ENDIF": function(state) {
      const new_state = deepCopy(state);
      delete new_state.if_result;
      return new_state;
    },
  
    /** 
    * OP_EQUAL
    * returns 1 if first element is equal to b 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first == second { push 1 => [main]}  else { push 0 => [main] }
    */
    "OP_EQUAL": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for EQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        new_state.main.push(a === b ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_EQUALVERIFY
    * returns 1 if first element is equal to b otherwise script fails
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first == second { push 1 => [main]}  else { script fails }
    */
    "OP_EQUALVERIFY": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for EQUALVERIFY", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        new_state.main.push(a === b ? 1 : 0);
    
        const val = new_state.main.pop();
        const num_val = to_number(val);
    
        if (num_val === 0) {
            return error("Verification failed", state);
        }
    
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    
    },
  
    /** 
    * OP_FROMALTSTACK
    * copies from alt stack to main stack
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [alt] => elem
    * push elem => [main] 
    */
    "OP_FROMALTSTACK": function(state) {
      if (state.alt.size() === 0) {
        return error("Alt stack underflow", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.alt.pop();
        new_state.main.push(val);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_GREATERTHAN
    * returns 1 if first element is greater than or equal to b 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first > second { push 1 => [main]}  else { push 0 => [main]}
    */
    "OP_GREATERTHAN": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for GREATERTHAN", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b > num_a ? 1 : 0);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_GREATERTHANOREQUAL
    * returns 1 if first element is greater than or equal to b 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first >= second { push 1 => [main]}  else { push 0 => [main]}
    */
    "OP_GREATERTHANOREQUAL": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for GREATERTHANOREQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b >= num_a ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_HASH
    * stuff like OP_SHA1, OP_SHA256, OP_HASH256, OP_RIPEMD160 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => el
    * push Hash(el) => [main]
    */
    "OP_HASH": function(state) {
      if (state.main.size() < 1) {
        return error("Stack underflow", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.main.pop();
        new_state.main.push(`Hash(${String(val)})`);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_IF
    * runs if condition if the top stack element is 1 
    * @param {State} state
    * @returns {State | StateError} 
    */
    "OP_IF": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for IF", state);
      }
      const new_state = deepCopy(state);
      try {
        const condition = new_state.main.pop();
    
        const num_condition = to_number(condition);
    
        new_state.if_result = num_condition !== 0;
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_IFDUP
    * if the top stack value is not 0, duplicate it
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * if first != 0 { push first => [main] } 
    * 
    */
    "OP_IFDUP": function(state) {
      if (state.main.size() === 0) {
        return error("Need one item for IFDUP", state);
      }
      const new_state = deepCopy(state);

      try {
        const val = new_state.main.peek();
        const num_condition = to_number(val);
    
        if (num_condition !== 0) {
            new_state.main.push(val);
        }
    
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_LESSTHAN
    * returns 1 if first element is less than  b 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first < second { push 1 => [main]}  else { push 0 => [main]}
    */
    "OP_LESSTHAN": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for LESSTHAN", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b < num_a ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_LESSTHANOREQUAL
    * returns 1 if first element is less than or equal to b 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second 
    * if first <= second { push 1 => [main]}  else { push 0 => [main]}
    */
    "OP_LESSTHANOREQUAL": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for LESSTHANOREQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b <= num_a ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_MAX
    * pushes the max value
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * push Math.min(first , second) => first
    */
    "OP_MAX": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for MAX", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(Math.max(num_a, num_b));
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_MIN
    * pushes the minimum value
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * push Math.min(first , second) => first
    */
    "OP_MIN": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for MIN", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(Math.min(num_a, num_b));
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NEGATE
    * flip the sign of the input 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * push -(first) => [main]
    */
    "OP_NEGATE": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for NEGATE", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.main.pop();
    
        const  num_val = to_number(val);
        new_state.main.push(-num_val);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NIP
    * removes the second to top stack item 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => top
    * pop [main] => dont care 
    * push top => [main]
    */
    "OP_NIP": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for NIP", state);
      }
      const new_state = deepCopy(state);
      try {
        const top = new_state.main.pop(); // save top item
        new_state.main.pop();             // remove second item
        new_state.main.push(top);         // restore top item
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NOP
    * My favorite   
    * @param {State} state
    * @returns {State | StateError} 
    */
    "OP_NOP": function(state) {
      return state;
    },
  
    /** 
    * OP_NOT
    * if the top stack item is 0, it becomes 1 else it becomes 0
    * @param {State} state
    * @returns {State | StateError} 
    * pop [main] => top
    * push ~top => [main]
    */
    "OP_NOT": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for NOT", state);
      }
      const new_state = deepCopy(state);
      try {
      const val = new_state.main.pop();
  
      const num_val = to_number(val);
      new_state.main.push(num_val === 0 ? 1 : 0);
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NOTIF
    * Operates inversely to OP_IF if the item encountered is 0 then execute else don't
    * @param {State} state
    * @returns {State | StateError} 
    * 
    */
    "OP_NOTIF": function(state) {
    try {
        if (state.main.size() < 1) {
            return error("Need one item for NOTIF", state);
        }
        const new_state = deepCopy(state);
        const condition = new_state.main.pop();
    
        const  num_condition  = to_number(condition);
    
        new_state.if_result = num_condition === 0;
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
  
    /** 
    * OP_NUMEQUAL
    * returns 1 if first and second element are  equal otherwise return 0  
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * if first == second { push 1 => [main] } else { push 0 => [main]}
    */
    "OP_NUMEQUAL": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for NUMEQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b === num_a ? 1 : 0);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NUMEQUALVERIFY
    * returns 1 if first and second element are  equal otherwise script fails 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * if first == second { push 1 => [main] } else { script fails }
    */
    "OP_NUMEQUALVERIFY": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for NUMEQUALVERIFY", state);
      }
      const new_state = deepCopy(state);
    try {
      const a = new_state.main.pop();
      const b = new_state.main.pop();
  
      const num_a = to_number(a);
      const num_b = to_number(b);
  
      new_state.main.push(num_b === num_a ? 1 : 0);
  
      const val = new_state.main.pop();
      const num_val  = to_number(val);
  
      if (num_val === 0) {
        return error("Verification failed", state);
      }
  
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_NUMNOTEQUAL
    * returns 1 if first and second element are not equal 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * if first != second { push 1 => [main] } else { push 0 => [main] }
    */
    "OP_NUMNOTEQUAL": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for NUMNOTEQUAL", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b !== num_a ? 1 : 0);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_OVER
    * duplicates the 2nd element in the stack and places it on top of the stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 2 [main] => second
    * push second => [main]
    */
    "OP_OVER": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for OVER", state);
      }
      const new_state = deepCopy(state);
      try {
        const second = new_state.main.peekNth(1);
        new_state.main.push(second);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_PICK
    * selects the stack item and copies to top. Different from roll because this just copies whereas roll moves the item to top of the stack 
    * @param {State} state
    * @returns {State | StateError} 
    * pop [main] => nth
    * peek nth [main] => element
    * push element => [main] 
    */
    "OP_PICK": function(state) {
      if (state.main.size() < 1) {
        return error("Need index for PICK", state);
      }
      const new_state = deepCopy(state);
      try {
        const n = new_state.main.pop();
    
        const  num_n = to_number(n);
        if (new_state.main.size() < num_n + 1) {
            return error("Stack too small for PICK", state);
        }
    
        const item = new_state.main.peekNth(num_n);
        new_state.main.push(item);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_ROLL
    * selects the stack item and moves it to top . 0th index based
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => nth_index 
    * for i in 0..nth_index {
    *   pop [main] => val[i]
    * } 
    * pop [main] => picked_element 
    * for i in 0..nth_index.rev() { 
    *   push val[i]  => [main]
    * }
    * push picked_element => [main]
    */
    "OP_ROLL": function(state) {
      if (state.main.size() < 1) {
        return error("Need index for ROLL", state);
      }
      const new_state = deepCopy(state);
      try {
      const n = new_state.main.pop();
  
      const num_n = to_number(n);
  
      if (new_state.main.size() < num_n + 1) {
        return error("Stack too small for ROLL", state);
      }
  
      // pop the element from main stack to temp_stack
      let temp_stack = [];
      for (let i = 0; i < num_n; i++) {
        temp_stack.push(new_state.main.pop());
      }
      // pop the element that should go to top
      let element_to_top = new_state.main.pop(); 
      
      // push temp_stack items to main stack
      for (let i = 0; i < num_n; i++) {
        new_state.main.push(temp_stack.pop());
      }
      // push the element that should go to first
      new_state.main.push(element_to_top);
      return new_state;

      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_ROT
    * rotates the third items in the stack to top 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * pop [main] => third
    * push second => [main] // second element is now third
    * push first => [main] // first element is second
    * push third => [main] // third element is now first
    */
    "OP_ROT": function(state) {
      if (state.main.size() < 3) {
        return error("Need three items for ROT", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
        const c = new_state.main.pop();
        new_state.main.push(b);
        new_state.main.push(a);
        new_state.main.push(c);
        return new_state;
      }catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_SIZE
    * pushes the length in bytes of the top stack item's data into stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 1 [main] => first
    * n_b = num_bytes(first)
    * push n_b => [main]
    */
    "OP_SIZE": function(state) {
        if (state.main.size() < 1) {
        return error("Need one item for SIZE", state);
        }
        const new_state = deepCopy(state);
        try {
            const val = String(new_state.main.peek());
            new_state.main.push(val.length);
            return new_state;
        } catch(err) {
            return error(err, state);
        }
    },
  
    /** 
    * OP_SUB
    * Pops the first two elements in main stack and then subtracts it and pushes result to stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop  [main] => first
    * pop  [main] => second 
    * push (second - first) => [main]
    */
    "OP_SUB": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for SUB", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
    
        const num_a = to_number(a);
        const num_b = to_number(b);
    
        new_state.main.push(num_b - num_a);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_SWAP
    * swap the first and second element 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * pop [main] => second
    * push first => [main] // second element
    * push second => [main] // first element
    */
    "OP_SWAP": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for SWAP", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop();
        const b = new_state.main.pop();
        new_state.main.push(a);
        new_state.main.push(b);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_TOALTSTACK
    * moves the top stack item to alternative stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first
    * push first => [alt]
    */
    "OP_TOALTSTACK": function(state) {
      if (state.main.size() === 0) {
        return error("Stack underflow", state);
      }
      const new_state = deepCopy(state);
      try {
        const val = new_state.main.pop();
        new_state.alt.push(val);
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_TUCK
    * copies the top stack item and inserts it below the second item on stack 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => first 
    * pop [main] => second
    * push first => [main] // third item
    * push second => [main] // second item
    * push first => [main] // first item
    */
    "OP_TUCK": function(state) {
      if (state.main.size() < 2) {
        return error("Need two items for TUCK", state);
      }
      const new_state = deepCopy(state);
      try {
        const a = new_state.main.pop(); // top
        const b = new_state.main.pop(); // second
        new_state.main.push(a);         // insert top item third
        new_state.main.push(b);         // restore second
        new_state.main.push(a);         // restore top
        return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  
    /** 
    * OP_VERIFY
    * checks if the top stack item is non zero. Removes if it's true otherwise script fails 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * peek 1 [main] => first
    * if first != 0 then { pop [main] } else { script fails } 
    */
    "OP_VERIFY": function(state) {
      if (state.main.size() < 1) {
        return error("Need one item for VERIFY", state);
      }
      try {
        const new_state = deepCopy(state);
        const val = new_state.main.pop();
        const num_val  = to_number(val);
    
        if (num_val === 0) {
            return error("Verification failed", state);
        }
        return new_state;

      } catch(err) {
        return error(err, state);
      }
  
    },
  
    /** 
    * OP_WITHIN
    * checks if the top stack value is within the range [min, max) 
    * @param {State} state
    * @returns {State | StateError} 
    * 
    * pop [main] => max
    * pop [main] => min 
    * pop [main] => x
    * if x is within max and min then { PUSH 1 => [main] } else { PUSH 0 => [main]}
    * push third => [main]
    */
    "OP_WITHIN": function(state) {
      if (state.main.size() < 3) {
        return error("Need three items for WITHIN", state);
      }
      const new_state = deepCopy(state);
      try { 
      const max = new_state.main.pop();
      const min = new_state.main.pop();
      const x = new_state.main.pop();
  
      const  num_max = to_number(max);
      const  num_min = to_number(min);
      const num_x = to_number(x);
  
      new_state.main.push(num_x >= num_min && num_x < num_max ? 1 : 0);
      return new_state;
      } catch(err) {
        return error(err, state);
      }
    },
  };

/**
 * 
 * @typedef {Object} ValueProcessFn
 * @type {function(any): OpcodeFunction}
 * 
 * 
 * @typedef {Object} HigherOrderOpcodeFunction
 * @type {Object<string, ValueProcessFn>} 
 * An object mapping opcode names (e.g., "OP_0NOTEQUAL") to their implementation functions.
 */  

/**
 *  @type HigherOrderOpcodeFunction
 */
  const customOpcodeList = {
    /** 
    * OP_NUMBER
    * Numbers like OP_0, OP_FALSE , OP_2, OP_3 
    * @param {Number} num
    * @returns {(state: State) => State} 
    * 
    * peek  => third
    * peek 4 [main] => fourth 
    * push fourth => [main]
    * push third => [main]
    */
    "OP_NUMBER": function(num) {
      return function(state) {
        const new_state = deepCopy(state);
        new_state.main.push(num);
        return new_state;
      };
    },
  }

  module.exports = {
    opcodeList,
    customOpcodeList
  }