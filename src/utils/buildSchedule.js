/**
 * buildSchedule.js
 *
 * Recibe una config y devuelve un array plano de fases (schedule).
 * Cada fase es un objeto que describe un intervalo del workout.
 *
 * Tipos de fase:
 *   'prep'        — cuenta regresiva inicial antes de arrancar
 *   'work'        — intervalo de trabajo
 *   'rest'        — descanso entre ejercicios / repeticiones
 *   'roundRest'   — descanso entre rondas (Tabata Personalizado)
 *   'stationRest' — descanso entre estaciones (Circuito)
 *
 * Cada fase tiene:
 * {
 *   phase: string,
 *   exercise: string,
 *   duration: number,        // segundos
 *   roundNumber: number,     // 1-indexed (null si no aplica)
 *   totalRounds: number,     // total de rondas (null si no aplica)
 *   exerciseNumber: number,  // posición del ejercicio en la ronda (1-indexed)
 *   totalExercises: number,  // total de ejercicios por ronda
 *   stationNumber: number,   // número de estación 1-indexed (solo circuito)
 *   totalStations: number,   // total de estaciones (solo circuito)
 *   repNumber: number,       // repetición dentro de la estación (solo circuito)
 *   totalReps: number,       // total de reps por estación (solo circuito)
 *   nextExercise: string,    // nombre del próximo ejercicio (null si no hay)
 * }
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePhase(overrides) {
  return {
    phase: null,
    exercise: null,
    duration: 0,
    roundNumber: null,
    totalRounds: null,
    exerciseNumber: null,
    totalExercises: null,
    stationNumber: null,
    totalStations: null,
    repNumber: null,
    totalReps: null,
    nextExercise: null,
    ...overrides,
  };
}

/**
 * Dado un schedule ya construido (sin prep), calcula el nextExercise para
 * cada fase de descanso.
 * nextExercise = el ejercicio de la próxima fase 'work' que venga después.
 */
function annotateNextExercise(phases) {
  // Para cada fase, buscamos la próxima fase 'work' que sigue
  return phases.map((phase, i) => {
    if (
      phase.phase !== "rest" &&
      phase.phase !== "roundRest" &&
      phase.phase !== "stationRest"
    ) {
      return phase;
    }
    // Buscar la próxima fase work
    const nextWork = phases.slice(i + 1).find((p) => p.phase === "work");
    return {
      ...phase,
      nextExercise: nextWork ? nextWork.exercise : null,
    };
  });
}

// ─── Tabata Clásico ───────────────────────────────────────────────────────────

/**
 * Config esperada:
 * {
 *   mode: 'classic',
 *   exercise: string,
 *   prepTime: number,   // default 5
 * }
 *
 * Fijo: 8 rondas, 20s trabajo, 10s descanso
 * No hay descanso al final de la última ronda.
 */
function buildClassicSchedule(config) {
  const { exercise, prepTime = 5 } = config;

  const ROUNDS = 8;
  const WORK_TIME = 20;
  const REST_TIME = 10;

  const phases = [];

  // Fase de preparación
  if (prepTime > 0) {
    phases.push(
      makePhase({
        phase: "prep",
        exercise,
        duration: prepTime,
        roundNumber: 1,
        totalRounds: ROUNDS,
        exerciseNumber: 1,
        totalExercises: 1,
      }),
    );
  }

  for (let round = 1; round <= ROUNDS; round++) {
    // Trabajo
    phases.push(
      makePhase({
        phase: "work",
        exercise,
        duration: WORK_TIME,
        roundNumber: round,
        totalRounds: ROUNDS,
        exerciseNumber: 1,
        totalExercises: 1,
      }),
    );

    // Descanso (excepto después de la última ronda)
    if (round < ROUNDS) {
      phases.push(
        makePhase({
          phase: "rest",
          exercise,
          duration: REST_TIME,
          roundNumber: round,
          totalRounds: ROUNDS,
          exerciseNumber: 1,
          totalExercises: 1,
        }),
      );
    }
  }

  return annotateNextExercise(phases);
}

// ─── Tabata Personalizado ─────────────────────────────────────────────────────

