#!/usr/bin/env node
// For every package (GApps/Magisk), downloads its "origen" and checks that it still serves
// what the database declares. Detects dead links or links whose content changed (see
// docs/KNOWN-COMBINATIONS.md 6 and 6.1 in redroid-forge). Exits with code 1 if any of them
// does not match. The download is read as a stream (a package can be ~2 GB).
//
// Two kinds of package:
//  - a single archive: its "sha256" is the sha256 of the file that "origen" serves.
//  - defined by files ("archivos", e.g. GApps from the Android SDK system image): its "sha256"
//    is the digest OF THE LIST of files, not of the download, so the download is compared with
//    what the publisher states about it: "origenSha1" (the sha1 Google lists for that zip) and
//    "tamano" (its size in bytes). The individual files cannot be re-checked here without
//    unpacking the image; the sha1 of the whole zip being unchanged implies they are unchanged.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'paquetes');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

async function download(url, algorithms) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15 * 60 * 1000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const hashes = Object.fromEntries(algorithms.map((a) => [a, crypto.createHash(a)]));
  let bytes = 0;
  for await (const chunk of res.body) {
    bytes += chunk.length;
    for (const h of Object.values(hashes)) h.update(chunk);
  }
  return { bytes, digest: Object.fromEntries(Object.entries(hashes).map(([a, h]) => [a, h.digest('hex')])) };
}

// Pure, so it can be tested without network. -> the problem found, or null.
function compare(p, got) {
  if (Array.isArray(p.archivos)) {
    if (!p.origenSha1) return 'it is defined by files but declares no "origenSha1" to check the download against';
    if (got.digest.sha1 !== p.origenSha1) return `the download changed: sha1 ${got.digest.sha1}, declared ${p.origenSha1}`;
    if (Number.isFinite(p.tamano) && got.bytes !== p.tamano) return `size ${got.bytes} differs from the declared ${p.tamano}`;
    return null;
  }
  if (got.digest.sha256 !== p.sha256) return `sha256 differs (declared ${p.sha256}, downloaded ${got.digest.sha256})`;
  return null;
}

async function main() {
  let bad = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    try {
      const got = await download(p.origen, Array.isArray(p.archivos) ? ['sha1'] : ['sha256']);
      const problem = compare(p, got);
      if (problem) throw new Error(problem);
      console.log(`ok   ${p.id}`);
    } catch (e) {
      bad++;
      console.log(`FAIL ${p.id}: ${e.message}`);
    }
  }
  console.log(files.length ? `${files.length - bad}/${files.length} packages verified` : 'no packages to verify');
  process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { compare };
