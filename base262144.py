#!/usr/bin/env python3
"""
Base-262144 encoder/decoder (Python implementation)

- Alphabet: contiguous Unicode range U+10000 .. U+4FFFF (262,144 symbols)
- Each symbol encodes 18 bits
- First symbol stores number of padding bits (0..17)

Usage:
    python base262144.py enc input.bin output.b262144
    python base262144.py dec input.b262144 output.bin
    
    # or with stdin/stdout:
    cat file.png | python base262144.py enc - - > out.b262144
    cat out.b262144 | python base262144.py dec - - > file.png
"""

import sys

BASE = 262144         # 2^18
CP_START = 0x10000    # Start of alphabet
CP_END   = CP_START + BASE - 1


def val_to_char(v: int) -> str:
    return chr(CP_START + v)

def char_to_val(ch: str) -> int:
    cp = ord(ch)
    if cp < CP_START or cp > CP_END:
        raise ValueError(f"Invalid Base-262144 character U+{cp:04X}")
    return cp - CP_START


def encode(data: bytes) -> str:
    if not data:
        return val_to_char(0)

    bitlen = len(data) * 8
    pad = (18 - (bitlen % 18)) % 18

    out_vals = [pad]
    acc = 0
    acc_bits = 0

    for b in data:
        acc = (acc << 8) | b
        acc_bits += 8
        while acc_bits >= 18:
            val = (acc >> (acc_bits - 18)) & 0x3FFFF
            out_vals.append(val)
            acc_bits -= 18

    if pad:
        val = (acc << (18 - acc_bits)) & 0x3FFFF
        out_vals.append(val)

    return ''.join(val_to_char(v) for v in out_vals)


def decode(text: str) -> bytes:
    if not text:
        return b""

    pad = char_to_val(text[0])
    if not (0 <= pad <= 17):
        raise ValueError("Invalid Base-262144 header (padding out of range)")

    acc = 0
    acc_bits = 0
    out = bytearray()

    for ch in text[1:]:
        val = char_to_val(ch)
        acc = (acc << 18) | val
        acc_bits += 18
        while acc_bits >= 8:
            out.append((acc >> (acc_bits - 8)) & 0xFF)
            acc_bits -= 8

    if pad:
        useful_bits = (len(text) - 1) * 18 - pad
        useful_bytes = useful_bits // 8
        return bytes(out[:useful_bytes])

    return bytes(out)


# ---------------- CLI ----------------
def main(argv):
    if len(argv) < 2 or argv[1] not in ("enc", "dec"):
        print("Usage: base262144.py enc|dec [infile|-] [outfile|-]", file=sys.stderr)
        return 2

    mode = argv[1]
    inf = argv[2] if len(argv) > 2 else "-"
    outf = argv[3] if len(argv) > 3 else "-"

    if mode == "enc":
        data = sys.stdin.buffer.read() if inf == "-" else open(inf, "rb").read()
        text = encode(data)
        if outf == "-":
            sys.stdout.write(text)
        else:
            open(outf, "w", encoding="utf-8").write(text)
    else:
        text = sys.stdin.read() if inf == "-" else open(inf, "r", encoding="utf-8").read()
        data = decode(text)
        if outf == "-":
            sys.stdout.buffer.write(data)
        else:
            open(outf, "wb").write(data)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
