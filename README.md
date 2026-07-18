# Tienda Matemática

Aplicación de escritorio para aprender porcentajes sin conexión a Internet.

## Instalación

1. Abre una terminal en `d:\descargas\posentaje`.
2. Ejecuta:

```bash
npm install
```

## Ejecutar la aplicación

```bash
npm start
```

## Empaquetar para Windows

Para crear el instalador, abre PowerShell como administrador y ejecuta:

```bash
npm run dist
```

Si el empaquetado falla por permisos de firma de Windows, puedes usar:

```bash
npm run pack
```

## Recursos incluidos

- `image.png` como logo de la aplicación
- `fondo de musica.mp3` para reproducción de audio en bucle después de la primera interacción

La aplicación usa solo archivos locales (`index.html`, `styles.css`, `script.js`) y puede funcionar sin conexión a Internet.
