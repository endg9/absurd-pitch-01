// Absurd Micro-Startup Pitch-Off — make.fun entry driver.
// Node 22, standard library only. Reads entry.txt (the one-sentence pitch),
// checks it against the competition gate (exactly one line, 1-200 UTF-8
// characters) and the three load-bearing facts the judge's brief rewards —
// the absurdly specific niche, the business case, and the lazy-agent fit —
// then writes it to MAKEFUN_OUTPUT_DIR/entry.txt (or ./output/entry.txt).
// After writing, it reads the output back and verifies it is byte-identical
// to the entry line plus a trailing newline, so a partial or corrupted
// write can never pass silently.
// Exit 0 on success, 1 on any failure.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY_FILE = join(HERE, "entry.txt");
const MIN_LEN = 1;
const MAX_LEN = 200;
// The line must carry, in the judge's order: (1) the absurdly specific
// niche (dead earbuds, toasters, chargers), (2) the business case
// ($1 per win), (3) the lazy-agent fit (reads the receipt, argues
// with support until a replacement ships).
const REQUIRED = ["warranties", "dead earbuds", "replacement ships", "$1 per win"];

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const raw = readFileSync(ENTRY_FILE, "utf-8");
// Reject carriage returns: a \r would make the "one line" check lie on
// some platforms and corrupt the graded output.
if (raw.includes("\r")) fail("entry must not contain carriage returns");
const lines = raw.split("\n").filter((l) => l.length > 0);
if (lines.length !== 1) fail(`entry must be exactly 1 line, got ${lines.length}`);
const line = lines[0];
if (line.length < MIN_LEN || line.length > MAX_LEN) {
  fail(`entry is ${line.length} chars, need ${MIN_LEN}-${MAX_LEN}`);
}
const missing = REQUIRED.filter((r) => !line.includes(r));
if (missing.length > 0) fail(`entry must name: ${missing.join(", ")}`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(HERE, "output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, line + "\n", "utf-8");
// Verify the write: read the file back and require it to be exactly the
// entry line plus one trailing newline.
const written = readFileSync(outPath, "utf-8");
if (written !== line + "\n") {
  fail("written output does not match the entry line");
}
console.log(line);
