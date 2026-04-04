import { useState, useEffect, useRef, useCallback } from "react";
import buildSchedule, { getTotalDuration } from "../utils/buildSchedule";

/**
 * useTabataTimer
 *
 * Motor central de la app. Maneja:
 *   - Navegación entre pantallas
 *   - Construcción del schedule
 *   - Cuenta regresiva con setInterval
 *   - Avance automático entre fases
 *   - Callbacks de audio en momentos clave
 *   - Pausa / reanudar / reiniciar
 *
 * Uso:
 *   const timer = useTabataTimer({ onCountdown, onWorkStart, onWorkEnd, onWorkoutEnd })
 *
 * Callbacks de audio (opcionales):
 *   onCountdown()   — llamado cuando timeRemaining === 3, 2, o 1 en fase de descanso
 *   onWorkStart()   — llamado al iniciar una fase 'work'
 *   onWorkEnd()     — llamado al iniciar una fase 'rest' inmediatamente después de 'work'
 *   onWorkoutEnd()  — llamado cuando el workout termina
 */

function useTabataTimer({ onCountdown, onWorkStart, onWorkEnd, onWorkoutEnd } = {}) {
  // ─── Estado de navegación ────────────────────────────────────────────────
  const [screen, setScreen] = useState("mode-select");
  // 'mode-select' | 'config' | 'timer' | 'complete'

  const [mode, setMode] = useState(null);
  // 'classic' | 'custom' | 'circuit'

  // ─── Estado del timer ────────────────────────────────────────────────────
  const [schedule, setSchedule] = useState([]);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ─── Config guardada ─────────────────────────────────────────────────────
  const lastConfigRef = useRef(null);

  // ─── Refs ────────────────────────────────────────────────────────────────
  const intervalRef = useRef(null);
  // Guardamos valores actuales en refs para usarlos dentro del intervalo
  // sin necesidad de declarar dependencias en el closure
  const scheduleRef = useRef([]);
  const currentPhaseIndexRef = useRef(0);
  const timeRemainingRef = useRef(0);
  const elapsedTimeRef = useRef(0);

  // Sincronizar refs con estado
  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);
  useEffect(() => {
    currentPhaseIndexRef.current = currentPhaseIndex;
  }, [currentPhaseIndex]);
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // ─── Callbacks de audio en refs (evita stale closures) ──────────────────
  const onCountdownRef = useRef(onCountdown);
  const onWorkStartRef = useRef(onWorkStart);
  const onWorkEndRef = useRef(onWorkEnd);
  const onWorkoutEndRef = useRef(onWorkoutEnd);
  useEffect(() => {
    onCountdownRef.current = onCountdown;
  }, [onCountdown]);
  useEffect(() => {
    onWorkStartRef.current = onWorkStart;
  }, [onWorkStart]);
  useEffect(() => {
    onWorkEndRef.current = onWorkEnd;
  }, [onWorkEnd]);
  useEffect(() => {
    onWorkoutEndRef.current = onWorkoutEnd;
  }, [onWorkoutEnd]);

  // ─── Limpiar intervalo al desmontar ─────────────────────────────────────
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // ─── Helpers internos ───────────────────────────────────────────────────

  const clearTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  /**
   * Avanza al siguiente índice de fase.
   * Si ya no hay más fases, termina el workout.
   */
  const advanceToPhase = useCallback(
    (index, sched) => {
      const s = sched ?? scheduleRef.current;

      if (index >= s.length) {
        // Workout completo
        clearTimer();
        setIsRunning(false);
        setIsPaused(false);
        setScreen("complete");
        onWorkoutEndRef.current?.();
        return;
      }

      const phase = s[index];
      setCurrentPhaseIndex(index);
      setTimeRemaining(phase.duration);
      currentPhaseIndexRef.current = index;
      timeRemainingRef.current = phase.duration;

      // Callback de audio al iniciar fase de trabajo
      if (phase.phase === "work") {
        onWorkStartRef.current?.();
      }

      // Callback de audio al iniciar descanso después de trabajo
      if (phase.phase === "rest" && index > 0 && s[index - 1].phase === "work") {
        onWorkEndRef.current?.();
      }
    },
    [clearTimer],
  );

  /**
   * El tick del intervalo. Se ejecuta cada 1 segundo.
   */
  const tick = useCallback(() => {
    const newTimeRemaining = timeRemainingRef.current - 1;
    const newElapsed = elapsedTimeRef.current + 1;

    // Actualizar tiempo transcurrido
    elapsedTimeRef.current = newElapsed;
    setElapsedTime(newElapsed);

    if (newTimeRemaining <= 0) {
      // Fase terminada → avanzar a la siguiente
      const nextIndex = currentPhaseIndexRef.current + 1;
      advanceToPhase(nextIndex);
    } else {
      // Actualizar cuenta regresiva
      timeRemainingRef.current = newTimeRemaining;
      setTimeRemaining(newTimeRemaining);

      // Callback de countdown: en fases de descanso y trabajo, cuando quedan 3 segundos
      const currentPhase = scheduleRef.current[currentPhaseIndexRef.current];
      const isRestPhase = ["rest", "roundRest", "stationRest"].includes(
        currentPhase?.phase,
      );
      const isWorkPhase = currentPhase?.phase === "work";
      const isPrepPhase = currentPhase?.phase === "prep";
      if ((isRestPhase || isWorkPhase || isPrepPhase) && newTimeRemaining === 3) {
        onCountdownRef.current?.();
      }
    }
  }, [advanceToPhase]);

  /**
   * Inicia el intervalo de 1 segundo.
   */
  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, clearTimer]);

  // ─── Acciones públicas ───────────────────────────────────────────────────

  /**
   * Selecciona el modo y navega a la pantalla de configuración.
   */
  const selectMode = useCallback((selectedMode) => {
    setMode(selectedMode);
    setScreen("config");
  }, []);

  /**
   * Recibe la config validada desde ConfigScreen,
   * construye el schedule y arranca el workout.
   */
  const startWorkout = useCallback(
    (config) => {
      // Persistir config para poder relanzar sin pasar por el formulario
      lastConfigRef.current = config;
      try {
        localStorage.setItem("tabata_last_config", JSON.stringify(config));
      } catch (_) {
        // localStorage no disponible — no es crítico
      }

      let sched;
      try {
        sched = buildSchedule(config);
      } catch (err) {
        console.error("Error construyendo schedule:", err);
        return;
      }

      if (sched.length === 0) {
        console.error("Schedule vacío");
        return;
      }

      const duration = getTotalDuration(sched);

      setSchedule(sched);
      scheduleRef.current = sched;

      setTotalDuration(duration);
      setElapsedTime(0);
      elapsedTimeRef.current = 0;

      setIsRunning(true);
      setIsPaused(false);
      setScreen("timer");

      // Iniciar en la primera fase
      advanceToPhase(0, sched);
      // Iniciar el intervalo con un pequeño delay para que React
      // termine de renderizar antes del primer tick
      setTimeout(() => startInterval(), 100);
    },
    [advanceToPhase, startInterval],
  );

  /**
   * Pausa el timer.
   */
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    clearTimer();
    setIsPaused(true);
  }, [isRunning, isPaused, clearTimer]);

  /**
   * Reanuda el timer desde donde estaba.
   */
  const resume = useCallback(() => {
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    startInterval();
  }, [isRunning, isPaused, startInterval]);

  /**
   * Alterna entre pausa y reanudación.
   */
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  /**
   * Vuelve al inicio del workout (mantiene el modo y la config).
   * Útil para el botón "Reiniciar" dentro del timer.
   */
  const restart = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setSchedule([]);
    setCurrentPhaseIndex(0);
    setTimeRemaining(0);
    setElapsedTime(0);
    setScreen("config");
  }, [clearTimer]);

  /**
   * Relanza el último workout directamente, sin pasar por el formulario.
   * Usa la config guardada en memoria (o recupera desde localStorage como fallback).
   */
  const repeatWorkout = useCallback(() => {
    let config = lastConfigRef.current;
    if (!config) {
      try {
        const saved = localStorage.getItem("tabata_last_config");
        if (saved) config = JSON.parse(saved);
      } catch (_) {}
    }
    if (!config) return; // no hay config guardada, no hace nada
    startWorkout(config);
  }, [startWorkout]);

  /**
   * Vuelve completamente al inicio (selección de modo).
   */
  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setMode(null);
    setSchedule([]);
    setCurrentPhaseIndex(0);
    setTimeRemaining(0);
    setElapsedTime(0);
    setScreen("mode-select");
  }, [clearTimer]);

  // ─── Datos derivados ─────────────────────────────────────────────────────

  const currentPhase = schedule[currentPhaseIndex] ?? null;

  /**
   * Progreso de la fase actual (0 a 1).
   * Útil para animar la barra de progreso interna de la fase.
   */
  const phaseProgress = currentPhase
    ? 1 - timeRemaining / currentPhase.duration
    : 0;

  /**
   * Progreso total del workout (0 a 1).
   */
  const workoutProgress = totalDuration > 0 ? elapsedTime / totalDuration : 0;

  // ─── Return ──────────────────────────────────────────────────────────────

  return {
    // Navegación
    screen,
    mode,
    selectMode,

    // Control del workout
    startWorkout,
    pause,
    resume,
    togglePause,
    restart,
    repeatWorkout,
    reset,

    // Estado del timer
    schedule,
    currentPhaseIndex,
    currentPhase,
    timeRemaining,
    isRunning,
    isPaused,

    // Métricas
    totalDuration,
    elapsedTime,
    phaseProgress,
    workoutProgress,
  };
}

export default useTabataTimer;
