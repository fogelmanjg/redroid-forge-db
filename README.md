# redroid-forge-db

**English** · [Español](README.es.md)

Database of the **known combinations** of [redroid-forge](https://github.com/fogelmanjg/redroid-forge):
which official Redroid image (pinned by *digest*), which GApps package, which Magisk version and which
modules were validated together, **on what hardware** and with what evidence.

redroid-forge uses this database to tell the user whether their instance is on known ground
(`oficial`, `comunidad` or `sin-soporte`). Full design:
[`docs/KNOWN-COMBINATIONS.md`](https://github.com/fogelmanjg/redroid-forge/blob/main/docs/KNOWN-COMBINATIONS.md).

## What it is NOT

- **It is not a guarantee.** It is free software without warranty (Apache-2.0). "Official" means
  *validated with evidence that anyone can repeat*, not "works for sure".
- **The signature proves authenticity, not correctness.** It guarantees who published the database and
  that it was not altered; it does not say the combinations work.
- **It does not redistribute binaries.** The packages (GApps, Magisk) are *pointers*: source URL +
  `sha256`. The content is never hosted.

## Layout

```
bases/*.json          one per official base image (identified by sha256 digest, not by tag)
paquetes/*.json       one per GApps/Magisk package (source + mandatory sha256)
combinaciones/*.json  one per combination + its per-hardware validations, with checks
meta.json             schemaVersion, serial (monotonic) and minForgeVersion
tools/build.js        compiles everything into dist/database.json and validates it
tools/check-urls.js   checks that every package still downloads to the declared sha256
tools/db-sign.js      generates the signing key and signs/verifies (dependency-free)
```

The data format keeps its Spanish field names (`bases`, `paquetes`, `combinaciones`, `soporte`, ...) on
purpose: they are part of the signed format that redroid-forge reads. Free-text fields are in English.

## How redroid-forge consumes it

Every redroid-forge release ships a *snapshot* of this database (it works offline). Optionally, the user
can **update** from the latest release of this repo: the app downloads `database.json` +
`database.json.sig`, **verifies the ed25519 signature** against the public keys it embeds, checks that
the `serial` is higher (anti-rollback) and only then applies it. Applying is always an explicit action.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). In short: a PR with **evidence** of your validation.
`comunidad` combinations get in with automatic checks; `oficial` requires review.

## License

Apache-2.0 (see `LICENSE`).
