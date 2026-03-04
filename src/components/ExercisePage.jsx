import { useState } from "react";
import { Button } from "react-bootstrap";
import { MUSCLE_LIST } from "../models/muscles";
import { fetchExercisesByMuscle } from "../api/apiNinjas";
import { Workout, Exercise } from "../models/workout";
import { useNavigate } from "react-router";

function ExercisePage() {
  const navigate = useNavigate();
  
  // State for muscle selection and API
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for selected exercises with rounds/rows
  const [selectedExercises, setSelectedExercises] = useState([]);

  // Fetch exercises from API
  async function handleFetchExercises() {
    if (!selectedMuscle) return;
    
    setLoading(true);
    setError("");
    try {
      const data = await fetchExercisesByMuscle(selectedMuscle);
      setAvailableExercises(data);
    } catch (e) {
      setError(e?.message || "Failed to load exercises");
      setAvailableExercises([]);
    } finally {
      setLoading(false);
    }
  }

  // Add exercise to selected list
  function handleAddExercise(exercise) {
    // Check if already added
    if (selectedExercises.find((e) => e.name === exercise.name)) return;
    
    setSelectedExercises([
      ...selectedExercises,
      {
        name: exercise.name,
        muscle: exercise.muscle,
        difficulty: exercise.difficulty,
        rounds: 3,
        rows: 10,
      },
    ]);
  }

  // Remove exercise from selected list
  function handleRemoveExercise(exerciseName) {
    setSelectedExercises(selectedExercises.filter((e) => e.name !== exerciseName));
  }

  // Update rounds/rows for an exercise
  function handleUpdateExercise(exerciseName, field, value) {
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.name === exerciseName ? { ...e, [field]: Math.max(1, Number(value)) } : e
      )
    );
  }

  // Save workout to localStorage
  function handleSaveWorkout() {
    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise");
      return;
    }

    // Create Exercise objects
    const exerciseList = selectedExercises.map((ex, index) => 
      new Exercise(index + 1, ex.name, ex.muscle, ex.rounds, ex.rows)
    );

    // Create Workout object
    const newWorkout = new Workout(exerciseList);

    // Get existing workouts from localStorage
    const existingData = localStorage.getItem("workout_logs");
    const workouts = existingData ? JSON.parse(existingData) : [];

    // Add new workout
    workouts.push(newWorkout);

    // Save to localStorage
    localStorage.setItem("workout_logs", JSON.stringify(workouts));

    // Navigate back to home
    navigate("/");
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="summary-section mb-5">
        <h2 className="fw-bold">Add New Workout</h2>
        <p className="text-muted">Select exercises and set your rounds & rows</p>
      </div>

      {/* Muscle Selection */}
      <div className="workout-column-card mb-4">
        <div className="card-header-custom">
          <span className="date-badge">Step 1: Choose Muscle Group</span>
        </div>
        <div className="exercise-list">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              <option value="">-- Select Muscle --</option>
              {MUSCLE_LIST.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle.replace("_", " ")}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              onClick={handleFetchExercises}
              disabled={loading || !selectedMuscle}
            >
              {loading ? "Loading..." : "Fetch Exercises"}
            </Button>
          </div>

          {error && <p className="mt-3" style={{ color: "red" }}>{error}</p>}
        </div>
      </div>

      {/* Available Exercises */}
      {availableExercises.length > 0 && (
        <div className="workout-column-card mb-4">
          <div className="card-header-custom">
            <span className="date-badge">Step 2: Select Exercises</span>
          </div>
          <div className="exercise-list">
            {availableExercises.map((exercise) => {
              const isSelected = selectedExercises.find((e) => e.name === exercise.name);
              return (
                <div key={exercise.name} className="exercise-item">
                  <div className="ex-info">
                    <div className="ex-name">{exercise.name}</div>
                    <div className="ex-muscle">
                      {exercise.difficulty} • {exercise.type}
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "secondary" : "outline-primary"}
                    size="sm"
                    onClick={() => handleAddExercise(exercise)}
                    disabled={isSelected}
                  >
                    {isSelected ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Exercises with Rounds/Rows */}
      {selectedExercises.length > 0 && (
        <div className="workout-column-card mb-4">
          <div className="card-header-custom">
            <span className="date-badge">Step 3: Set Rounds & Rows</span>
          </div>
          <div className="exercise-list">
            {selectedExercises.map((exercise) => (
              <div key={exercise.name} className="exercise-item">
                <div className="ex-info">
                  <div className="ex-name">{exercise.name}</div>
                  <div className="ex-muscle">{exercise.muscle}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center gap-1">
                    <label style={{ fontSize: "0.85rem", color: "#666" }}>Rounds:</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.rounds}
                      onChange={(e) => handleUpdateExercise(exercise.name, "rounds", e.target.value)}
                      style={{
                        width: "60px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <label style={{ fontSize: "0.85rem", color: "#666" }}>Rows:</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.rows}
                      onChange={(e) => handleUpdateExercise(exercise.name, "rows", e.target.value)}
                      style={{
                        width: "60px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    />
                  </div>
                  <div className="ex-stats">
                    {exercise.rounds} x {exercise.rows}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveExercise(exercise.name)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="d-flex justify-content-center gap-3 mb-5">
        <Button variant="outline-secondary" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveWorkout}
          disabled={selectedExercises.length === 0}
          style={{ backgroundColor: "#88d4e7", borderColor: "#88d4e7" }}
        >
          Save Workout
        </Button>
      </div>
    </div>
  );
}

export default ExercisePage;
