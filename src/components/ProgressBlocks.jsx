import "../styles/components/progressBlocks.css";

// Mapa de tipo de fase → clase de color
const PHASE_CLASS = {
  prep: "block--prep",
  work: "block--work",
  rest: "block--rest",
  roundRest: "block--round-rest",
  stationRest: "block--round-rest",
};

/**
 * ProgressBlocks
 *
 * Muestra una fila de bloques coloreados, uno por fase del schedule.
 * El bloque activo se resalta. Los completados se muestran opacos.
 *
 * Props:
 *   schedule          — array de fases de buildSchedule
 *   currentPhaseIndex — índice de la fase activa
 *   detailed          — boolean: si true, muestra segundos en cada bloque
 */
function ProgressBlocks({ schedule, currentPhaseIndex, detailed }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="progress-blocks" aria-label="Progreso del workout">
      {schedule.map((phase, index) => {
        const isActive = index === currentPhaseIndex;
        const isCompleted = index < currentPhaseIndex;
        const phaseClass = PHASE_CLASS[phase.phase] ?? "block--prep";

        return (
          <div
            key={index}
            className={[
              "progress-block",
              phaseClass,
              isActive ? "progress-block--active" : "",
              isCompleted ? "progress-block--completed" : "",
            ].join(" ")}
            aria-current={isActive ? "step" : undefined}
          >
            {detailed && isActive && (
              <span className="progress-block__label">{phase.duration}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressBlocks;