/**
 * Config esperada:
 * {
 *   mode: 'custom',
 *   rounds: number,
 *   exercises: string[],    // los ejercicios se repiten en cada ronda
 *   workTime: number,
 *   restTime: number,
 *   roundRestTime: number,
 *   prepTime: number,       // default 5
 * }
 *
 * Estructura:
 *   prep
 *   [ronda 1]
 *     work ej1 → rest → work ej2 → rest → ... → work ejN
 *   roundRest
 *   [ronda 2]
 *     ...
 *   (sin roundRest después de la última ronda)
 */
function buildCustomSchedule(config) {
  const {
    rounds,
    exercises,
    workTime,
    restTime,
    roundRestTime,
    prepTime = 5,
  } = config;

  const totalExercises = exercises.length;
  const phases = [];

  // Prep
  if (prepTime > 0) {
    phases.push(
      makePhase({
        phase: "prep",
        exercise: exercises[0],
        duration: prepTime,
        roundNumber: 1,
        totalRounds: rounds,
        exerciseNumber: 1,
        totalExercises,
      }),
    );
  }

  for (let round = 1; round <= rounds; round++) {
    for (let exIdx = 0; exIdx < totalExercises; exIdx++) {
      const exercise = exercises[exIdx];
      const exerciseNumber = exIdx + 1;
      const isLastExerciseInRound = exIdx === totalExercises - 1;
      const isLastRound = round === rounds;

      // Trabajo
      phases.push(
        makePhase({
          phase: "work",
          exercise,
          duration: workTime,
          roundNumber: round,
          totalRounds: rounds,
          exerciseNumber,
          totalExercises,
        }),
      );

      if (isLastExerciseInRound) {
        // Descanso entre rondas (excepto después de la última ronda)
        if (!isLastRound && roundRestTime > 0) {
          phases.push(
            makePhase({
              phase: "roundRest",
              exercise,
              duration: roundRestTime,
              roundNumber: round,
              totalRounds: rounds,
              exerciseNumber,
              totalExercises,
            }),
          );
        }
      } else {
        // Descanso entre ejercicios dentro de la ronda
        if (restTime > 0) {
          phases.push(
            makePhase({
              phase: "rest",
              exercise,
              duration: restTime,
              roundNumber: round,
              totalRounds: rounds,
              exerciseNumber,
              totalExercises,
            }),
          );
        }
      }
    }
  }

  return annotateNextExercise(phases);
}

// ─── Circuito ─────────────────────────────────────────────────────────────────

/**
 * Config esperada:
 * {
 *   mode: 'circuit',
 *   stations: string[],      // nombre de cada estación
 *   students: string[],      // nombres de los alumnos (puede ser vacío)
 *   repsPerStation: number,
 *   workTime: number,
 *   restTime: number,        // descanso entre reps dentro de la rotación
 *   stationRestTime: number, // descanso entre rotaciones
 *   prepTime: number,        // default 5
 * }
 *
 * El workout tiene totalStations rotaciones.
 * En cada rotación R (1-indexed), alumno[i] va a estación[(i + R - 1) % totalStations].
 * Si hay menos alumnos que estaciones, las posiciones sobrantes tienen studentName = null.
 *
 * Estructura:
 *   prep (con assignments de rotación 1)
 *   [rotación 1]
 *     work rep1 → rest → work rep2 → rest → ... → work repN
 *   stationRest (con assignments de rotación 2)
 *   [rotación 2]
 *     ...
 *   [rotación totalStations]
 *     work rep1 → rest → ... → work repN
 *   (sin stationRest después de la última rotación)
 *
 * El stationRest lleva los assignments de la rotación SIGUIENTE.
 */
