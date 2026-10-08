# Releasing a version of the database (maintainers only)

Signing is done **by hand, on the releaser's machine**, with the private key protected by a passphrase.
**Never** in CI or on a shared server. The private key file is not, and will never be, in this repo.

```bash
# 1. Bump the serial (always higher than the previous one: it is the anti-rollback protection)
#    edit meta.json -> "serial": N+1   (and minForgeVersion if needed)

# 2. Build and validate (uses redroid-forge's validator)
node tools/build.js --forge <redroid-forge checkout>

# 3. Sign (it asks for the passphrase on the terminal)
node tools/db-sign.js sign dist/database.json ~/.redroid-forge-keys/db-signing.key
node tools/db-sign.js verify dist/database.json ~/.redroid-forge-keys/db-signing.pub

# 4. Publish the release with the THREE files (the names are fixed)
gh release create "serial-N+1" dist/database.json dist/database.json.sig dist/latest.json \
  --title "Database serial N+1" --notes "..."
```

redroid-forge downloads `releases/latest/download/{database.json, database.json.sig, latest.json}`.

## Generating the key (once)

With Node (this tool) or with OpenSSL — both produce signatures that redroid-forge accepts:

```bash
node tools/db-sign.js keygen ~/.redroid-forge-keys        # asks for a passphrase (min. 12 characters)
# or:
openssl genpkey -algorithm ed25519 -aes-256-cbc -out db-signing.key
openssl pkey -in db-signing.key -pubout -out db-signing.pub
```

The **public** key goes into `backend/db/trusted-keys.json` in redroid-forge. **Keep a backup of the
private one**: if it is lost you have to rotate to a new key (the trusted-keys list accepts several
precisely for that).
