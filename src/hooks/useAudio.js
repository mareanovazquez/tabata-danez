import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useAudio
 *
 * Maneja toda la reproducción de sonidos del workout.
 *
 * Estrategia de audio:
 *   - Usa Web Audio API (AudioContext) para generar beeps sintéticos.
 *   - NO depende de archivos mp3/wav externos — funciona sin assets.
 *   - Los navegadores modernos bloquean AudioContext hasta que el usuario
 *     interactúa con la página. Por eso el contexto se crea (o desbloquea)
 *     en el primer click/tap, no al montar el componente.
 *
 * Sonidos disponibles:
 *   playCountdown()  — beep corto y agudo (últimos 3s antes de cada trabajo)
 *   playWorkStart()  — beep doble grave-agudo (inicio de intervalo de trabajo)
 *   playWorkoutEnd() — acorde largo (fin del workout completo)
 *
 * Uso:
 *   const audio = useAudio()
 *
 *   // En useTabataTimer:
 *   useTabataTimer({
 *     onCountdown: audio.playCountdown,
 *     onWorkStart: audio.playWorkStart,
 *     onWorkoutEnd: audio.playWorkoutEnd,
 *   })
 *
 *   // En ConfigScreen:
 *   <toggle checked={audio.soundEnabled} onChange={audio.toggleSound} />
 */

// ─── Helpers de síntesis de audio ────────────────────────────────────────────

/**
 * Reproduce un tono simple.
 * @param {AudioContext} ctx
 * @param {number} frequency  - Hz
 * @param {number} duration   - segundos
 * @param {number} startTime  - segundos desde ctx.currentTime
 * @param {string} type       - 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number} gain       - volumen (0 a 1)
 */
function playTone(
  ctx,
  frequency,
  duration,
  startTime = 0,
  type = "sine",
  gain = 0.4,
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  // Envelope: fade in rápido, fade out suave para evitar clicks
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(
    gain,
    ctx.currentTime + startTime + 0.01,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + startTime + duration,
  );

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.05);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // AudioContext se crea lazy (en el primer uso) para cumplir con la
  // política de autoplay de los navegadores modernos
  const audioCtxRef = useRef(null);

  // Limpiar AudioContext al desmontar
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  /**
   * Obtiene (o crea) el AudioContext.
   * Si está suspendido (política de autoplay), lo reanuda.
   * Devuelve null si hay un error — en ese caso el sonido se silencia
   * gracefully sin romper la app.
   */
  const getCtx = useCallback(async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (err) {
      console.warn("useAudio: no se pudo inicializar AudioContext", err);
      return null;
    }
  }, []);

  // ─── Sonidos ─────────────────────────────────────────────────────────────

  /**
   * Beep corto y agudo.
   * Se llama en los últimos 3 segundos de cada fase de descanso.
   * Cada llamada reproduce UN beep (el hook recibe 3 llamadas: en t=3, t=2, t=1).
   */
  const playCountdown = useCallback(async () => {
    if (!soundEnabled) return;
    const ctx = await getCtx();
    if (!ctx) return;

    playTone(ctx, 880, 0.12, 0, "sine", 0.35);
  }, [soundEnabled, getCtx]);

  /**
   * Beep doble: grave → agudo.
   * Marca el inicio de cada intervalo de trabajo.
   */
  const playWorkStart = useCallback(async () => {
    if (!soundEnabled) return;
    const ctx = await getCtx();
    if (!ctx) return;

    playTone(ctx, 440, 0.15, 0.0, "sine", 0.5); // grave
    playTone(ctx, 880, 0.2, 0.18, "sine", 0.5); // agudo
  }, [soundEnabled, getCtx]);

  /**
   * Acorde largo descendente.
   * Marca el fin del workout completo.
   */
  const playWorkoutEnd = useCallback(async () => {
    if (!soundEnabled) return;
    const ctx = await getCtx();
    if (!ctx) return;

    playTone(ctx, 880, 0.3, 0.0, "sine", 0.5);
    playTone(ctx, 660, 0.3, 0.3, "sine", 0.5);
    playTone(ctx, 440, 0.6, 0.6, "sine", 0.5);
  }, [soundEnabled, getCtx]);

  // ─── Control de sonido ───────────────────────────────────────────────────

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  /**
   * Llamar esto en el primer gesto del usuario (ej: click en "Empezar")
   * para desbloquear el AudioContext antes de que arranque el timer.
   * Evita que el primer beep se pierda por la política de autoplay.
   */
  const unlock = useCallback(async () => {
    await getCtx();
  }, [getCtx]);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    unlock,
    playCountdown,
    playWorkStart,
    playWorkoutEnd,
  };
}

export default useAudio;
