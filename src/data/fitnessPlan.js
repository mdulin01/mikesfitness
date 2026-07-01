// Fitness targets — the exercise/body-comp half of the old healthPlan.js.
// Medical content (meds, labs, risks) lives in mikeshealth.app now.
export const fitnessPlan = {
  weightGoals: {
    current: 192,
    target: 185,
    bodyFatCurrent: 23,
    bodyFatTarget: 20,
    waistTarget: '< 38 inches',
  },

  exerciseTargets: {
    cardioMinutes: 150, // AHA weekly floor; zone2Minutes is the quality slice
    strengthDays: 3,
    zone2Minutes: 90,
    mobilityMinutes: 70, // 10 min × 7 days
    stepsPerDay: 10000,
  },

  sleepGoals: {
    hours: 7,
    notes: ['Magnesium helps', 'Limit alcohol'],
  },

  proteinTargetG: 120, // tracked in mikesnutrition; shown here as a training-day reminder

  northStar: [
    { label: 'Weight', value: '185 lbs' },
    { label: 'Body fat', value: '20%' },
    { label: 'Lift', value: '3×/week' },
    { label: 'VO2 max', value: 'Top 25% for age' },
    { label: 'At 69', value: 'No disability, full independence' },
  ],
};
