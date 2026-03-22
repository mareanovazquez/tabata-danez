# Proyecto Tabata Danez

**Tabata Danez** es una aplicación web PWA de temporizador para entrenamientos de alta intensidad (HIIT), Tabata y Circuitos. Construida con React y Vite, utiliza **archivos de audio MP3** de alta calidad para las señales sonoras durante el entrenamiento.

## Características Principales

- **3 Modos de Entrenamiento:**
  - **Tabata Clásico:** Configuración fija (20s trabajo / 10s descanso, 8 rondas), un solo ejercicio.
  - **Tabata Personalizado:** Permite definir rondas, tiempos de trabajo/descanso/descanso entre rondas y una lista de ejercicios específicos.
  - **Circuito:** Estaciones rotativas con asignación de alumnos, repeticiones por estación y descanso entre rotaciones.
- **Sistema de Audio MP3:** Señales sonoras claras y distintivas:
  - `countdown.mp3` - Beep de cuenta regresiva (se reproduce cuando quedan 3 segundos)
  - `work-start.mp3` - Señal de inicio de cada intervalo de trabajo
  - `workout-end.mp3` - Señal de finalización del entrenamiento
  - Toggle de sonido activable/desactivable desde la pantalla de configuración
- **Interfaz Visual Intuitiva:**
  - Cambios de color según la fase (Preparación, Trabajo, Descanso, Descanso entre rondas, Descanso entre estaciones).
  - Barra de progreso general y bloques de fases individuales.
  - Previsualización del "Próximo Ejercicio" en fases de descanso.
- **Pantalla de Finalización:** Muestra estadísticas del workout completado (tiempo total, rondas, series) con opciones para repetir o iniciar uno nuevo.
- **Persistencia:** La última configuración usada se guarda en `localStorage` para poder repetir el workout directamente.
- **PWA (Progressive Web App):** Instalable en dispositivos móviles y de escritorio, funciona offline gracias al service worker generado por Workbox.

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
│   ├── manifest.json           # Web App Manifest para PWA
│   └── favicon.png
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   ├── utils/
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
  - `manifest.json`: Configuración de la PWA (nombre, íconos, colores, orientación).
  - `favicon.png`: Favicon de la aplicación.
- **`src/`**: Código fuente de la aplicación.
  - **`assets/`**: Recursos como imágenes y logos.
  - **`components/`**: Componentes de React reutilizables:
    - `ModeSelector.jsx` - Selector de modos de entrenamiento (pantalla de inicio)
    - `ConfigScreen.jsx` - Pantalla de configuración del entrenamiento
    - `TimerScreen.jsx` - Pantalla principal del temporizador
    - `ProgressBlocks.jsx` - Bloques de progreso visual
    - `CompleteScreen.jsx` - Pantalla de finalización con stats del workout
  - **`hooks/`**: Custom Hooks para la lógica reutilizable:
    - `useAudio.js` - Gestión y reproducción de archivos MP3 (incluye toggle de sonido y desbloqueo de autoplay)
    - `useTabataTimer.js` - Motor central: navegación entre pantallas, construcción del schedule, cuenta regresiva, pausa/reanudar/reiniciar
  - **`styles/`**: Estilos de la aplicación:
    - `global.css` - Estilos globales
    - `variables.css` - Variables CSS
    - `components/` - Estilos de componentes (un archivo por componente)
  - **`utils/`**: Funciones de utilidad:
    - `buildSchedule.js` - Genera el array plano de fases (schedule) para cada modo. Exporta también `getTotalDuration` y `getFirstWorkIndex`.

## Lógica del Schedule

`buildSchedule.js` convierte la configuración en un array de fases con estos tipos:

| Tipo de fase   | Descripción                                          |
|----------------|------------------------------------------------------|
| `prep`         | Cuenta regresiva inicial antes de arrancar           |
| `work`         | Intervalo de trabajo                                 |
| `rest`         | Descanso entre ejercicios o repeticiones             |
| `roundRest`    | Descanso entre rondas (Tabata Personalizado)         |
| `stationRest`  | Descanso entre rotaciones (Circuito)                 |

Cada fase incluye metadatos de contexto: número de ronda/rotación, ejercicio actual, próximo ejercicio, y en el modo Circuito, los assignments de alumnos por estación.

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
- **vite-plugin-pwa + Workbox** - Soporte PWA y caching offline
- **Lucide React** - Íconos modernos y ligeros
- **@fontsource-variable/inter** y **@fontsource-variable/sora** - Tipografías variables autohospedadas
- **HTML5 Audio** - Reproducción de archivos MP3 para señales sonoras
