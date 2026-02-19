import { useState, useEffect } from "react";
import { Workout, Exercise } from "../models/workout";
import { Button } from "react-bootstrap";

function HomePage() {
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState([]);

  // Load data from LocalStorage on component mount
  // useEffect(() => {
  //   const data = localStorage.getItem('workout_logs');
  //   if (data) setHistory(JSON.parse(data));
  // }, []);

  //TODO:　load the data from localStorage, filter by current week and year, and set to thisWeekWorkouts
  useEffect(() => {
    const demoData = [
      {
        id: 1,
        createDate: "02/17/2026",
        NumOfWeek: 8,
        Year: 2026,
        ExerciseList: [
          {
            id: 1,
            type: "Incline Bench Press",
            muscle: "Chest",
            round: 3,
            row: 12,
          },
          { id: 2, type: "Cable Fly", muscle: "Chest", round: 3, row: 15 },
          {
            id: 3,
            type: "Tricep Pushdown",
            muscle: "Triceps",
            round: 3,
            row: 12,
          },
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
      demoData.filter((log) => log.NumOfWeek === 8 && log.Year === 2026),
    );
  }, []);

  const currentWeek = 8;

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
      </div>

      {/* Grid for Workout Columns */}
      <div className="g-4">
        {thisWeekWorkouts.map((log) => (
          <div key={log.id} className="row mb-4">
            <div className="workout-column-card col">
              <div className="card-header-custom">
                <span className="date-badge">{log.createDate}</span>
              </div>

              <div className="exercise-list">
                {log.ExerciseList.map((ex, index) => (
                  <div key={ex.id} className="exercise-item">
                    <div className="ex-info">
                      <div className="ex-name">{ex.type}</div>
                      <div className="ex-muscle">{ex.muscle}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="ex-stats">
                        {ex.round} x {ex.row}
                      </div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="edit-btn"
                      >
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
