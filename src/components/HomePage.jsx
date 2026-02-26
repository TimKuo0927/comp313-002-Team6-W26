import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Workout, Exercise } from "../models/workout";

function HomePage() {
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState([]);
  const [summary, setSummary] = useState({});

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // ISO week calculation
  const getWeekNumber = (date) => {
    const temp = new Date(date);
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
  };

  const currentWeek = getWeekNumber(currentDate);

  // Load workouts from localStorage (or seed demo data)
  useEffect(() => {
    let stored = localStorage.getItem("workout_logs");

    if (!stored) {
      // Seed demo data
      const demoData = [];

      const exercises = [
        new Exercise("Incline Bench Press", "chest", 3, 12),
        new Exercise("Cable Fly", "chest", 3, 15),
        new Exercise("Tricep Pushdown", "triceps", 3, 12),
        new Exercise("Lat Pulldown", "back", 4, 10),
        new Exercise("Seated Row", "back", 3, 12),
        new Exercise("Barbell Curl", "biceps", 3, 12),
        new Exercise("Hammer Curl", "biceps", 3, 12),
        new Exercise("Squats", "legs", 4, 8),
        new Exercise("Leg Press", "legs", 3, 12),
        new Exercise("Calf Raise", "calves", 4, 15),
        new Exercise("Shoulder Press", "shoulders", 3, 12),
        new Exercise("Lateral Raise", "shoulders", 3, 15),
      ];

      // Create multiple demo sessions
      for (let i = 0; i < 5; i++) {
        const sessionExercises = exercises.slice(i, i + 5);
        const workout = new Workout(sessionExercises);
        // Adjust createDate to past days
        workout.createDate = new Date(Date.now() - i * 86400000).toISOString();
        workout.NumOfWeek = getWeekNumber(new Date(workout.createDate));
        workout.Year = new Date(workout.createDate).getFullYear();
        demoData.push(workout);
      }

      localStorage.setItem("workout_logs", JSON.stringify(demoData));
      stored = JSON.stringify(demoData);
      console.log("✅ Demo data seeded");
    }

    // Load + filter by current week/year
    try {
      const parsed = JSON.parse(stored);
      const filtered = parsed.filter(
        (log) => log.NumOfWeek === currentWeek && log.Year === currentYear
      );
      setThisWeekWorkouts(filtered);
    } catch (err) {
      console.error("Failed to parse localStorage:", err);
      setThisWeekWorkouts([]);
    }
  }, [currentWeek, currentYear]);

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
    0
  );

  const handleLogSampleWorkout = () => {
    const exercises = [
      new Exercise("Incline Bench Press", "chest", 3, 12),
      new Exercise("Barbell Curl", "biceps", 3, 12),
    ];
    const newWorkout = new Workout(exercises);
    newWorkout.NumOfWeek = getWeekNumber(new Date());
    newWorkout.Year = new Date().getFullYear();

    const updatedHistory = [...thisWeekWorkouts, newWorkout];
    localStorage.setItem("workout_logs", JSON.stringify(updatedHistory));
    setThisWeekWorkouts(updatedHistory);
    console.log("Logged new workout:", newWorkout);
  };

  const clearLogs = () => {
    localStorage.removeItem("workout_logs");
    setThisWeekWorkouts([]);
  };

  return (
    <div className="dashboard-wrapper">
      <h1>Exercise, yet?</h1>

      <div className="summary-section mb-5">
        <h2 className="fw-bold">Week {currentWeek} Overview</h2>

        <div className="d-flex justify-content-center gap-4 mt-3">
          <div className="stat-box">
            <span className="label">Sessions</span>
            <span className="value">{thisWeekWorkouts.length}</span>
          </div>

          <div className="stat-box">
            <span className="label">Total Volume</span>
            <span className="value">{totalVolume}</span>
          </div>
        </div>

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

        <div className="mt-4">
          <Button onClick={handleLogSampleWorkout}>Log Sample Workout</Button>
          <Button onClick={clearLogs} style={{ marginLeft: "10px", backgroundColor: "red" }}>
            Clear All Logs
          </Button>
        </div>
      </div>

      {/* Workout List */}
      <div className="g-4">
        {thisWeekWorkouts.map((log) => (
          <div key={log.id} className="row mb-4">
            <div className="workout-column-card col">
              <div className="card-header-custom">
                <span className="date-badge">{new Date(log.createDate).toLocaleDateString()}</span>
              </div>

              <div className="exercise-list">
                {log.ExerciseList.map((ex) => (
                  <div key={ex.id} className="exercise-item">
                    <div className="ex-info">
                      <div className="ex-name">{ex.type}</div>
                      <div className="ex-muscle">{ex.muscle}</div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="ex-stats">
                        {ex.round} x {ex.row}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;