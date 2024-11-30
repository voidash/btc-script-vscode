<img src="https://github.com/user-attachments/assets/55760071-d7f5-4bae-b388-3ebb4b3838e1"  width="240" align="right" style="margin-top:-70px">

# [`BitcoinScriptVscode`](https://marketplace.visualstudio.com/items?itemName=AshishThapa.btc-script)  🔗🔥

[VScode plugin](https://marketplace.visualstudio.com/items?itemName=AshishThapa.btc-script) for Bitcoin Script within Rust files and (<b><i>.btc</i></b>) files.

Download it now: [BitcoinScriptVscode](https://marketplace.visualstudio.com/items?itemName=AshishThapa.btc-script)


![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Features 🍙

- **Syntax Highlighting**: Added the textmate language grammar. Highlighting works on `.rs` files as the grammar is injected for Rust files 
- **Instant Feedback**: The stack content changes are shown on the right side with virtual text
- **Simple**: Just add in the `[main stack]` and `[alt stack]` on top of your script

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## How it works 🛠️

<img src="https://github.com/user-attachments/assets/bb2c9699-9272-40af-afeb-cbb18d215ecf" width="500" alt="extension working" align="center">

The first line should be in one of these formats:
- `[A, B]` (just the main stack)
- `[A, B] [C]` (the main stack and the alt-stack)

### Inside `script!` ✍️

```rust
pub fn u8_extract_1bit() -> Script {
    script! {
        // [1,2], [3,4]
        OP_DUP
        OP_ADD
        256
        OP_2DUP
        OP_GREATERTHANOREQUAL
        OP_IF
            OP_SUB
            1
        OP_ELSE
            OP_DROP
            0
        OP_ENDIF
    }
}
```

### Inside `//btc-script` comment block 📝

```
// btc-script
  [3,4]
  OP_DUP
  OP_TOALTSTACK
// end-btc-script
```

### On `.btc` file 💼 
You can also create a `.btc` file and then on top of the file. Add your main and alt stacks as mentioned above 

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Acknowledgments 🙏 
Inspired from this [tweet by @t4t5](https://x.com/t4t5/status/1861066474623782959)
Repo [bitcoin-script-hints](https://github.com/taproot-wizards/bitcoin-script-hints.nvim) 

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png)

## Things to improve 📋

- Instead of abstracting all the Hash opcodes, have a real hash and also real checksig verify 
- Add two modes, Toy mode and Real mode. Real mode works with real hashes and signatures  
- variable mapping for BitVM based script style, so compile time inference might be possible 
- script expansion with maybe intermediate cargo expand step for BitVM (no idea if this works or not)
 