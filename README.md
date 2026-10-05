# redroid-forge-db

Base de datos de **combinaciones conocidas** de [redroid-forge](https://github.com/fogelmanjg/redroid-forge):
qué imagen oficial de Redroid (fijada por *digest*), qué paquete GApps, qué versión de Magisk y qué módulos
se validaron juntos, **en qué hardware** y con qué evidencia.

redroid-forge usa esta base para decirle al usuario si su instancia está en terreno conocido
(`oficial`, `comunidad` o `sin-soporte`). Diseño completo:
[`docs/BASE-COMBINACIONES.md`](https://github.com/fogelmanjg/redroid-forge/blob/main/docs/BASE-COMBINACIONES.md).

## Qué NO es

- **No es una garantía.** Es software libre sin garantías (Apache-2.0). "Oficial" significa
  *validada con evidencia que cualquiera puede repetir*, no "funciona seguro".
- **La firma prueba autenticidad, no corrección.** Garantiza quién publicó la base y que no fue
  alterada; no dice que las combinaciones funcionen.
- **No redistribuye binarios.** Los paquetes (GApps, Magisk) son *punteros*: URL de origen + `sha256`.
  Nunca se aloja el contenido.

## Estructura

```
bases/*.json          una por imagen base oficial (identificada por digest sha256, no por tag)
paquetes/*.json       una por paquete GApps/Magisk (origen + sha256 obligatorio)
combinaciones/*.json  una por combinación + sus validaciones por hardware, con chequeos
meta.json             schemaVersion, serial (monotónico) y minForgeVersion
tools/build.js        compila todo a dist/database.json y lo valida
tools/check-urls.js   comprueba que cada paquete siga descargando al sha256 declarado
tools/db-sign.js      genera la clave de firma y firma/verifica (sin dependencias)
```

## Cómo lo consume redroid-forge

Cada release de redroid-forge trae un *snapshot* de esta base (funciona offline). Opcionalmente, el
usuario puede **actualizar** desde la última release de este repo: la app descarga
`database.json` + `database.json.sig`, **verifica la firma ed25519** contra las claves públicas que
trae embebidas, comprueba que el `serial` sea mayor (anti-rollback) y recién entonces la aplica.
Aplicar es siempre una acción explícita.

## Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md). Resumen: un PR con **evidencia** de tu validación.
Las combinaciones `comunidad` entran con checks automáticos; `oficial` requiere revisión.

## Licencia

Apache-2.0 (ver `LICENSE`).
