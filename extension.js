const vscode = require('vscode');
const { Stack } = require('./src/stack');
const { convertOpcode: processOpcode } = require('./src/converter');
const { opcodeList, customOpcodeList } = require('./src/opcodes');
const {Ok, Err, ResultException} = require('./src/utils');


/**
 * 
 * @param {vscode.ExtensionContext} context 
 * @param {import('vscode').TextEditor} editor 
 */
function activate_inner(context,editor) {
	let processor;
	if (editor.document.languageId === "rust") {
		processor = processBtcScriptInRustFile;
	}

	if (editor.document.languageId === "bitcoinscript") {
		processor = processBtcScript;
	}

	processor(editor);
	vscode.workspace.onDidChangeTextDocument((event) => {
		if (editor && editor.document === event.document) {
			processor(editor);
		}
	})
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const editor = vscode.window.activeTextEditor;
	activate_inner(context, editor); 

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		activate_inner(context, editor);
	})
}

/**
 * Adds virtual text at the end of the line
 * @param {vscode.TextEditor} editor
 * @param {Number} line
 * @param {String} hintText
 * @param {String} color
 */
function addVirtualText(editor, line, hintText, color) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: hintText, // Text to display inline
            color: color, // Customize the color
            fontStyle: 'italic', // Optional: Add styling like italics
        },
    });

    const range = new vscode.Range(
        new vscode.Position(line, Number.MAX_SAFE_INTEGER), // End of the line
        new vscode.Position(line, Number.MAX_SAFE_INTEGER)
    );

    // Apply the decoration
    editor.setDecorations(decorationType, [{ range }]);

	vscode.workspace.onDidChangeTextDocument(() => {
        decorationType.dispose();
    });
}

// This method is called when your extension is deactivated
function deactivate() {}


/**
 * @typedef {Object} GlobalState
 * @property {Boolean} shouldContinue
 * @property {Boolean} shouldRender
 * @property {State} innerState
 */

/**
 * 
 * @param {import('vscode').TextEditor} editor 
 * @returns 
 */
function processBtcScript(editor) {
	if (!editor) return;
	const document = editor.document;
	let text = document.getText();

	handleScript(editor, 0, document.lineCount, 0);
}

/** 
* @param {vscode.TextEditor} editor
**/
function processBtcScriptInRustFile(editor) {
	if (!editor) return;

	const document = editor.document;
	const text = document.getText(); 
	// recognizes script! { contents }, btcscript\n contents end-btcscript\n and more
	const scriptRegex = /(script!\s*{([\s\S]*?)}|\/\/\s*(start-)?(bscript|btc-script|btcscript)(-start)?([\s\S]*?)\/\/\s*(end-)?(bscript|btc-script|btcscript)(-end)?)/gm;

	let match;
	const edits = [];

	while ((match = scriptRegex.exec(text)) !== null) {
		const blockStart = document.positionAt(match.index);
		const blockEnd = document.positionAt(match.index + match[0].length);
		handleScript(editor, blockStart.line, blockEnd.line,1);
	}
}

/**
 * 
 * @param {import('vscode').TextEditor} editor 
 * @param {Number} startLineNum 
 * @param {Number} stopLineNum 
 * @param {Number} offset 
 * 
 */
function handleScript(editor, startLineNum, stopLineNum, offset) {
		let document = editor.document;
		let firstLine = document.lineAt(startLineNum + offset).text;
		let stacks = parseCommentForStacks(firstLine);
		const isWhitespaceString = str => !str.replace(/\s/g, '').length;

		if (stacks === null ){
			return; 
		}
		
		/** @type {State} */
		let innerState = {
			main: processStack(stacks.main),
			alt: processStack(stacks.alt) 
		};

		/** @type {GlobalState} */
		let globalState = {
			shouldContinue: true,
			shouldRender: true,
			innerState: innerState,
		}
		

		for (let line = startLineNum + 1 + offset; line < stopLineNum; line++) {
            const lineText = document.lineAt(line).text.trim();

            if (!lineText.startsWith('//') && !isWhitespaceString(lineText)) {
				try {
					let processedLine = processLine(lineText,globalState);
					if (processedLine.ok) {
						if(globalState.shouldContinue) {
							addVirtualText(editor, line, ` =>  ${globalState.innerState.main.print()} ${globalState.innerState.alt.print()}`, "gray");
						}
					}
				} catch(err){
					addVirtualText(editor, line, ` => ${err.message} `, "red");
					break;
				}
            }
        }
}
/**
 * 
 * @param {import('./src/converter').convertedOp} convertedOpcode 
 * @param {GlobalState} globalState 
 * @returns 
 */

