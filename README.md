# Proyecto Tabata Danez

**Tabata Danez** es una aplicación web moderna de temporizador para entrenamientos de alta intensidad (HIIT), Tabata y Circuitos. Construida con React y Vite, se destaca por no depender de archivos de audio externos, utilizando la **Web Audio API** para generar sonidos sintetizados en tiempo real.

## Características Principales

- **3 Modos de Entrenamiento:**
  - **Tabata Clásico:** Configuración estándar (20s trabajo / 10s descanso, 8 rondas).
  - **Tabata Personalizado:** Permite definir rondas, tiempos y una lista de ejercicios específicos.
  - **Circuito:** Soporte para estaciones, repeticiones por estación y rotaciones.
- **Audio Sintetizado:** Sistema de sonido ligero sin archivos `.mp3` ni `.wav`; los beeps y señales se generan dinámicamente.
- **Interfaz Visual Intuitiva:**
  - Cambios de color según la fase (Preparación, Trabajo, Descanso).
  - Barra de progreso general y bloques de fases individuales.
  - Previsualización del "Próximo Ejercicio".
  - Modo "Limpio" (sin detalles de tiempo) vs Modo "Detallado".

## Estructura del Proyecto

La arquitectura se basa en custom hooks para separar la lógica del temporizador de la interfaz de usuario.

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
