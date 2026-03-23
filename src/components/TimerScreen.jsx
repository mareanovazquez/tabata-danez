import { useState } from "react";
import { Pause, Play, RotateCcw, LogOut, Eye, EyeOff } from "lucide-react";
import ProgressBlocks from "./ProgressBlocks";
import "../styles/components/timerScreen.css";
import "../styles/components/circuitGrid.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PHASE_LABELS = {
  prep: "PREPARATE",
  work: "TRABAJO",
  rest: "DESCANSO",
  roundRest: "DESCANSÁ",
  stationRest: "ROTÁ",
};

const PHASE_CSS_CLASS = {
  prep: "timer--prep",
  work: "timer--work",
  rest: "timer--rest",
  roundRest: "timer--round-rest",
  stationRest: "timer--round-rest",
};

// Formatea segundos → MM:SS (para el elapsed time en el header)
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Sub-componente: info contextual según modo ───────────────────────────────

function PhaseContext({ phase }) {
  if (!phase) return null;

  const isCircuit = phase.stationNumber !== null;

  if (isCircuit) {
    return (
      <div className="timer__context">
        <span className="timer__context-item">
          Estación <strong>{phase.stationNumber}</strong> /{" "}
          {phase.totalStations}
        </span>
        <span className="timer__context-sep">·</span>
        <span className="timer__context-item">
          Rep <strong>{phase.repNumber}</strong> / {phase.totalReps}
        </span>
      </div>
    );
  }

  if (phase.roundNumber !== null) {
    return (
      <div className="timer__context">
        <span className="timer__context-item">
          Ronda <strong>{phase.roundNumber}</strong> / {phase.totalRounds}
        </span>
        {phase.totalExercises > 1 && (
          <>
            <span className="timer__context-sep">·</span>
            <span className="timer__context-item">
              Ejercicio <strong>{phase.exerciseNumber}</strong> /{" "}
              {phase.totalExercises}
            </span>
          </>
        )}
      </div>
    );
  }

  return null;
}

// ─── Sub-componente: preview del próximo ejercicio ────────────────────────────

function NextPreview({ phase }) {
  if (!phase) return null;

  const isRestPhase = ["rest", "roundRest", "stationRest"].includes(
    phase.phase,
  );
  if (!isRestPhase || !phase.nextExercise) return null;

  const label = phase.phase === "stationRest" ? "PRÓXIMA ESTACIÓN" : "PRÓXIMO";

  return (
    <div className="timer__next">
      <span className="timer__next-label">{label}</span>
      <span className="timer__next-exercise">{phase.nextExercise}</span>
    </div>
  );
}

// ─── Sub-componente: grilla de circuito ───────────────────────────────────────

const PHASE_CARD_CLASS = {
  work: "circuit-card--work",
  rest: "circuit-card--rest",
  roundRest: "circuit-card--rest",
  prep: "circuit-card--prep",
  stationRest: "circuit-card--change",
};

function CircuitGrid({ assignments, phase, timeRemaining }) {
  const phaseClass = PHASE_CARD_CLASS[phase.phase] ?? "";

  return (
    <>
      {phase.phase !== "stationRest" && (
        <div className="circuit-timer">{timeRemaining}</div>
      )}
      <div className="circuit-grid">
        {assignments.map((item) => (
          <div
            key={item.stationIndex}
            className={`circuit-card ${phaseClass} ${item.studentName === null ? "circuit-card--empty" : ""}`}
          >
            <span className="circuit-card__station">{item.stationName}</span>
            <span className="circuit-card__student">
              {item.studentName ?? ""}
            </span>
          </div>
        ))}

        {phase.phase === "stationRest" && (
          <div className="circuit-overlay">
            <span className="circuit-overlay__label">CAMBIO</span>
            <span className="circuit-overlay__countdown">{timeRemaining}</span>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function TimerScreen({
  schedule,
  currentPhase,
  currentPhaseIndex,
  timeRemaining,
  isRunning,
  isPaused,
  phaseProgress,
  workoutProgress,
  onTogglePause,
  onRestart,
  onReset,
}) {
  const [detailed, setDetailed] = useState(false);

  if (!currentPhase) return null;

  const phaseLabel = PHASE_LABELS[currentPhase.phase] ?? "";
  const phaseCSSClass = PHASE_CSS_CLASS[currentPhase.phase] ?? "";

  // Los últimos 3 segundos en fase de trabajo se resaltan
  const isCountingDown = timeRemaining <= 3 && currentPhase.phase !== "work";

  return (
    <div className={`timer ${phaseCSSClass}`}>
      {/* ── Barra superior ──────────────────────────────────────────────── */}
      <header className="timer__header">
        <div className="timer__elapsed">
          {formatTime(
            schedule.reduce(
              (acc, p, i) => (i < currentPhaseIndex ? acc + p.duration : acc),
              0,
            ),
          )}
        </div>

        <div className="timer__phase-badge">{phaseLabel}</div>

        <div className="timer__controls">
          <button
            className="timer__btn timer__btn--icon"
            onClick={() => setDetailed((d) => !d)}
            aria-label={detailed ? "Modo limpio" : "Modo detallado"}
            title={detailed ? "Modo limpio" : "Modo detallado"}
          >
            {detailed ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button
            className="timer__btn timer__btn--icon"
            onClick={onRestart}
            aria-label="Reiniciar"
            title="Volver a configuración"
          >
            <RotateCcw size={20} />
          </button>

          <button
            className="timer__btn timer__btn--icon timer__btn--exit"
            onClick={onReset}
            aria-label="Salir"
            title="Salir al inicio"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ── Área central ────────────────────────────────────────────────── */}
      <main className="timer__main">
        {Array.isArray(currentPhase.assignments) ? (
          <CircuitGrid
            assignments={currentPhase.assignments}
            phase={currentPhase}
            timeRemaining={timeRemaining}
          />
        ) : (
          <>
            {/* Cuenta regresiva */}
            <div
              className={`timer__countdown ${isCountingDown ? "timer__countdown--urgent" : ""}`}
            >
              {timeRemaining}
            </div>

            {/* Nombre del ejercicio */}
            <div className="timer__exercise">{currentPhase.exercise}</div>

            {/* Contexto: ronda / estación / rep */}
            <PhaseContext phase={currentPhase} />

            {/* Preview del próximo ejercicio */}
            <NextPreview phase={currentPhase} />
          </>
        )}
      </main>

      {/* ── Botón de pausa ──────────────────────────────────────────────── */}
      <div className="timer__pause-wrap">
        <button
          className={`timer__pause-btn ${isPaused ? "timer__pause-btn--paused" : ""}`}
          onClick={onTogglePause}
          aria-label={isPaused ? "Reanudar" : "Pausar"}
        >
          {isPaused ? (
            <>
              <Play size={28} /> Reanudar
            </>
          ) : (
            <>
              <Pause size={28} /> Pausar
            </>
          )}
        </button>
      </div>

      {/* ── Barra de progreso ────────────────────────────────────────────── */}
      <footer className="timer__footer">
        <ProgressBlocks
          schedule={schedule}
          currentPhaseIndex={currentPhaseIndex}
          detailed={detailed}
        />
        <div
          className="timer__progress-bar"
          style={{ "--progress": `${workoutProgress * 100}%` }}
          aria-label={`Progreso total: ${Math.round(workoutProgress * 100)}%`}
        />
      </footer>
    </div>
  );
}

export default TimerScreen;
