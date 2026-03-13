import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Workout, Exercise } from "../models/workout";

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
        (log) => log.NumOfWeek === weekNumber && log.Year === year
      );
    } catch (err) {
      console.error("Failed to parse workout_logs from localStorage:", err);
      return [];
    }
  };

  const getWeekList = () => {
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      const weeks = [...new Set(parsed.map(w => w.NumOfWeek))].sort((a,b)=>a-b);
      setWeekList(weeks);
      if(weeks.length>0){
        // start at latest week
        setCurrentWeekNum(weeks[weeks.length - 1]);
      }else{
        setCurrentWeekNum(0);
      }
   

    } catch(err){
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
      const sampleExercises = [
        new Exercise(1, "Incline Bench Press", "chest", 3, 12),
        new Exercise(2, "Cable Fly", "chest", 3, 15),
        new Exercise(3, "Tricep Pushdown", "triceps", 3, 12),
        new Exercise(4, "Lat Pulldown", "back", 4, 10),
        new Exercise(5, "Seated Row", "back", 3, 12),
        new Exercise(6, "Barbell Curl", "biceps", 3, 12),
        new Exercise(7, "Hammer Curl", "biceps", 3, 12),
        new Exercise(8, "Squats", "legs", 4, 8),
        new Exercise(9, "Leg Press", "legs", 3, 12),
        new Exercise(10, "Calf Raise", "calves", 4, 15),
        new Exercise(11, "Shoulder Press", "shoulders", 3, 12),
        new Exercise(12, "Lateral Raise", "shoulders", 3, 15),
      ];

      const demoData = [];
      for (let i = 0; i < 10; i++) {
        const workout = new Workout(sampleExercises.slice(i, i + 5));
        workout.createDate = new Date(Date.now() - i * 86400000).toLocaleDateString("en-US");
        workout.NumOfWeek = getWeekNumber(new Date(Date.now() - i * 86400000));
        workout.Year = new Date(Date.now() - i * 86400000).getFullYear();
        demoData.push(workout);
      }

      localStorage.setItem("workout_logs", JSON.stringify(demoData));
    }
  }, []);

  // Load workouts from localStorage on mount
  useEffect(() => {
    const filtered = getThisWeekWorkouts(currentYear, currentWeek);
    setThisWeekWorkouts(filtered);
  }, [currentWeek, currentYear]);

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
    0
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

  const clearLogs = () => {
    localStorage.removeItem("workout_logs");
    setThisWeekWorkouts([]);
    setWeekList([]);
    setCurrentWeekNum(0);
  };

  // Connor Postma: Delete a specific workout by ID from localStorage and state
  const handleDeleteWorkout = (workoutId) => {
    const stored = localStorage.getItem("workout_logs");
    if (!stored) return;
    try {
      const allWorkouts = JSON.parse(stored);
      const updated = allWorkouts.filter((w) => w.id !== workoutId);
      localStorage.setItem("workout_logs", JSON.stringify(updated));

      // Refresh the displayed workouts for the current week
      const filtered = updated.filter(
        (w) => w.NumOfWeek === currentWeekNum && w.Year === currentYear
      );
      setThisWeekWorkouts(filtered);

      // Refresh the week list (a week with no entries should disappear)
      const weeks = [...new Set(updated.map((w) => w.NumOfWeek))].sort((a, b) => a - b);
      setWeekList(weeks);
      if (!weeks.includes(currentWeekNum)) {
        setCurrentWeekNum(weeks.length > 0 ? weeks[weeks.length - 1] : 0);
      }
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h1>Exercise, yet?</h1>

      <div className="summary-section mb-5">
        <h2 className="fw-bold">Week {currentWeekNum} Overview</h2>

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
              <div className="card-header-custom d-flex justify-content-between align-items-center">
                <span className="date-badge">{new Date(log.createDate).toLocaleDateString()}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteWorkout(log.id)}
                  title="Delete this workout"
                >
                  Delete
                </Button>
              </div>

              <div className="exercise-list">
                {log.ExerciseList.map((ex,index) => (
                  <div key={index} className="exercise-item">
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