# Proyecto Tabata Danez

**Tabata Danez** es una aplicación web moderna de temporizador para entrenamientos de alta intensidad (HIIT), Tabata y Circuitos. Construida con React y Vite, utiliza **archivos de audio MP3** de alta calidad para las señales sonoras durante el entrenamiento.

## Características Principales

- **3 Modos de Entrenamiento:**
  - **Tabata Clásico:** Configuración estándar (20s trabajo / 10s descanso, 8 rondas).
  - **Tabata Personalizado:** Permite definir rondas, tiempos y una lista de ejercicios específicos.
  - **Circuito:** Soporte para estaciones, repeticiones por estación y rotaciones.
- **Sistema de Audio MP3:** Señales sonoras claras y distintivas:
  - `countdown.mp3` - Beep de cuenta regresiva (3, 2, 1)
  - `work-start.mp3` - Señal de inicio de trabajo
  - `workout-end.mp3` - Señal de finalización del entrenamiento
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
│   ├── sounds/
│   │   ├── countdown.mp3       # Beep cuenta regresiva
│   │   ├── work-start.mp3      # Inicio de trabajo
│   │   └── workout-end.mp3     # Fin del entrenamiento
│   ├── icons/
│   │   ├── icon-192.png        # Ícono PWA 192x192
│   │   ├── icon-512.png        # Ícono PWA 512x512
│   │   └── icon-maskable-512.png
│   └── favicon.png
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .htaccess                    # Config para SPA en Apache
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

- **`public/`**: Recursos estáticos que no se compilan:
  - **`sounds/`**: Archivos de audio MP3 para las señales del timer.
  - **`icons/`**: Íconos para PWA y manifest.
  - `favicon.png`: Favicon de la aplicación.
- **`src/`**: Código fuente de la aplicación.
  - **`assets/`**: Recursos como imágenes y logos.
  - **`components/`**: Componentes de React reutilizables:
    - `ConfigScreen.jsx` - Pantalla de configuración del entrenamiento
    - `ModeSelector.jsx` - Selector de modos de entrenamiento
    - `TimerScreen.jsx` - Pantalla principal del temporizador
    - `ProgressBlocks.jsx` - Bloques de progreso visual
    - `CompleteScreen.jsx` - Pantalla de finalización
  - **`hooks/`**: Custom Hooks para la lógica reutilizable:
    - `useAudio.js` - Gestión y reproducción de archivos MP3
    - `useTabataTimer.js` - Lógica del temporizador Tabata
  - **`styles/`**: Estilos de la aplicación:
    - `global.css` - Estilos globales
    - `variables.css` - Variables CSS
    - `components/` - Estilos de componentes (un archivo por componente)
  - **`utils/`**: Funciones de utilidad (`buildSchedule.js` para generar el schedule de ejercicios).

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

- **React 19** - Biblioteca de UI
- **Vite 7** - Build tool y dev server
- **Lucide React** - Íconos modernos y ligeros
- **HTML5 Audio** - Reproducción de archivos MP3 para señales sonoras
