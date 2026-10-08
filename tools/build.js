#!/usr/bin/env node
// Compiles bases/ + paquetes/ + combinaciones/ + meta.json into dist/database.json
// (+ dist/latest.json) and VALIDATES it with the same validator redroid-forge uses
// when it receives the database (backend/src/lib/knownDb.js): a single source of
// truth, with no copy that could get out of sync.
//
//   node tools/build.js --forge <path-to-a-redroid-forge-checkout> [--date 2026-10-05T00:00:00Z]
//
// It signs nothing: signing is done separately, by hand, on the releaser's
// machine (see RELEASING.md).
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const root = path.join(__dirname, '..');
const forge = opt('--forge') || process.env.FORGE_DIR;
if (!forge) { console.error('missing --forge <path to a redroid-forge checkout> (or FORGE_DIR)'); process.exit(2); }
const knownDb = require(path.resolve(forge, 'backend/src/lib/knownDb.js'));

const readDir = (dir) => fs.readdirSync(path.join(root, dir))
  .filter((f) => f.endsWith('.json')).sort()
  .map((f) => {
    try { return JSON.parse(fs.readFileSync(path.join(root, dir, f), 'utf-8')); }
    catch (e) { console.error(`${dir}/${f}: invalid JSON (${e.message})`); process.exit(1); }
  });

const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta.json'), 'utf-8'));
const db = {
  schemaVersion: meta.schemaVersion,
  serial: meta.serial,
  generatedAt: opt('--date') || new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  minForgeVersion: meta.minForgeVersion,
  bases: readDir('bases'),
  paquetes: readDir('paquetes'),
  combinaciones: readDir('combinaciones'),
};

try {
  knownDb.validateDatabase(db);
} catch (e) {
  console.error(e.message.replace(/; /g, '\n  - '));
  process.exit(1);
}

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'database.json'), JSON.stringify(db, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'dist', 'latest.json'), JSON.stringify({ serial: db.serial, generatedAt: db.generatedAt }) + '\n');
console.log(`OK: serial ${db.serial}, ${db.bases.length} base(s), ${db.paquetes.length} package(s), ${db.combinaciones.length} combination(s) -> dist/database.json`);
