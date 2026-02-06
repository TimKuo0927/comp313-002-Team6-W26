export class Workout {
  constructor(exerciseList = []) {
    const now = new Date();
    
    this.id = Date.now();
    // Human-readable format: MM/DD/YYYY
    this.createDate = now.toLocaleDateString('en-US'); 
    this.NumOfWeek = this.getWeekNumber(now);
    this.Year = now.getFullYear();
    this.ExerciseList = exerciseList; // Array of Exercise objects
  }

  // Helper to calculate week of the year for your 7-day logic
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export class Exercise {
  constructor(type, muscle, round, row) {
    this.type = type;
    this.muscle = muscle;
    this.round = Number(round);
    this.row = Number(row);
    this.CreateDate = new Date().toLocaleDateString('en-US');
  }
}