/**
 * accepts trimmed lineText to see if there are any OP_CODE 
 * @param {String} lineText 
 * @param {GlobalState} globalState
 * @throws {ResultException}
 * @returns {import('./src/utils').Result} 
 */
function processLine(lineText, globalState) {
	let matchedText = lineText.match(/(OP_\w+|\b0[oO][0-7]+\b|\b0[xX][0-9a-fA-F]+\b|\b\d+\b)(?=,)?/);
	console.log(matchedText);
	if (matchedText) {
		let convertedOpcode = processOpcode(matchedText[0]);	
		let newState;

		if (convertedOpcode.val !== undefined && convertedOpcode.val !== null) {
			let opcodeFn;
			if ((opcodeFn = customOpcodeList[convertedOpcode.op]) !== undefined) {
				let s = opcodeFn(convertedOpcode.val);
				newState = s(globalState.innerState);
			}
		}

		let opcodeFn;
		let processed = false;
		if ((opcodeFn = opcodeList[convertedOpcode.op]) !== undefined) {
			// check if convertedOpcode is OP_IF 
			switch (convertedOpcode.op) {
				case "OP_IF":
				case "OP_NOTIF":
					newState = opcodeFn(globalState.innerState);
					// if error is not present in newState
					if (!("error" in newState)) {
						globalState.shouldContinue = newState.if_result;
					}
					globalState.shouldRender = false;
					processed = true;
					break;
				case "OP_ELSE":
					globalState.shouldContinue = !globalState.shouldContinue;
					globalState.shouldRender = false;
					processed = false;
					break;
				case "OP_ENDIF":
					newState = opcodeFn(globalState.innerState);
					globalState.shouldRender = false;
					globalState.shouldContinue = true;
					processed = true;
					break;
				default:
					globalState.shouldRender = true;
					if (globalState.shouldContinue){
						newState = opcodeFn(globalState.innerState);
						processed = true;
					} else {
						processed = false;
					}
					break;
			}
		}
		if (processed) {
			if ("error" in newState ) {
				globalState.shouldContinue = false;
				Err(newState.error);
			} else {
				globalState.innerState = newState;
				return Ok(true);
			}
		} else {
				return Ok(true);
		}
	} else {
		let matchedText = lineText.match(/\d+(?=,)?/);
		if (matchedText) {
			// WIP: for other stuff like script expansion, more comments  
		}
		return Ok(true);
	}

}


/**
 * @typedef {import('./src/opcodes').State} State
 * 
 * parses comment string to give main and alt stacks
 * @param {String} comment 
 */
function parseCommentForStacks(comment) {
	// we have main stack and alt stack. so they will be represented in format 
	// TwoStacks = [A, B] [C]
	// SingleStack = [A, B]
	let twoStacks = comment.match(/\s*(\[[^\]]*])(?:,)?\s*(\[[^\]]*])/);
	let mainStack, altStack;

	if (twoStacks) {
		mainStack = twoStacks[1];
		altStack = twoStacks[2];
	}else {
		// there is a single stack
		let singleStack = comment.match(/\s*(\[[^\]]*])/);

		if(singleStack) {
			mainStack = singleStack[1];
			altStack = "[]";
		}else {
			return null;
		}
	}

	return {
		main: mainStack,
		alt:  altStack 
	}
} 


/** 
* convert string stacks to Stack type  
* @param {string} stackStr
* @returns {Stack} 
*/
function processStack(stackStr) {
	const items = new Stack();
    const contentMatch = stackStr.match(/\[([^\]]*)\]/);
    if (contentMatch && contentMatch[1].trim().length > 0) {
      // Split by commas, ignoring whitespace
      contentMatch[1].split(/\s*,\s*/).forEach((item) => {
        if (item.trim().length > 0) {
          items.push(item.trim());
        }
      });
    }
    return items;
}


module.exports = {
	activate,
	deactivate
}

