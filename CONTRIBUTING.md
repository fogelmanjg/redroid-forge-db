# Contribuir

La base solo vale lo que valen sus validaciones: cada afirmación tiene que poder **repetirse**.

## Reportar una combinación que probaste

1. Probala con redroid-forge sobre **la imagen oficial sin modificar** (no se aceptan imágenes armadas a mano).
2. Armá (o editá) el archivo en `combinaciones/<id>.json` con una entrada en `validaciones`:
   - `hardware`: `vendor` (`amd`/`intel`/`nvidia`), `gpu` y `driver`.
   - `fecha`, `forgeVersion` y `resultado` (`ok` / `parcial` / `falla`).
   - `chequeos`: lista de `{ id, resultado, detalle }` — lo que corriste y qué dio. Deben poder repetirse.
   - `notas` y `evidencia` (enlace a un PR, issue, logs).
3. Si usás piezas nuevas, agregalas en `bases/` (digest `sha256:…` real, no el tag) o `paquetes/`
   (`origen` + `sha256` que coincida con lo que se descarga: `node tools/check-urls.js`).
4. Compilá y validá localmente: `node tools/build.js --forge <checkout de redroid-forge>`.
5. Abrí el PR. La CI repite la validación.

## Niveles

- **`comunidad`**: entra con checks automáticos (formato, referencias, hashes). Revisión mínima.
- **`oficial`**: exige al menos una validación `ok` y la revisión de un mantenedor, porque lleva una
  promesa de soporte detrás.

## Reglas

- Nunca subas binarios de terceros: solo punteros (URL + `sha256`).
- No toques `meta.json` (`serial`) en un PR de contribución: lo sube el mantenedor al liberar.
- Los reportes honestos de `falla`/`parcial` son tan valiosos como los `ok`.