function buildCircuitSchedule(config) {
  const {
    stations,
    students = [],
    repsPerStation,
    workTime,
    restTime,
    stationRestTime,
    prepTime = 5,
  } = config;

  const totalStations = stations.length;
  const totalRotations = totalStations;
  const phases = [];

  // Helper: calcula assignments para una rotación dada
  function getAssignments(rotationNumber) {
    return stations.map((stationName, stationIndex) => {
      // alumno[i] → estación[(i + R - 1) % totalStations]
      // Buscamos qué alumno (si hay) corresponde a esta estación
      let studentName = null;
      for (let i = 0; i < students.length; i++) {
        if ((i + rotationNumber - 1) % totalStations === stationIndex) {
          studentName = students[i];
          break;
        }
      }
      return {
        stationIndex,
        stationName,
        studentName,
      };
    });
  }

  // Prep - lleva assignments de la rotación 1
  if (prepTime > 0) {
    phases.push(
      makePhase({
        phase: "prep",
        exercise: null,
        duration: prepTime,
        rotationNumber: 1,
        totalRotations,
        repNumber: 1,
        totalReps: repsPerStation,
        assignments: getAssignments(1),
      }),
    );
  }

  for (let rotation = 1; rotation <= totalRotations; rotation++) {
    const isLastRotation = rotation === totalRotations;
    const currentAssignments = getAssignments(rotation);

    for (let rep = 1; rep <= repsPerStation; rep++) {
      const isLastRep = rep === repsPerStation;

      // Trabajo
      phases.push(
        makePhase({
          phase: "work",
          exercise: null,
          duration: workTime,
          rotationNumber: rotation,
          totalRotations,
          repNumber: rep,
          totalReps: repsPerStation,
          assignments: currentAssignments,
        }),
      );

      if (isLastRep) {
        // stationRest después de la última rep (excepto en la última rotación)
        // Lleva los assignments de la SIGUIENTE rotación
        if (!isLastRotation && stationRestTime > 0) {
          phases.push(
            makePhase({
              phase: "stationRest",
              exercise: null,
              duration: stationRestTime,
              rotationNumber: rotation,
              totalRotations,
              repNumber: rep,
              totalReps: repsPerStation,
              assignments: getAssignments(rotation + 1),
            }),
          );
        }
      } else {
        // rest entre reps dentro de la rotación
        if (restTime > 0) {
          phases.push(
            makePhase({
              phase: "rest",
              exercise: null,
              duration: restTime,
              rotationNumber: rotation,
              totalRotations,
              repNumber: rep,
              totalReps: repsPerStation,
              assignments: currentAssignments,
            }),
          );
        }
      }
    }
  }

  return phases;
}

// ─── Entrada principal ────────────────────────────────────────────────────────

/**
 * buildSchedule(config) → Phase[]
 *
 * Despacha al builder correcto según config.mode.
 * Lanza un error si el modo es desconocido o la config es inválida.
 */
function buildSchedule(config) {
  if (!config || !config.mode) {
    throw new Error("buildSchedule: config.mode es requerido");
  }

  switch (config.mode) {
    case "classic":
      if (!config.exercise)
        throw new Error("Tabata Clásico requiere config.exercise");
      return buildClassicSchedule(config);

    case "custom":
      if (!config.exercises || config.exercises.length === 0)
        throw new Error("Tabata Personalizado requiere al menos un ejercicio");
      if (!config.rounds || config.rounds < 1)
        throw new Error("Tabata Personalizado requiere al menos 1 ronda");
      return buildCustomSchedule(config);

    case "circuit":
      if (!config.stations || config.stations.length === 0)
        throw new Error("Circuito requiere al menos una estación");
      if (!config.repsPerStation || config.repsPerStation < 1)
        throw new Error("Circuito requiere al menos 1 repetición por estación");
      return buildCircuitSchedule(config);

    default:
      throw new Error(`buildSchedule: modo desconocido "${config.mode}"`);
  }
}

export default buildSchedule;

// ─── Utilidades exportadas (opcionales, útiles para el timer) ─────────────────

/**
 * Calcula la duración total de un schedule en segundos.
 */
export function getTotalDuration(schedule) {
  return schedule.reduce((acc, phase) => acc + phase.duration, 0);
}

/**
 * Dado un schedule, devuelve el índice de la primer fase 'work'.
 * Útil para saber dónde arranca realmente el workout (después del prep).
 */
export function getFirstWorkIndex(schedule) {
  return schedule.findIndex((p) => p.phase === "work");
}
