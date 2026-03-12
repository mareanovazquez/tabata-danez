import "../styles/components/completeScreen.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

// ─── Cálculo del resumen según modo ──────────────────────────────────────────

function buildSummary(mode, schedule) {
  const workPhases = schedule.filter((p) => p.phase === "work");

  if (mode === "classic") {
    return [
      { label: "Ejercicio", value: schedule[0]?.exercise ?? "—" },
      { label: "Rondas", value: workPhases.length },
      { label: "Tiempo trabajo", value: `${workPhases.length * 20}s` },
    ];
  }

  if (mode === "custom") {
    const rounds = schedule.find((p) => p.totalRounds)?.totalRounds ?? 0;
    const exercisesPerRound =
      schedule.find((p) => p.totalExercises)?.totalExercises ?? 0;
    return [
      { label: "Rondas", value: rounds },
      { label: "Ejercicios", value: exercisesPerRound },
      { label: "Series totales", value: workPhases.length },
    ];
  }

  if (mode === "circuit") {
    const stations = schedule.find((p) => p.totalStations)?.totalStations ?? 0;
    const reps = schedule.find((p) => p.totalReps)?.totalReps ?? 0;
    return [
      { label: "Estaciones", value: stations },
      { label: "Reps / estación", value: reps },
      { label: "Series totales", value: workPhases.length },
    ];
  }

  return [];
}

// ─── Componente principal ─────────────────────────────────────────────────────

function CompleteScreen({
  mode,
  schedule,
  elapsedTime,
  onNewWorkout,
  onRepeat,
}) {
  const summary = buildSummary(mode, schedule);

  return (
    <div className="complete-screen">
      {/* Trofeo animado */}
      <div className="complete-screen__trophy" aria-hidden="true">
        🏆
      </div>

      {/* Título */}
      <h1 className="complete-screen__title">¡Workout completo!</h1>
      <p className="complete-screen__subtitle">Bien hecho. A recuperarse.</p>

      {/* Tiempo total */}
      <div className="complete-screen__time">
        <span className="complete-screen__time-label">Tiempo total</span>
        <span className="complete-screen__time-value">
          {formatTime(elapsedTime)}
        </span>
      </div>

      {/* Resumen de stats */}
      <div className="complete-screen__stats">
        {summary.map(({ label, value }) => (
          <div key={label} className="complete-screen__stat">
            <span className="complete-screen__stat-value">{value}</span>
            <span className="complete-screen__stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="complete-screen__actions">
        <button
          className="complete-screen__btn complete-screen__btn--repeat"
          onClick={onRepeat}
        >
          ↩ Repetir workout
        </button>
        <button
          className="complete-screen__btn complete-screen__btn--new"
          onClick={onNewWorkout}
        >
          ▶ Nuevo workout
        </button>
      </div>
    </div>
  );
}

export default CompleteScreen;
