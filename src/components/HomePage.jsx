import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Workout, Exercise } from "../models/workout";
import { MUSCLE_LIST } from "../models/muscles";
import { fetchExercisesByMuscle } from "../api/apiNinjas";

function HomePage() {
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState([]);
  const [summary, setSummary] = useState({});

  //use to store the week list
  const [weekList, setWeekList] = useState([]);
  const [currentWeekNum, setCurrentWeekNum] = useState(0);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Must match the algorithm used in the Workout model
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const currentWeek = getWeekNumber(currentDate);

  // Reads all workouts from localStorage and returns only those matching the given year and week number
  const getThisWeekWorkouts = (year, weekNumber) => {
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.filter(
        (log) => log.NumOfWeek === weekNumber && log.Year === year,
      );
    } catch (err) {
      console.error("Failed to parse workout_logs from localStorage:", err);
      return [];
    }
  };

  // Import workout history from a JSON file into localStorage
  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          alert("Invalid file format: expected an array of workouts.");
          return;
        }

        // 1. GET EXISTING DATA first to allow "adding to data"
        const stored = localStorage.getItem("workout_logs");
        const existingData = stored ? JSON.parse(stored) : [];

        // 2. MERGE: Combine old and new data
        // Optional: If your workouts have unique IDs, you could filter out duplicates here
        const combinedData = [...existingData, ...importedData];

        // 3. SAVE combined set back to localStorage
        localStorage.setItem("workout_logs", JSON.stringify(combinedData));

        // 4. RECALCULATE the week list so navigation buttons (← →) work
        const allWeeks = [
          ...new Set(combinedData.map((w) => w.NumOfWeek)),
        ].sort((a, b) => a - b);
        setWeekList(allWeeks);

        if (allWeeks.length > 0) {
          // 5. JUMP to the latest week in the new combined dataset
          const latestWeek = allWeeks[allWeeks.length - 1];
          setCurrentWeekNum(latestWeek);

          // 6. RENDER the UI for that week
          const filtered = getThisWeekWorkouts(currentYear, latestWeek);
          setThisWeekWorkouts(filtered);
        }

        alert(`Imported ${importedData.length} workouts successfully!`);
      } catch (err) {
        console.error("Import Error:", err);
        alert("Failed to read the file. Make sure it's a valid JSON export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Export the workout history (local storage → JSON file)
  function handleExportJson() {
    const data = localStorage.getItem("workout_logs");

    if (!data) {
      alert("No workout data found to export.");
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "workout_logs.json";
    link.click();

    URL.revokeObjectURL(url);
  }
  const getWeekList = () => {
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      const weeks = [...new Set(parsed.map((w) => w.NumOfWeek))].sort(
        (a, b) => a - b,
      );
      setWeekList(weeks);
      if (weeks.length > 0) {
        // start at latest week
        setCurrentWeekNum(weeks[weeks.length - 1]);
      } else {
        setCurrentWeekNum(0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const goToPreviousWeek = () => {
    const index = weekList.indexOf(currentWeekNum);

    if (index > 0) {
      const targetWeek = weekList[index - 1];
      setCurrentWeekNum(targetWeek);

      const filtered = getThisWeekWorkouts(currentYear, targetWeek);
      setThisWeekWorkouts(filtered);
    }
  };

  const goToNextWeek = () => {
    const index = weekList.indexOf(currentWeekNum);

    if (index < weekList.length - 1) {
      const targetWeek = weekList[index + 1];
      setCurrentWeekNum(targetWeek);

      const filtered = getThisWeekWorkouts(currentYear, targetWeek);
      setThisWeekWorkouts(filtered);
    }
  };

  const currentIndex = weekList.indexOf(currentWeekNum);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < weekList.length - 1;

  // Seed sample data into localStorage if it is empty
  useEffect(() => {
    if (!localStorage.getItem("workout_logs")) {
      // const sampleExercises = [
      //   new Exercise(1, "Incline Bench Press", "chest", 3, 12),
      //   new Exercise(2, "Cable Fly", "chest", 3, 15),
      //   new Exercise(3, "Tricep Pushdown", "triceps", 3, 12),
      //   new Exercise(4, "Lat Pulldown", "back", 4, 10),
      //   new Exercise(5, "Seated Row", "back", 3, 12),
      //   new Exercise(6, "Barbell Curl", "biceps", 3, 12),
      //   new Exercise(7, "Hammer Curl", "biceps", 3, 12),
      //   new Exercise(8, "Squats", "legs", 4, 8),
      //   new Exercise(9, "Leg Press", "legs", 3, 12),
      //   new Exercise(10, "Calf Raise", "calves", 4, 15),
      //   new Exercise(11, "Shoulder Press", "shoulders", 3, 12),
      //   new Exercise(12, "Lateral Raise", "shoulders", 3, 15),
      // ];
      // const demoData = [];
      // for (let i = 0; i < 10; i++) {
      //   const workout = new Workout(sampleExercises.slice(i, i + 5));
      //   workout.createDate = new Date(Date.now() - i * 86400000).toLocaleDateString("en-US");
      //   workout.NumOfWeek = getWeekNumber(new Date(Date.now() - i * 86400000));
      //   workout.Year = new Date(Date.now() - i * 86400000).getFullYear();
      //   demoData.push(workout);
      // }
      // localStorage.setItem("workout_logs", JSON.stringify(demoData));
    }
  }, []);

  // Load workouts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("workout_logs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const weeks = [...new Set(parsed.map((w) => w.NumOfWeek))].sort(
          (a, b) => a - b,
        );

        // If we have data, use the latest week from the data instead of the calendar week
        const targetWeek =
          weeks.length > 0 ? weeks[weeks.length - 1] : currentWeek;

        const filtered = getThisWeekWorkouts(currentYear, targetWeek);
        setThisWeekWorkouts(filtered);
        setCurrentWeekNum(targetWeek);
        setWeekList(weeks);
      } catch (err) {
        console.error(err);
      }
    }
  }, []); // Run once on mount

  //load all the weekNum from localStorage
  useEffect(() => {
    getWeekList();
  }, []);

  // Compute summary automatically
  useEffect(() => {
    const result = {};
    thisWeekWorkouts.forEach((workout) => {
      workout.ExerciseList.forEach((ex) => {
        const volume = ex.round * ex.row;
        if (!result[ex.muscle]) {
          result[ex.muscle] = { totalVolume: 0, exercises: 0 };
        }
        result[ex.muscle].totalVolume += volume;
        result[ex.muscle].exercises += 1;
      });
    });
    setSummary(result);
  }, [thisWeekWorkouts]);

  const totalVolume = Object.values(summary).reduce(
    (acc, m) => acc + m.totalVolume,
    0,
  );

  const handleLogSampleWorkout = () => {
    const exercises = [
      new Exercise(1, "Incline Bench Press", "chest", 3, 12),
      new Exercise(2, "Barbell Curl", "biceps", 3, 12),
    ];
    const newWorkout = new Workout(exercises);

    const stored = localStorage.getItem("workout_logs");
    const allWorkouts = stored ? JSON.parse(stored) : [];
    allWorkouts.push(newWorkout);
    localStorage.setItem("workout_logs", JSON.stringify(allWorkouts));

    setThisWeekWorkouts(getThisWeekWorkouts(currentYear, currentWeek));
    console.log("Logged new workout:", newWorkout);
  };

  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null); // { workoutId, exerciseIndex }
  const [editFields, setEditFields] = useState({
    muscle: "",
    type: "",
    round: "",
    row: "",
  });
  const [editExerciseOptions, setEditExerciseOptions] = useState([]);
  const [editLoadingExercises, setEditLoadingExercises] = useState(false);

  const toggleEditMode = (workoutId) => {
    setEditingWorkoutId((prev) => (prev === workoutId ? null : workoutId));
    setEditingExercise(null);
    setEditExerciseOptions([]);
  };

  const startEditExercise = async (workoutId, exerciseIndex, ex) => {
    setEditingExercise({ workoutId, exerciseIndex });
    setEditFields({
      muscle: ex.muscle,
      type: ex.type,
      round: ex.round,
      row: ex.row,
    });
    setEditLoadingExercises(true);
    try {
      const options = await fetchExercisesByMuscle(ex.muscle);
      setEditExerciseOptions(options);
      const match = options.find((o) => o.name === ex.type);
      if (!match && options.length > 0) {
        setEditFields((f) => ({ ...f, type: options[0].name }));
      }
    } catch {
      setEditExerciseOptions([]);
    } finally {
      setEditLoadingExercises(false);
    }
  };

  const handleEditMuscleChange = async (muscle) => {
    setEditFields((f) => ({ ...f, muscle, type: "" }));
    setEditLoadingExercises(true);
    try {
      const options = await fetchExercisesByMuscle(muscle);
      setEditExerciseOptions(options);
      if (options.length > 0) {
        setEditFields((f) => ({ ...f, type: options[0].name }));
      }
    } catch {
      setEditExerciseOptions([]);
    } finally {
      setEditLoadingExercises(false);
    }
  };

  const cancelEditExercise = () => {
    setEditingExercise(null);
    setEditExerciseOptions([]);
  };

  const handleSaveExercise = (workoutId, exerciseIndex) => {
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return;

    const allWorkouts = JSON.parse(stored);
    const workoutIdx = allWorkouts.findIndex((w) => w.id === workoutId);
    if (workoutIdx === -1) return;

    const target = allWorkouts[workoutIdx].ExerciseList[exerciseIndex];
    target.muscle = editFields.muscle;
    target.type = editFields.type || target.type;
    target.round = Number(editFields.round);
    target.row = Number(editFields.row);

    localStorage.setItem("workout_logs", JSON.stringify(allWorkouts));
    setThisWeekWorkouts(getThisWeekWorkouts(currentYear, currentWeekNum));
    setEditingExercise(null);
    setEditExerciseOptions([]);
  };

  const handleDeleteExercise = (workoutId, exerciseIndex) => {
    if (!window.confirm("Delete this exercise?")) return;
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return;

    const allWorkouts = JSON.parse(stored);
    const workoutIdx = allWorkouts.findIndex((w) => w.id === workoutId);
    if (workoutIdx === -1) return;

    allWorkouts[workoutIdx].ExerciseList.splice(exerciseIndex, 1);

    if (allWorkouts[workoutIdx].ExerciseList.length === 0) {
      allWorkouts.splice(workoutIdx, 1);
      setEditingWorkoutId(null);
    }

    localStorage.setItem("workout_logs", JSON.stringify(allWorkouts));

    const updatedWeekWorkouts = getThisWeekWorkouts(
      currentYear,
      currentWeekNum,
    );
    setThisWeekWorkouts(updatedWeekWorkouts);
    getWeekList();
  };

  const handleResetAllData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all workout data?",
    );
    if (!confirmed) return;

    localStorage.removeItem("workout_logs");
    setThisWeekWorkouts([]);
    setSummary({});
    setWeekList([]);
    setCurrentWeekNum(0);
    setEditingWorkoutId(null);
    setEditingExercise(null);
    setEditExerciseOptions([]);
  };

  return (
    <div className="dashboard-wrapper">
      <h1>Exercise, yet?</h1>

      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Left Side: Actions */}
        <div className="d-flex gap-2">
          <Button onClick={handleLogSampleWorkout} variant="primary">
            Log Sample Workout
          </Button>
          <Button variant="danger" onClick={handleResetAllData}>
            Reset All Data
          </Button>
        </div>

        {/* Right Side: Data Management */}
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExportJson}>
            Export Workout
          </Button>
          <label className="btn btn-outline-success mb-0">
            Import Workout
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportJson}
            />
          </label>
        </div>
      </div>

      <div className="summary-section mb-5">
        <h2 className="fw-bold">Week {currentWeekNum} Overview</h2>

        <div className="d-flex justify-content-center gap-4 mt-3">
          <div className="stat-box">
            <span className="label">Sessions</span>
            <span className="value">{thisWeekWorkouts.length}</span>
          </div>
        </div>
      </div>

      {/* <div className="mb-5 p-3" style={{ border: "1px solid #ddd", borderRadius: 8 }}>
        <div className="mt-4">
          <h4 className="fw-bold">Weekly Summary</h4>
          {Object.keys(summary).length === 0 && <p className="text-muted">No workouts logged this week.</p>}
          {Object.entries(summary)
            .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
            .map(([muscle, data]) => (
              <div key={muscle} className="mb-2">
                <b>{muscle}</b>
                <div>Total Volume: {data.totalVolume}</div>
                <div>Exercises Done: {data.exercises}</div>
              </div>
            ))}
        </div>

      </div> */}

      {/* Workout List */}
      <div className="g-4">
        {thisWeekWorkouts.map((log) => (
          <div key={log.id} className="row mb-4">
            <div className="workout-column-card col">
              <div className="card-header-custom d-flex justify-content-between align-items-center">
                <span className="date-badge">
                  {new Date(log.createDate).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant={
                    editingWorkoutId === log.id
                      ? "secondary"
                      : "outline-primary"
                  }
                  onClick={() => toggleEditMode(log.id)}
                >
                  {editingWorkoutId === log.id ? "Done" : "Edit Day"}
                </Button>
              </div>

              <div className="exercise-list">
                {log.ExerciseList.map((ex, index) => {
                  const isEditingThis =
                    editingExercise &&
                    editingExercise.workoutId === log.id &&
                    editingExercise.exerciseIndex === index;

                  return (
                    <div
                      key={index}
                      className="exercise-item"
                      style={{
                        flexDirection: isEditingThis ? "column" : "row",
                        alignItems: isEditingThis ? "stretch" : "center",
                      }}
                    >
                      {isEditingThis ? (
                        <div className="d-flex flex-column gap-2 w-100">
                          <div className="d-flex gap-2">
                            <select
                              className="form-select form-select-sm"
                              value={editFields.muscle}
                              onChange={(e) =>
                                handleEditMuscleChange(e.target.value)
                              }
                            >
                              {MUSCLE_LIST.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            {editLoadingExercises ? (
                              <select
                                className="form-select form-select-sm"
                                disabled
                              >
                                <option>Loading...</option>
                              </select>
                            ) : editExerciseOptions.length > 0 ? (
                              <select
                                className="form-select form-select-sm"
                                value={editFields.type}
                                onChange={(e) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    type: e.target.value,
                                  }))
                                }
                              >
                                {editExerciseOptions.map((opt) => (
                                  <option key={opt.name} value={opt.name}>
                                    {opt.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="form-control form-control-sm"
                                value={editFields.type}
                                onChange={(e) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    type: e.target.value,
                                  }))
                                }
                                placeholder="Exercise name"
                              />
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={editFields.round}
                              onChange={(e) =>
                                setEditFields((f) => ({
                                  ...f,
                                  round: e.target.value,
                                }))
                              }
                              style={{ width: "65px" }}
                              className="form-control form-control-sm"
                              placeholder="Sets"
                            />
                            <span>x</span>
                            <input
                              type="number"
                              min="1"
                              value={editFields.row}
                              onChange={(e) =>
                                setEditFields((f) => ({
                                  ...f,
                                  row: e.target.value,
                                }))
                              }
                              style={{ width: "65px" }}
                              className="form-control form-control-sm"
                              placeholder="Reps"
                            />
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleSaveExercise(log.id, index)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={cancelEditExercise}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="ex-info">
                            <div className="ex-name">{ex.type}</div>
                            <div className="ex-muscle">{ex.muscle}</div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div className="ex-stats">
                              {ex.round} x {ex.row}
                            </div>
                            {editingWorkoutId === log.id && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() =>
                                    startEditExercise(log.id, index, ex)
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    handleDeleteExercise(log.id, index)
                                  }
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button to load other week data */}
      <div className="">
        {hasPrevious && (
          <Button
            onClick={goToPreviousWeek}
            className="position-fixed top-50 start-0 translate-middle-y ms-5"
          >
            ←
          </Button>
        )}
        {hasNext && (
          <Button
            onClick={goToNextWeek}
            className="position-fixed top-50 end-0 translate-middle-y me-5"
          >
            →
          </Button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
