# Base-262144 — Experimental Binary-to-Text Encoding

**Base-262144** is an encoding scheme that turns any binary data into text using a massive Unicode alphabet of **262,144 symbols** (U+10000–U+4FFFF). Each character encodes exactly **18 bits** (2¹⁸). The result looks like an alien script but is fully reversible.

---

## Features
- Encode/decode arbitrary binary data with a single-file **web app** (`base262144.html`).
- **18 bits per symbol** → more compact than Base64.
- Output appears as exotic Unicode glyphs, giving the feel of a *new language*.
- **Draft RFC-style specification** included in the repo.
- Optional `\\u{...}` escape output for ASCII-safe transport.
- File upload/download support in browser.

---

## Quick Start
1. Clone or download this repository.
2. Open `base262144.html` in your browser.
3. Type text or upload a file → press **ENCODE**.
4. Copy or download the encoded output.  
   To decode, paste a Base-262144 string and press **DECODE**.

---

## Example
```
Input:   Hello
Binary:  01001000 01100101 01101100 01101100 01101111
Output:  [4 Base-262144 symbols] → appears as unfamiliar glyphs
```
*(See the Draft Specification for full worked examples.)*

---

## Why Base-262144?
- **Efficiency:** 18 bits per symbol (2.25 bytes).  
- **Novelty:** Strings look like unknown writing systems.  
- **Unicode-safe:** Works with modern browsers, editors, and chat apps.  
- **Educational:** Demonstrates how binary-to-text encodings can be extended beyond Base64.

---

## Applications
- Data **obfuscation** and **steganography**.
- Artistic experiments with *artificial scripts*.
- Teaching tool for **encoding design**.

---

## License
Released under the **MIT License**. See [LICENSE](LICENSE) for details.
