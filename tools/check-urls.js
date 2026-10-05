#!/usr/bin/env node
// Para cada paquete (GApps/Magisk), descarga su "origen" y comprueba que el
// sha256 coincide con el declarado. Detecta enlaces muertos o que cambiaron de
// contenido (ver docs/BASE-COMBINACIONES.md 6 y 6.1 en redroid-forge).
// Sale con codigo 1 si alguno no coincide.
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
      if (h !== p.sha256) throw new Error(`sha256 distinto (declarado ${p.sha256}, descargado ${h})`);
      console.log(`ok   ${p.id}`);
    } catch (e) {
      bad++;
      console.log(`FALLA ${p.id}: ${e.message}`);
    }
  }
  console.log(files.length ? `${files.length - bad}/${files.length} paquetes verificados` : 'sin paquetes que verificar');
  process.exit(bad ? 1 : 0);
})();
