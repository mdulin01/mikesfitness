// Weekly Exercise Plan (Age 59-69)
export const exercisePlan = {
  formula: [
    "3 days strength",
    "3 days cardio (including swimming)",
    "1 day long activity / fun",
    "Daily walking",
    "Daily mobility (10 min)",
  ],

  weeklySchedule: [
    { day: "Monday", exercise: "Strength + short cardio", type: "strength", emoji: "💪" },
    { day: "Tuesday", exercise: "Zone 2 cardio (swim or run)", type: "cardio", emoji: "🏃" },
    { day: "Wednesday", exercise: "Strength", type: "strength", emoji: "💪" },
    { day: "Thursday", exercise: "Swimming or Zone 2 cardio", type: "cardio", emoji: "🏊" },
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

  swimming: {
    description: "Excellent Zone 2 cardio with zero joint impact",
    benefits: ["Full-body workout", "Joint-friendly", "Builds endurance", "Great cross-training for triathlon"],
    workouts: [
      { name: "Endurance Swim", description: "Continuous laps at conversational pace", duration: "30-45 min", level: "zone2" },
      { name: "Interval Swim", description: "100m fast / 50m easy × 8-10", duration: "30 min", level: "intervals" },
      { name: "Distance Swim", description: "Build up to 1500m+ continuous", duration: "45-60 min", level: "long" },
    ],
    weeklyGoal: "2-3 sessions, 1500-2500 meters per session",
    notes: "Count laps or use a swim tracker. Focus on form — long strokes, bilateral breathing.",
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
    name: 'Indy Half Marathon',
    emoji: '🏃',
    type: 'running',
    date: '2026-05-02',
    location: 'Indianapolis, IN',
    color: '#16a34a',
    description: 'Half marathon in Indianapolis',
  },
  {
    id: 'triathlon-sept-2026',
    name: 'Wrightsville Beach Triathlon',
    emoji: '🏊',
    type: 'triathlon',
    date: '2026-09-27',
    location: 'Wrightsville Beach, NC',
    color: '#2563eb',
    description: 'Triathlon at Wrightsville Beach',
  },
];

// Motivational quotes for the dashboard
export const motivationalQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese proverb" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The only bad workout is the one that didn't happen.", source: "" },
  { text: "You don't have to be extreme, just consistent.", source: "" },
  { text: "Health is not about the weight you lose, but about the life you gain.", source: "" },
  { text: "Every workout is progress. Every healthy meal is a vote for the person you want to become.", source: "" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", source: "" },
  { text: "Motivation gets you started. Habit keeps you going.", source: "" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", source: "" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
];
