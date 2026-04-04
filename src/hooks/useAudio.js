import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useAudio
 *
 * Maneja toda la reproducción de sonidos del workout usando archivos MP3.
 *
 * Archivos requeridos en /public/sounds/:
 *   countdown.mp3   — se reproduce en los últimos 3, 2 y 1 segundos del descanso
 *   work-start.mp3  — se reproduce al iniciar cada intervalo de trabajo
 *   work-end.mp3    — se reproduce al terminar un intervalo de trabajo (inicio del descanso)
 *   workout-end.mp3 — se reproduce al finalizar el workout completo
 *
 * Uso:
 *   const audio = useAudio()
 *
 *   useTabataTimer({
 *     onCountdown: audio.playCountdown,
 *     onWorkStart: audio.playWorkStart,
 *     onWorkEnd: audio.playWorkEnd,
 *     onWorkoutEnd: audio.playWorkoutEnd,
 *   })
 */

function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const countdownRef = useRef(null);
  const workStartRef = useRef(null);
  const workEndRef = useRef(null);
  const workoutEndRef = useRef(null);

  // Crear y pre-cargar los objetos Audio al montar
  useEffect(() => {
    countdownRef.current = new Audio("/sounds/countdown.mp3");
    workStartRef.current = new Audio("/sounds/work-start.mp3");
    workEndRef.current = new Audio("/sounds/work-end.mp3");
    workoutEndRef.current = new Audio("/sounds/workout-end.mp3");

    countdownRef.current.load();
    workStartRef.current.load();
    workEndRef.current.load();
    workoutEndRef.current.load();

    return () => {
      countdownRef.current = null;
      workStartRef.current = null;
      workEndRef.current = null;
      workoutEndRef.current = null;
    };
  }, []);

  const playAudio = useCallback((ref) => {
    const audio = ref.current;
    if (!audio) return;
    // Reiniciar por si el sonido anterior aún no terminó (ej: countdown 3→2→1)
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn("useAudio: no se pudo reproducir audio", err);
    });
  }, []);

  // Beep corto: se llama 3 veces (t=3, t=2, t=1) al final de cada descanso
  const playCountdown = useCallback(() => {
    if (!soundEnabled) return;
    playAudio(countdownRef);
  }, [soundEnabled, playAudio]);

  // Sonido de inicio: se llama al arrancar cada intervalo de trabajo
  const playWorkStart = useCallback(() => {
    if (!soundEnabled) return;
    playAudio(workStartRef);
  }, [soundEnabled, playAudio]);

  // Sonido de fin de trabajo: se llama al terminar un intervalo de trabajo e iniciar el descanso
  const playWorkEnd = useCallback(() => {
    if (!soundEnabled) return;
    playAudio(workEndRef);
  }, [soundEnabled, playAudio]);

  // Sonido final: se llama una sola vez al terminar el workout completo
  const playWorkoutEnd = useCallback(() => {
    if (!soundEnabled) return;
    playAudio(workoutEndRef);
  }, [soundEnabled, playAudio]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  /**
   * Llamar en el primer gesto del usuario para desbloquear la política
   * de autoplay del navegador antes de que arranque el timer.
   */
  const unlock = useCallback(() => {
    [countdownRef, workStartRef, workEndRef, workoutEndRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current
        .play()
        .then(() => {
          ref.current.pause();
          ref.current.currentTime = 0;
        })
        .catch(() => {});
    });
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    unlock,
    playCountdown,
    playWorkStart,
    playWorkEnd,
    playWorkoutEnd,
  };
}

export default useAudio;
