#!/usr/bin/env node
// For every package (GApps/Magisk), downloads its "origen" and checks that the
// sha256 matches the declared one. Detects dead links or links whose content
// changed (see docs/KNOWN-COMBINATIONS.md 6 and 6.1 in redroid-forge).
// Exits with code 1 if any of them does not match.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'paquetes');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
(async () => {
  let bad = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    try {
      const res = await fetch(p.origen, { redirect: 'follow', signal: AbortSignal.timeout(120000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const h = crypto.createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex');
      if (h !== p.sha256) throw new Error(`sha256 differs (declared ${p.sha256}, downloaded ${h})`);
      console.log(`ok   ${p.id}`);
    } catch (e) {
      bad++;
      console.log(`FAIL ${p.id}: ${e.message}`);
    }
  }
  console.log(files.length ? `${files.length - bad}/${files.length} packages verified` : 'no packages to verify');
  process.exit(bad ? 1 : 0);
})();
