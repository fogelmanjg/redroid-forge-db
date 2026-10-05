# Liberar una versión de la base (solo mantenedores)

La firma se hace **a mano, en la máquina de quien libera**, con la clave privada protegida por
passphrase. **Nunca** en CI ni en un servidor compartido. El archivo de la clave privada no está ni
estará en este repo.

```bash
# 1. Subir el serial (siempre mayor al anterior: es la protección anti-rollback)
#    editar meta.json -> "serial": N+1   (y minForgeVersion si hace falta)

# 2. Compilar y validar (usa el validador de redroid-forge)
node tools/build.js --forge <checkout de redroid-forge>

# 3. Firmar (te pide la passphrase por terminal)
node tools/db-sign.js sign dist/database.json ~/.redroid-forge-keys/db-signing.key
node tools/db-sign.js verify dist/database.json ~/.redroid-forge-keys/db-signing.pub

# 4. Publicar la release con los TRES archivos (los nombres son fijos)
gh release create "serial-N+1" dist/database.json dist/database.json.sig dist/latest.json \
  --title "Base serial N+1" --notes "..."
```

redroid-forge descarga `releases/latest/download/{database.json, database.json.sig, latest.json}`.

## Generar la clave (una sola vez)

Con Node (esta herramienta) o con OpenSSL — ambas producen firmas que redroid-forge acepta:

```bash
node tools/db-sign.js keygen ~/.redroid-forge-keys        # pide passphrase (mín. 12 caracteres)
# o:
openssl genpkey -algorithm ed25519 -aes-256-cbc -out db-signing.key
openssl pkey -in db-signing.key -pubout -out db-signing.pub
```

La clave **pública** va a `backend/db/trusted-keys.json` en redroid-forge. **Guardá un respaldo de
la privada**: si se pierde hay que rotar a una clave nueva (la lista de claves de confianza admite
varias justamente para eso).
