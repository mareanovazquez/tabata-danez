# Proyecto Tabata Danez

Este proyecto es una aplicación web moderna construida con React y Vite.

## Estructura del Proyecto

La estructura de carpetas está organizada para promover la escalabilidad y mantenibilidad del código.

```
/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

- **`public/`**: Recursos estáticos que no se compilan.
- **`src/`**: Código fuente de la aplicación.
  - **`assets/`**: Archivos como CSS, imágenes y fuentes.
  - **`components/`**: Componentes de React reutilizables.
  - **`hooks/`**: Custom Hooks para la lógica reutilizable.
  - **`pages/`**: Componentes que actúan como páginas.
  - **`services/`**: Conexiones a APIs y servicios externos.
  - **`utils/`**: Funciones de utilidad.

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`

Inicia la aplicación en modo de desarrollo.<br />
Abre http://localhost:5173 para verla en tu navegador.

### `npm run build`

Compila la aplicación para producción en la carpeta `dist/`.

### `npm run lint`

Ejecuta el linter para encontrar y corregir problemas en el código.

### `npm run preview`

Sirve la versión de producción de forma local para previsualizarla.

## Tecnologías Utilizadas

- React
- Vite
