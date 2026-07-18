# Tienda Matemática

Aplicación de escritorio para aprender porcentajes de forma interactiva y sin conexión a Internet.

## Descripción

Este proyecto es una aplicación de escritorio construida con Electron que ayuda a los estudiantes a practicar porcentajes. Todos los recursos necesarios están incluidos en la carpeta del proyecto.

## Requisitos

- Node.js instalado
- npm disponible en el sistema

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

## Empaquetado para Windows

Para generar el instalador o el directorio de distribución, ejecuta:

```bash
npm run dist
```

El resultado se guardará en la carpeta `dist`.

Si solo deseas crear los archivos de aplicación sin instalador, usa:

```bash
npm run pack
```

## Estructura del proyecto

- `index.html`: Interfaz principal
- `styles.css`: Estilos de la aplicación
- `script.js`: Lógica del juego
- `main.js`: Entrada de Electron
- `preload.js`: Comunicación entre renderer y main
- `image.png`: Icono del proyecto
- `fondo de musica.mp3`: Fondo musical opcional

## Repositorio

Repositorio remoto:

https://github.com/nasa-cell/porcentaje-juego-educativo-

## Notas

- La aplicación está diseñada para funcionar sin conexión una vez instaladas las dependencias.
- Si tienes problemas con el empaquetado, revisa que `electron-builder` y `electron` estén instalados correctamente.
