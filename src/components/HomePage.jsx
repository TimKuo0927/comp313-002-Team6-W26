import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { fetchExercisesByMuscle } from "../api/apiNinjas";

function HomePage() {
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);

  // API Ninjas Demo States
  const [selectedMuscle, setSelectedMuscle] = useState("biceps");
  const [apiExercises, setApiExercises] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  async function loadExercises(muscle) {
    setApiLoading(true);
    setApiError("");
    try {
      const data = await fetchExercisesByMuscle(muscle);
      setApiExercises(data);
    } catch (e) {
      setApiError(e?.message || "Failed to load exercises");
      setApiExercises([]);
    } finally {
      setApiLoading(false);
    }
  }

  // Load demo data
  useEffect(() => {
    const demoData = [
      {
        id: 1,
        createDate: "02/17/2026",
        NumOfWeek: 8,
        Year: 2026,
        ExerciseList: [
          { id: 1, type: "Incline Bench Press", muscle: "Chest", round: 3, row: 12 },
          { id: 2, type: "Cable Fly", muscle: "Chest", round: 3, row: 15 },
          { id: 3, type: "Tricep Pushdown", muscle: "Triceps", round: 3, row: 12 },
        ],
      },
      {
        id: 2,
        createDate: "02/18/2026",
        NumOfWeek: 8,
        Year: 2026,
        ExerciseList: [
          { id: 1, type: "Lat Pulldown", muscle: "Back", round: 4, row: 10 },
          { id: 2, type: "Seated Row", muscle: "Back", round: 3, row: 12 },
          { id: 3, type: "Barbell Curl", muscle: "Biceps", round: 3, row: 12 },
        ],
      },
      {
        id: 3,
        createDate: "02/19/2026",
        NumOfWeek: 8,
        Year: 2026,
        ExerciseList: [
          { id: 1, type: "Squats", muscle: "Legs", round: 4, row: 8 },
          { id: 2, type: "Leg Press", muscle: "Legs", round: 3, row: 12 },
          { id: 3, type: "Calf Raise", muscle: "Calves", round: 4, row: 15 },
        ],
      },
    ];

    setThisWeekWorkouts(
      demoData.filter((log) => log.NumOfWeek === 8 && log.Year === 2026)
    );
  }, []);

  const currentWeek = 8;

  // 🔥 Generate Weekly Summary
  function generateWeeklySummary() {
    // 👉 If already open → close it
    if (summary) {
      setSummary(null);
      return;
    }

    // 👉 Otherwise generate it
    const result = {};

    thisWeekWorkouts.forEach((workout) => {
      workout.ExerciseList.forEach((ex) => {
        const volume = ex.round * ex.row;

        if (!result[ex.muscle]) {
          result[ex.muscle] = {
            totalVolume: 0,
            exercises: 0,
          };
        }

        result[ex.muscle].totalVolume += volume;
        result[ex.muscle].exercises += 1;
      });
    });

    setSummary(result);
  }

  // 🔥 Total weekly volume
  const totalVolume = summary
    ? Object.values(summary).reduce((acc, m) => acc + m.totalVolume, 0)
    : 0;

  return (
    <div className="dashboard-wrapper">
      {/* Summary Header */}
      <div className="summary-section mb-5">
        <h2 className="fw-bold">Week {currentWeek} Overview</h2>

        <div className="d-flex justify-content-center gap-4 mt-3">
          <div className="stat-box">
            <span className="label">Sessions</span>
            <span className="value">{thisWeekWorkouts.length}</span>
          </div>
        </div>

        {/* 🔥 Button */}
        <Button
          variant="success"
          className="mt-3"
          onClick={generateWeeklySummary}
        >
          {summary ? "Hide Weekly Summary" : "Show Weekly Summary"}
        </Button>

        {/* 🔥 Summary Display */}
        {summary && (
          <div className="mt-4">
            <h4 className="fw-bold">Weekly Summary</h4>
            <p><b>Total Volume:</b> {totalVolume}</p>

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
        )}
      </div>

      {/* API Ninjas Demo */}
      <div className="mb-5 p-3" style={{ border: "1px solid #ddd", borderRadius: 8 }}>
        <h4 className="fw-bold">API Ninjas Exercise Lookup (Demo)</h4>

        <div className="d-flex align-items-center gap-2 mt-2">
          <label className="fw-semibold">Muscle:</label>

          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
          >
            <option value="biceps">biceps</option>
            <option value="chest">chest</option>
            <option value="triceps">triceps</option>
            <option value="back">back</option>
            <option value="quadriceps">quadriceps</option>
            <option value="hamstrings">hamstrings</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => loadExercises(selectedMuscle)}
            disabled={apiLoading}
          >
            {apiLoading ? "Loading..." : "Fetch Exercises"}
          </Button>
        </div>

        {apiError && <p className="mt-2 text-danger">{apiError}</p>}

        <div className="mt-3">
          {apiExercises.length === 0 && !apiLoading && !apiError && (
            <p className="text-muted">Click “Fetch Exercises” to load results.</p>
          )}

          <ul>
            {apiExercises.map((x) => (
              <li key={`${x.name}-${x.muscle}`}>
                <b>{x.name}</b> — {x.difficulty} ({x.type})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workout List */}
      <div className="g-4">
        {thisWeekWorkouts.map((log) => (
          <div key={log.id} className="row mb-4">
            <div className="workout-column-card col">
              <div className="card-header-custom">
                <span className="date-badge">{log.createDate}</span>
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

                      <Button variant="outline-secondary" size="sm">
                        Edit
                      </Button>
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