// Weekly Exercise Plan (Age 59-69)
export const exercisePlan = {
  formula: [
    "3 days strength",
    "3 days cardio", 
    "1 day long activity / fun",
    "Daily walking",
    "Daily mobility (10 min)",
  ],
  
  weeklySchedule: [
    { day: "Monday", exercise: "Strength + short cardio", type: "strength", emoji: "💪" },
    { day: "Tuesday", exercise: "Zone 2 cardio", type: "cardio", emoji: "🏃" },
    { day: "Wednesday", exercise: "Strength", type: "strength", emoji: "💪" },
    { day: "Thursday", exercise: "Zone 2 cardio", type: "cardio", emoji: "🏃" },
    { day: "Friday", exercise: "Strength + short cardio", type: "strength", emoji: "💪" },
    { day: "Saturday", exercise: "Long cardio / fun activity", type: "long", emoji: "🚴" },
    { day: "Sunday", exercise: "Walk + mobility", type: "recovery", emoji: "🧘" },
  ],

  totalHoursPerWeek: "6-8",

  workoutA: {
    name: "Workout A",
    exercises: [
      { name: "Squats", sets: 3, reps: "8", id: "squat" },
      { name: "Bench press", sets: 3, reps: "8", id: "bench" },
      { name: "Row", sets: 3, reps: "10", id: "row" },
      { name: "Plank", sets: 3, reps: "30 sec", id: "plank" },
      { name: "Lunges", sets: 3, reps: "10 each leg", id: "lunge" },
    ]
  },

  workoutB: {
    name: "Workout B",
    exercises: [
      { name: "Deadlift", sets: 3, reps: "8", id: "deadlift" },
      { name: "Overhead press", sets: 3, reps: "8", id: "ohp" },
      { name: "Lat pulldown", sets: 3, reps: "10", id: "latpull" },
      { name: "Step-ups", sets: 3, reps: "10 each", id: "stepup" },
      { name: "Side plank", sets: 3, reps: "30 sec each", id: "sideplank" },
    ]
  },

  cardioZone2: {
    description: "Most important type for longevity",
    howToKnow: "You can talk in sentences but can't sing",
    examples: ["Brisk walking", "Elliptical", "Cycling", "Swimming"],
    duration: "30-45 min",
  },

  vo2MaxIntervals: {
    warmup: "5 min",
    intervals: "4 rounds: 4 min hard / 3 min easy",
    cooldown: "5 min",
    frequency: "1x/week",
  },

  dailyTargets: {
    steps: 10000,
    walking: "After dinner if possible",
    mobility: "10 min/day",
    notes: ["Take stairs", "Park far away", "Walk during phone calls"],
  },
};

export const trainingEvents = [
  {
    id: 'half-marathon-2026',
    name: 'Half Marathon',
    emoji: '🏃',
    type: 'running',
    date: '2026-11-15',
    location: 'TBD',
    color: '#16a34a',
    description: 'Half marathon race',
  },
  {
    id: 'triathlon-sept-2026',
    name: 'Triathlon',
    emoji: '🏊',
    type: 'triathlon',
    date: '2026-09-15',
    location: 'TBD',
    color: '#2563eb',
    description: 'Sprint/Olympic triathlon',
  },
];
