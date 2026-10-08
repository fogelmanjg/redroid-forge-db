# Contributing

The database is only worth as much as its validations: every claim has to be **repeatable**.

## Reporting a combination you tested

1. Test it with redroid-forge on **the unmodified official image** (hand-built images are not accepted).
2. Create (or edit) the file `combinaciones/<id>.json` with an entry in `validaciones`:
   - `hardware`: `vendor` (`amd`/`intel`/`nvidia`), `gpu` and `driver`.
   - `fecha`, `forgeVersion` and `resultado` (`ok` / `parcial` / `falla`).
   - `chequeos`: a list of `{ id, resultado, detalle }` — what you ran and what it gave. They must be repeatable.
   - `notas` and `evidencia` (link to a PR, issue, logs).
3. If you use new pieces, add them in `bases/` (real `sha256:…` digest, not the tag) or `paquetes/`
   (`origen` + a `sha256` that matches what gets downloaded: `node tools/check-urls.js`).
4. Build and validate locally: `node tools/build.js --forge <redroid-forge checkout>`.
5. Open the PR. CI repeats the validation.

## Levels

- **`comunidad`**: gets in with automatic checks (format, references, hashes). Minimal review.
- **`oficial`**: requires at least one `ok` validation and a maintainer's review, because a support
  promise stands behind it.

## Rules

- Never upload third-party binaries: only pointers (URL + `sha256`).
- Do not touch `meta.json` (`serial`) in a contribution PR: the maintainer bumps it when releasing.
- Honest `falla`/`parcial` reports are as valuable as the `ok` ones.
- Write free-text fields (`detalle`, `notas`, `descripcion`) in English.
