import "./styles/global.css";

import useAudio from "./hooks/useAudio";
import useTabataTimer from "./hooks/useTabataTimer";

import ModeSelector from "./components/ModeSelector";
import ConfigScreen from "./components/ConfigScreen";
import TimerScreen from "./components/TimerScreen";
import CompleteScreen from "./components/CompleteScreen";

function App() {
  const audio = useAudio();

  const timer = useTabataTimer({
    onCountdown: audio.playCountdown,
    onWorkStart: audio.playWorkStart,
    onWorkoutEnd: audio.playWorkoutEnd,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────

  // Al tocar "Empezar" en ConfigScreen: desbloquear audio y arrancar el timer
  const handleStart = (config) => {
    audio.unlock();
    timer.startWorkout(config);
  };

  // ─── Routing ─────────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (timer.screen) {
      case "mode-select":
        return <ModeSelector onSelectMode={timer.selectMode} />;

      case "config":
        return (
          <ConfigScreen
            mode={timer.mode}
            soundEnabled={audio.soundEnabled}
            onToggleSound={audio.toggleSound}
            onStart={handleStart}
            onBack={timer.reset}
          />
        );

      case "timer":
        return (
          <TimerScreen
            schedule={timer.schedule}
            currentPhase={timer.currentPhase}
            currentPhaseIndex={timer.currentPhaseIndex}
            timeRemaining={timer.timeRemaining}
            isRunning={timer.isRunning}
            isPaused={timer.isPaused}
            phaseProgress={timer.phaseProgress}
            workoutProgress={timer.workoutProgress}
            onTogglePause={timer.togglePause}
            onRestart={timer.restart}
            onReset={timer.reset}
          />
        );

      case "complete":
        return (
          <CompleteScreen
            mode={timer.mode}
            schedule={timer.schedule}
            elapsedTime={timer.elapsedTime}
            onNewWorkout={timer.reset}
            onRepeat={timer.repeatWorkout}
          />
        );

      default:
        return null;
    }
  };

  return <div className="app">{renderScreen()}</div>;
}

export default App;
