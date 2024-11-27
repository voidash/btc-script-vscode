const vscode = require('vscode');
const { Stack } = require('./src/stack');
const { convertOpcode: processOpcode } = require('./src/converter');
const { opcodeList, customOpcodeList } = require('./src/opcodes');
const {Ok, Err} = require('./src/utils');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const editor = vscode.window.activeTextEditor;
	processBtcScript(editor);

	// context.subscriptions.push(disposable);
	vscode.workspace.onDidChangeTextDocument((event) => {
        if (editor && editor.document === event.document) {
			processBtcScript(editor);
        }
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
 * @enum {string}
 */
const Branch = {
	IN_IF: "if",
	IN_ELSE: "else"
}

/**
 * @typedef {Object} GlobalState
 * @property {Boolean} shouldContinue
 * @property {State} innerState
 * @property {Branch} branch
 */

/** 
* @param {vscode.TextEditor} editor
**/
function processBtcScript(editor) {
	if (!editor) return;

	const document = editor.document;
	const text = document.getText(); 
	// recognizes script! { contents }, btcscript\n contents end-btcscript\n and more
	const scriptRegex = /(script!\s*{([\s\S]*?)}|\/\/\s*(start-)?(bscript|btc-script|btcscript)(-start)?([\s\S]*?)\/\/\s*(end-)?(bscript|btc-script|btcscript)(-end)?)/gm;
	const isWhitespaceString = str => !str.replace(/\s/g, '').length;

	let match;
	const edits = [];

	while ((match = scriptRegex.exec(text)) !== null) {
		const blockStart = document.positionAt(match.index);
		const blockEnd = document.positionAt(match.index + match[0].length);

		// get the first line 
		let stackElements = document.lineAt(blockStart.line + 1).text;
		let {main, alt} = parseCommentForStacks(stackElements);
		processStack(main).println();
		processStack(alt).println();
		
		/** @type {State} */
		let innerState = {
			main: processStack(main),
			alt: processStack(alt) 
		};

		/** @type {GlobalState} */
		let globalState = {
			shouldContinue: false,
			innerState: innerState,
			branch: Branch.IN_IF 
		}
		

		for (let line = blockStart.line + 2; line < blockEnd.line; line++) {
            const lineText = document.lineAt(line).text.trim();

            if (!lineText.startsWith('//') && !isWhitespaceString(lineText)) {
				// addVirtualText(editor, line, "=> Testing", "gray");
				processLine(lineText,globalState);
				if (!globalState.shouldContinue) {
					break;
				}
            }
        }

	}
}
/**
 * accepts trimmed lineText to see if there are any OP_CODE 
 * @param {String} lineText 
 * @param {GlobalState} globalState
 * @returns {import('./src/utils').Result} 
 */
function processLine(lineText, globalState) {
	if (lineText.match(/OP_\w+/)) {
		let convertedOpcode = processOpcode(lineText);	
		let newState;

		if (convertedOpcode.val !== undefined && convertedOpcode.val !== null) {
			let opcodeFn;
			if ((opcodeFn = customOpcodeList[convertedOpcode.op]) !== undefined) {
				newState = opcodeFn(convertedOpcode.val)(globalState.innerState);
			}
		}

		let opcodeFn;
		if ((opcodeFn = opcodeList[convertedOpcode.op]) !== undefined) {
			newState = opcodeFn(globalState.innerState);
		}

		if ("error" in newState ) {
			globalState.shouldContinue = false;
			return Err(newState.error);
		} 
		globalState.innerState = newState;
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

