// Base-262144 encoder/decoder (ES module)
// Alphabet: U+10000 .. U+4FFFF (262,144 symbols)
// Each character encodes 18 bits; first character stores padding bits (0..17)
export const BASE = 262144;
export const CP_START = 0x10000;
export const CP_END   = CP_START + BASE - 1;

export function valToChar(v){
  if (v < 0 || v >= BASE) throw new RangeError('digit out of range');
  return String.fromCodePoint(CP_START + v);
}
export function charToVal(ch){
  const cp = ch.codePointAt(0);
  if (cp < CP_START || cp > CP_END) throw new Error(`Invalid Base-262144 character U+${cp.toString(16).toUpperCase()}`);
  return cp - CP_START;
}

export function encode(bytes){
  if (!bytes || bytes.length === 0) return valToChar(0);
  const bitlen = bytes.length * 8;
  const pad = (18 - (bitlen % 18)) % 18;
  const outVals = [pad];
  let acc = 0, accBits = 0;
  for (let i=0;i<bytes.length;i++){
    acc = (acc << 8) | (bytes[i] & 0xFF);
    accBits += 8;
    while (accBits >= 18){
      const val = (acc >>> (accBits - 18)) & 0x3FFFF;
      outVals.push(val);
      accBits -= 18;
    }
  }
  if (pad){
    const val = (acc << (18 - accBits)) & 0x3FFFF;
    outVals.push(val);
  }
  return outVals.map(valToChar).join('');
}

export function decode(text){
  if (!text || text.length === 0) return new Uint8Array();
  let i = 0;
  let cp = text.codePointAt(i);
  i += (cp > 0xFFFF ? 2 : 1);
  const pad = cp - CP_START;
  if (pad < 0 || pad > 17) throw new Error('Invalid Base-262144 header (padding out of range)');
  let acc = 0, accBits = 0;
  const out = [];
  while (i < text.length){
    cp = text.codePointAt(i);
    i += (cp > 0xFFFF ? 2 : 1);
    if (cp < CP_START || cp > CP_END) throw new Error(`Invalid digit U+${cp.toString(16).toUpperCase()}`);
    const val = cp - CP_START;
    acc = (acc << 18) | val;
    accBits += 18;
    while (accBits >= 8){
      out.push((acc >>> (accBits - 8)) & 0xFF);
      accBits -= 8;
    }
  }
  if (pad){
    const usefulBits = (codePointCount(text) - 1) * 18 - pad;
    const usefulBytes = usefulBits >>> 3;
    return new Uint8Array(out.slice(0, usefulBytes));
  }
  return new Uint8Array(out);
}

export function codePointCount(s){
  let n = 0;
  for (let i=0;i<s.length;){
    const cp = s.codePointAt(i);
    i += (cp > 0xFFFF ? 2 : 1);
    n++;
  }
  return n;
}

// CLI support (Node only)
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`){
  const fs = await import('node:fs');
  const args = process.argv.slice(2);
  if (args.length < 1 || !['enc','dec'].includes(args[0])){
    console.error('Usage: node base262144.js enc|dec [infile|-] [outfile|-]');
    process.exit(2);
  }
  const mode = args[0];
  const inf = args[1] ?? '-';
  const outf = args[2] ?? '-';

  if (mode === 'enc'){
    const data = inf === '-' ? await readStdinBin() : fs.readFileSync(inf);
    const text = encode(new Uint8Array(data));
    if (outf === '-') process.stdout.write(text);
    else fs.writeFileSync(outf, text, 'utf8');
  } else {
    const text = inf === '-' ? await readStdinTxt() : fs.readFileSync(inf, 'utf8');
    const bytes = decode(text);
    if (outf === '-') process.stdout.write(Buffer.from(bytes));
    else fs.writeFileSync(outf, Buffer.from(bytes));
  }
}
async function readStdinBin(){ const chunks=[]; for await (const c of process.stdin) chunks.push(c); return Buffer.concat(chunks); }
async function readStdinTxt(){ const buf = await readStdinBin(); return buf.toString('utf8'); }
