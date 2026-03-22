import {
  Minus,
  Plus,
  X,
  Trash2,
  Volume2,
  VolumeX,
  ChevronLeft,
  Play,
} from "lucide-react";
import { useState } from "react";
import "../styles/components/configScreen.css";

// ─── Leer config guardada en localStorage ────────────────────────────────────

function getSavedConfig(mode) {
  try {
    const raw = localStorage.getItem("tabata_last_config");
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved?.mode === mode ? saved : null;
  } catch (_) {
    return null;
  }
}

// ─── Defaults por modo ────────────────────────────────────────────────────────

const CLASSIC_DEFAULTS = {
  exercise: "",
  prepTime: 5,
};

const CUSTOM_DEFAULTS = {
  rounds: 4,
  workTime: 20,
  restTime: 10,
  roundRestTime: 15,
  prepTime: 5,
  exercises: ["", "", "", ""],
};

const CIRCUIT_DEFAULTS = {
  repsPerStation: 4,
  workTime: 20,
  restTime: 10,
  stationRestTime: 30,
  prepTime: 5,
  stations: ["", "", "", "", "", ""],
  students: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 999,
  unit = "s",
}) {
  return (
    <div className="config-field">
      <label className="config-field__label">{label}</label>
      <div className="config-field__number">
        <button
          className="config-field__stepper"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Reducir ${label}`}
        >
          <Minus size={16} />
        </button>
        <span className="config-field__value">
          {value}
          {unit}
        </span>
        <button
          className="config-field__stepper"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function ExerciseList({ items, onChange, label, placeholder }) {
  const updateItem = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => onChange([...items, ""]);

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="config-exercise-list">
      <span className="config-field__label">{label}</span>
      <div className="config-exercise-list__items">
        {items.map((item, index) => (
          <div key={index} className="config-exercise-list__row">
            <span className="config-exercise-list__number">{index + 1}</span>
            <input
              className="config-exercise-list__input"
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              maxLength={40}
            />
            {item.length > 0 && (
              <button
                className="config-exercise-list__clear"
                onClick={() => updateItem(index, "")}
                aria-label="Vaciar campo"
              >
                <Trash2 size={15} />
              </button>
            )}
            {items.length > 1 && (
              <button
                className="config-exercise-list__remove"
                onClick={() => removeItem(index)}
                aria-label="Eliminar"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="config-exercise-list__add" onClick={addItem}>
        + Agregar {label.toLowerCase().replace("s", "")}
      </button>
    </div>
  );
}

// ─── Formulario: Tabata Clásico ───────────────────────────────────────────────

function ClassicForm({ onStart, onBack, soundEnabled, onToggleSound }) {
  const [form, setForm] = useState(() => {
    const saved = getSavedConfig("classic");
    return saved
      ? { exercise: saved.exercise ?? "", prepTime: saved.prepTime ?? 5 }
      : CLASSIC_DEFAULTS;
  });

  const isValid = form.exercise.trim().length > 0;

  const handleStart = () => {
    if (!isValid) return;
    onStart({
      mode: "classic",
      exercise: form.exercise.trim(),
      prepTime: form.prepTime,
    });
  };

  return (
    <div className="config-form config-form--classic">
      <div className="config-form__info-badge">
        8 rondas · 20s trabajo · 10s descanso
      </div>

      <div className="config-form__fields">
        <div className="config-field config-field--full">
          <label className="config-field__label">Ejercicio</label>
          <input
            className="config-field__text-input"
            type="text"
            value={form.exercise}
            onChange={(e) => setForm({ ...form, exercise: e.target.value })}
            placeholder="Ej: Burpees"
            maxLength={40}
            autoFocus
          />
        </div>

        <NumberInput
          label="Preparación"
          value={form.prepTime}
          onChange={(v) => setForm({ ...form, prepTime: v })}
          min={0}
          max={30}
        />
      </div>

      <ConfigFooter
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onBack={onBack}
        onStart={handleStart}
        isValid={isValid}
      />
    </div>
  );
}

// ─── Formulario: Tabata Personalizado ────────────────────────────────────────

function CustomForm({ onStart, onBack, soundEnabled, onToggleSound }) {
  const [form, setForm] = useState(() => {
    const saved = getSavedConfig("custom");
    return saved
      ? {
          rounds: saved.rounds ?? CUSTOM_DEFAULTS.rounds,
          workTime: saved.workTime ?? CUSTOM_DEFAULTS.workTime,
          restTime: saved.restTime ?? CUSTOM_DEFAULTS.restTime,
          roundRestTime: saved.roundRestTime ?? CUSTOM_DEFAULTS.roundRestTime,
          prepTime: saved.prepTime ?? CUSTOM_DEFAULTS.prepTime,
          exercises:
            saved.exercises?.length > 0
              ? saved.exercises
              : CUSTOM_DEFAULTS.exercises,
        }
      : CUSTOM_DEFAULTS;
  });

  const filledExercises = form.exercises.filter((e) => e.trim().length > 0);
  const isValid = filledExercises.length > 0;

  const handleStart = () => {
    if (!isValid) return;
    onStart({
      mode: "custom",
      rounds: form.rounds,
      exercises: filledExercises,
      workTime: form.workTime,
      restTime: form.restTime,
      roundRestTime: form.roundRestTime,
      prepTime: form.prepTime,
    });
  };

  return (
    <div className="config-form config-form--custom">
      <div className="config-form__fields config-form__fields--grid">
        <NumberInput
          label="Rondas"
          value={form.rounds}
          onChange={(v) => setForm({ ...form, rounds: v })}
          min={1}
          max={20}
          unit=""
        />
        <NumberInput
          label="Trabajo"
          value={form.workTime}
          onChange={(v) => setForm({ ...form, workTime: v })}
          min={5}
          max={120}
        />
        <NumberInput
          label="Descanso"
          value={form.restTime}
          onChange={(v) => setForm({ ...form, restTime: v })}
          min={0}
          max={60}
        />
        <NumberInput
          label="Entre rondas"
          value={form.roundRestTime}
          onChange={(v) => setForm({ ...form, roundRestTime: v })}
          min={0}
          max={180}
        />
        <NumberInput
          label="Preparación"
          value={form.prepTime}
          onChange={(v) => setForm({ ...form, prepTime: v })}
          min={0}
          max={30}
        />
      </div>

      <ExerciseList
        items={form.exercises}
        onChange={(exercises) => setForm({ ...form, exercises })}
        label="Ejercicios"
        placeholder="Ejercicio"
      />

      <ConfigFooter
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onBack={onBack}
        onStart={handleStart}
        isValid={isValid}
      />
    </div>
  );
}

// ─── Formulario: Circuito ─────────────────────────────────────────────────────

function CircuitForm({ onStart, onBack, soundEnabled, onToggleSound }) {
  const [form, setForm] = useState(() => {
    const saved = getSavedConfig("circuit");
    return saved
      ? {
          repsPerStation:
            saved.repsPerStation ?? CIRCUIT_DEFAULTS.repsPerStation,
          workTime: saved.workTime ?? CIRCUIT_DEFAULTS.workTime,
          restTime: saved.restTime ?? CIRCUIT_DEFAULTS.restTime,
          stationRestTime:
            saved.stationRestTime ?? CIRCUIT_DEFAULTS.stationRestTime,
          prepTime: saved.prepTime ?? CIRCUIT_DEFAULTS.prepTime,
          stations:
            saved.stations?.length > 0
              ? saved.stations
              : CIRCUIT_DEFAULTS.stations,
          students: saved.students ?? CIRCUIT_DEFAULTS.students,
        }
      : CIRCUIT_DEFAULTS;
  });

  const filledStations = form.stations.filter((s) => s.trim().length > 0);
  const filledStudents = form.students.filter((s) => s.trim().length > 0);
  const tooManyStudents = filledStudents.length > filledStations.length;
  const isValid = filledStations.length > 0 && !tooManyStudents;

  const handleStart = () => {
    if (!isValid) return;
    onStart({
      mode: "circuit",
      stations: filledStations,
      students: filledStudents,
      repsPerStation: form.repsPerStation,
      workTime: form.workTime,
      restTime: form.restTime,
      stationRestTime: form.stationRestTime,
      prepTime: form.prepTime,
    });
  };

  return (
    <div className="config-form config-form--circuit">
      <div className="config-form__fields config-form__fields--grid">
        <NumberInput
          label="Reps / estación"
          value={form.repsPerStation}
          onChange={(v) => setForm({ ...form, repsPerStation: v })}
          min={1}
          max={20}
          unit=""
        />
        <NumberInput
          label="Trabajo"
          value={form.workTime}
          onChange={(v) => setForm({ ...form, workTime: v })}
          min={5}
          max={120}
        />
        <NumberInput
          label="Descanso"
          value={form.restTime}
          onChange={(v) => setForm({ ...form, restTime: v })}
          min={0}
          max={60}
        />
        <NumberInput
          label="Entre estaciones"
          value={form.stationRestTime}
          onChange={(v) => setForm({ ...form, stationRestTime: v })}
          min={0}
          max={180}
        />
        <NumberInput
          label="Preparación"
          value={form.prepTime}
          onChange={(v) => setForm({ ...form, prepTime: v })}
          min={0}
          max={30}
        />
      </div>

      <ExerciseList
        items={form.stations}
        onChange={(stations) => setForm({ ...form, stations })}
        label="Estaciones"
        placeholder="Estación"
      />

      <ExerciseList
        items={form.students}
        onChange={(students) => setForm({ ...form, students })}
        label="Alumnos"
        placeholder="Alumno"
      />

      <ConfigFooter
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onBack={onBack}
        onStart={handleStart}
        isValid={isValid}
      />

      {tooManyStudents && (
        <p className="config-form__error">Hay más alumnos que estaciones</p>
      )}
    </div>
  );
}

// ─── Footer compartido ────────────────────────────────────────────────────────

function ConfigFooter({
  soundEnabled,
  onToggleSound,
  onBack,
  onStart,
  isValid,
}) {
  return (
    <div className="config-footer">
      <button
        className={`config-footer__sound ${soundEnabled ? "config-footer__sound--on" : ""}`}
        onClick={onToggleSound}
        aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} Sonido{" "}
        {soundEnabled ? "ON" : "OFF"}
      </button>

      <div className="config-footer__actions">
        <button className="config-footer__back" onClick={onBack}>
          <ChevronLeft size={18} /> Volver
        </button>
        <button
          className="config-footer__start"
          onClick={onStart}
          disabled={!isValid}
        >
          Empezar <Play size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Mapa de títulos y componentes ────────────────────────────────────────────

const MODE_CONFIG = {
  classic: {
    title: "Tabata Clásico",
    accent: "var(--color-work)",
    Form: ClassicForm,
  },
  custom: {
    title: "Tabata Personalizado",
    accent: "var(--color-rest)",
    Form: CustomForm,
  },
  circuit: {
    title: "Circuito",
    accent: "var(--color-round-rest)",
    Form: CircuitForm,
  },
};

// ─── Componente principal ─────────────────────────────────────────────────────

function ConfigScreen({ mode, soundEnabled, onToggleSound, onStart, onBack }) {
  const { title, accent, Form } = MODE_CONFIG[mode] ?? {};

  if (!Form) return null;

  return (
    <div className="config-screen" style={{ "--mode-accent": accent }}>
      <header className="config-screen__header">
        <h1 className="config-screen__title">{title}</h1>
        <div className="config-screen__accent-bar" />
      </header>

      <div className="config-screen__body">
        <Form
          onStart={onStart}
          onBack={onBack}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      </div>
    </div>
  );
}

export default ConfigScreen;
