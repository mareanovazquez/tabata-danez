import "../styles/components/modeSelector.css";

const MODES = [
  {
    id: "classic",
    label: "Tabata Clásico",
    description: "Un ejercicio · 8 rondas · 20s / 10s",
    icon: "🔥",
    accent: "var(--color-work)",
    accentVar: "--accent-classic",
  },
  {
    id: "custom",
    label: "Tabata Personalizado",
    description: "Vos elegís rondas, ejercicios y tiempos",
    icon: "⚙️",
    accent: "var(--color-rest)",
    accentVar: "--accent-custom",
  },
  {
    id: "circuit",
    label: "Circuito",
    description: "Estaciones rotativas · todos juntos",
    icon: "🔄",
    accent: "var(--color-round-rest)",
    accentVar: "--accent-circuit",
  },
];

function ModeSelector({ onSelectMode }) {
  return (
    <div className="mode-selector">
      <header className="mode-selector__header">
        <div className="mode-selector__logo">
          <span className="mode-selector__logo-icon">▶</span>
          <span className="mode-selector__logo-text">TABATA</span>
        </div>
        <p className="mode-selector__subtitle">Elegí tu entrenamiento</p>
      </header>

      <div className="mode-selector__grid">
        {MODES.map((mode, index) => (
          <button
            key={mode.id}
            className="mode-card"
            style={{ "--accent": mode.accent, "--delay": `${index * 0.08}s` }}
            onClick={() => onSelectMode(mode.id)}
          >
            <span className="mode-card__icon">{mode.icon}</span>
            <div className="mode-card__content">
              <span className="mode-card__label">{mode.label}</span>
              <span className="mode-card__description">{mode.description}</span>
            </div>
            <span className="mode-card__arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeSelector;
