// Mike's 10-Year Health Plan (Age 59-69)
export const healthPlan = {
  title: "Mike's 10-Year Health Plan (Age 59-69)",
  pillars: ["cardio", "muscle", "brain", "inflammation", "cancer prevention"],

  risks: [
    { risk: "Coronary artery disease", why: "#1 cause of death" },
    { risk: "Stroke", why: "#2 cause of disability" },
    { risk: "Cancer", why: "#2 cause of death" },
    { risk: "Sarcopenia (muscle loss)", why: "Loss of independence" },
    { risk: "Cognitive decline", why: "Quality of life" },
    { risk: "Osteoporosis", why: "Fracture risk" },
    { risk: "Crohn's progression", why: "Bowel damage" },
    { risk: "Depression / isolation", why: "Under-recognized risk" },
  ],

  // Daily med/supplement schedule grouped by time of day
  medSchedule: [
    {
      time: 'morning', label: 'Morning (empty stomach)', emoji: '☀️',
      items: [
        { name: 'Enclomiphene', notes: 'Hormone', rx: true },
        { name: 'Probiotic', notes: 'Gut' },
        { name: 'Methyl B-complex', notes: 'Homocysteine' },
        { name: 'Collagen', notes: 'Joints' },
        { name: 'Creatine', notes: 'Muscle/brain' },
        { name: 'Benefiber', notes: 'Cholesterol/gut' },
        { name: 'Coffee', notes: 'Happiness', optional: true },
      ],
    },
    {
      time: 'lunch', label: 'Lunch (with food)', emoji: '🍽️',
      items: [
        { name: 'Multivitamin', notes: 'General' },
        { name: 'Vitamin D', notes: 'Bone' },
        { name: 'Fish oil', notes: 'Heart' },
        { name: 'CoQ10', notes: 'Statin support' },
        { name: 'Seed Supplement', notes: 'Vegetables' },
      ],
    },
    {
      time: 'dinner', label: 'Dinner', emoji: '🌆',
      items: [
        { name: 'Fish oil (dinner)', notes: 'Heart' },
        { name: 'Psyllium', notes: 'Fiber goal' },
      ],
    },
    {
      time: 'bedtime', label: 'Bedtime', emoji: '🌙',
      items: [
        { name: 'Magnesium glycinate', notes: 'Sleep/heart' },
        { name: 'Crestor', notes: 'Cholesterol', rx: true },
        { name: 'Ezetimibe', notes: 'Cholesterol', rx: true },
        { name: 'Cialis', notes: 'Vascular', rx: true },
      ],
    },
  ],

  // Flat arrays kept for backward compat (Medical page, health score, etc.)
  medications: [
    { name: "Crestor", why: "LDL reduction, plaque prevention", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
    { name: "Ezetimibe", why: "Additional LDL lowering", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
    { name: "Enclomiphene", why: "Maintain testosterone, muscle mass", category: "hormonal", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Cialis", why: "Vascular health", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
  ],

  supplements: [
    { name: "Probiotic", why: "Gut health, Crohn's support", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Methyl B-complex", why: "Homocysteine reduction", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Collagen", why: "Joint support", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Creatine", why: "Muscle, brain", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Benefiber", why: "Cholesterol, gut health", timing: "morning", withFood: false, awayFromFiber: false },
    { name: "Multivitamin", why: "General nutrition", timing: "lunch", withFood: true, awayFromFiber: false },
    { name: "Vitamin D", why: "Bone, immune", timing: "lunch", withFood: true, awayFromFiber: false },
    { name: "Fish oil", why: "Heart, triglycerides", timing: "lunch", withFood: true, awayFromFiber: false },
    { name: "CoQ10", why: "Statin support", timing: "lunch", withFood: true, awayFromFiber: false },
    { name: "Seed Supplement", why: "Vegetable nutrients", timing: "lunch", withFood: true, awayFromFiber: false },
    { name: "Fish oil (dinner)", why: "Heart, second dose", timing: "dinner", withFood: true, awayFromFiber: false },
    { name: "Psyllium", why: "Fiber goal", timing: "dinner", withFood: true, awayFromFiber: false },
    { name: "Magnesium glycinate", why: "Sleep, heart", timing: "bedtime", withFood: false, awayFromFiber: false },
  ],

  labSchedule: {
    every6Months: [
      "Lipid panel", "ApoB", "Testosterone", "Estradiol",
      "CRP (inflammation marker)", "Vitamin D", "Fasting insulin"
    ],
    once: ["Lp(a)"],
    crohns: ["Fecal calprotectin"],
    every3Years: ["Colonoscopy"],
    every5Years: ["DEXA scan (bone density)", "Coronary calcium scan"],
    yearly: ["Dermatology skin exam", "Eye exam"],
  },

  weightGoals: {
    current: 192,
    target: 185,
    bodyFatCurrent: 23,
    bodyFatTarget: 20,
    waistTarget: "< 38 inches",
  },

  nutritionTargets: {
    protein: 120,
    fiber: 30,
    plants: 5,
    water: 80,
    alcohol: 1,
    sugar: 'low',
  },

  exerciseTargets: {
    cardioMinutes: 150,
    strengthDays: 3,
    zone2Minutes: 90,
  },

  dailyRules: [
    'Eat Mediterranean', '120g protein', '30g fiber',
    'Exercise daily', 'Sleep 7+ hrs', 'Minimal alcohol',
    'Take all meds', 'Hydrate 80+ oz',
  ],

  topRisks: [
    { risk: 'Heart disease', why: 'High ApoB, Lp(a), homocysteine' },
    { risk: 'Kidney disease', why: 'eGFR 56, creatinine 1.45' },
    { risk: 'Muscle loss', why: 'Age-related sarcopenia' },
    { risk: "Crohn's complications", why: 'Ongoing management' },
  ],

  topTargets: [
    { label: 'Weight', value: '185 lbs' },
    { label: 'ApoB', value: '< 70 mg/dL' },
    { label: 'Homocysteine', value: '< 10 umol/L' },
    { label: 'Lift', value: '3x/week' },
    { label: 'VO2 max', value: 'Top 25%' },
  ],

  sleepGoals: {
    hours: 7,
    notes: ["Screen for sleep apnea", "Magnesium helps", "Limit alcohol (increases Alzheimer's risk)"],
  },

  outcomes: {
    atAge69: [
      "No disability",
      "Independence",
      "Keep LDL low",
      "Maintain strength",
      "Stay socially engaged",
    ]
  },

  // Mediterranean diet reference
  mediterraneanDiet: {
    description: "Anti-inflammatory, heart-healthy eating pattern proven to reduce cardiovascular disease, cancer risk, and cognitive decline.",
    dailyFocus: [
      { category: "Vegetables", target: "5+ servings", examples: "Leafy greens, tomatoes, peppers, broccoli, zucchini", emoji: "🥬" },
      { category: "Fruits", target: "2-3 servings", examples: "Berries, citrus, apples, grapes", emoji: "🫐" },
      { category: "Whole grains", target: "3-4 servings", examples: "Quinoa, brown rice, oats, whole wheat", emoji: "🌾" },
      { category: "Healthy fats", target: "Daily", examples: "Extra virgin olive oil, avocado, nuts", emoji: "🫒" },
      { category: "Lean protein", target: "2-3 servings", examples: "Fish, chicken, legumes, eggs", emoji: "🐟" },
      { category: "Nuts & seeds", target: "Handful daily", examples: "Almonds, walnuts, chia, flax", emoji: "🥜" },
    ],
    weeklyFocus: [
      { category: "Fish/seafood", target: "2-3x per week", emoji: "🐟" },
      { category: "Legumes", target: "3-4x per week", emoji: "🫘" },
      { category: "Poultry", target: "2-3x per week", emoji: "🍗" },
    ],
    limit: [
      { item: "Red meat", guideline: "1-2x per month" },
      { item: "Added sugar/sweets", guideline: "Rarely" },
      { item: "Processed foods", guideline: "Avoid" },
      { item: "Alcohol", guideline: "Limit or avoid (Alzheimer's risk)" },
    ],
    crohnsNotes: "Extra focus on anti-inflammatory foods. Avoid trigger foods. Cooked vegetables may be easier to digest than raw. Bone broth and fermented foods can support gut healing.",
  },
};
