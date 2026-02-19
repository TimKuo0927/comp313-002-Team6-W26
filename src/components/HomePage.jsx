import { useState, useEffect } from 'react'
import { Workout, Exercise } from '../models/workout';



// THIS IS JUST A DEMO TO SHOW HOW TO USE THE CLASSES AND LOCAL STORAGE.
// UPDATE THIS PAGE
function HomePage() {
  const [history, setHistory] = useState([]);

  // Load data from LocalStorage on component mount
  useEffect(() => {
    const data = localStorage.getItem('workout_logs');
    if (data) setHistory(JSON.parse(data));
  }, []);

  const handleLogWorkout = () => {
    // 1. Create a specific exercise using the Class
    const benchPress = new Exercise("Incline Bench Press", "chest", 3, 12);
    
    // 2. Wrap it in a Workout session
    const newSession = new Workout([benchPress]);

    // 3. Update Local Storage and State
    const updatedHistory = [...history, newSession];
    localStorage.setItem('workout_logs', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    
    console.log("Saved successfully:", newSession);
  };

  const clearLogs = () => {
    localStorage.removeItem('workout_logs');
    setHistory([]);
  };

  return (
    <div className="App">
      <h1>Exercise, yet?</h1>
      
      <div className="card">
        <button onClick={handleLogWorkout}>
          Log Sample Workout
        </button>
        <button onClick={clearLogs} style={{ marginLeft: '10px', backgroundColor: 'red' }}>
          Clear All Logs
        </button>
      </div>

      <h2>Workout History</h2>
      {history.length === 0 ? (
        <p>No workouts logged yet. Get to the gym!</p>
      ) : (
        <ul style={{ textAlign: 'left' }}>
          {history.map(log => (
            <li key={log.id}>
              <strong>{log.createDate} (Week {log.NumOfWeek}):</strong>
              <ul>
                {log.ExerciseList.map((ex, index) => (
                  <li key={index}>{ex.type} - {ex.round} sets of {ex.row}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HomePage;