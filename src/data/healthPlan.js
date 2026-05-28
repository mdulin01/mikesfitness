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
      time: 'morning', label: '6:30 AM — Fasting', emoji: '☀️',
      notes: 'Water only. Wait 30 min before breakfast.',
      items: [
        { name: 'Metformin 500 mg', notes: 'Metabolic/longevity', rx: true },
        { name: 'Enclomiphene', notes: 'Hormone', rx: true },
        { name: 'Aspirin 81 mg', notes: 'CRC chemoprevention', rx: false },
      ],
    },
    {
      time: 'breakfast', label: '7:00 AM — Breakfast', emoji: '🍳',
      notes: 'Take with breakfast including dietary fat.',
      items: [
        { name: 'Vitamin D', notes: 'Fat-soluble, needs lipid for absorption' },
        { name: 'Visbiome (1 sachet)', notes: 'Probiotic, gut health' },
      ],
    },
    {
      time: 'mid-morning', label: '9:30 AM — Mid-Morning', emoji: '🕤',
      notes: 'Separate from ALL medications by ≥2 hours.',
      items: [
        { name: 'Fiber supplement', notes: 'Fiber binds drugs — must separate' },
      ],
    },
    {
      time: 'lunch', label: '12:30 PM — Lunch', emoji: '🍽️',
      notes: 'All lipophilic agents taken with dietary fat.',
      items: [
        { name: 'Metformin 500 mg', notes: 'Metabolic/longevity', rx: true },
        { name: 'Apigenin 50 mg', notes: 'Longevity' },
        { name: 'Pterostilbene 50 mg', notes: 'Longevity' },
        { name: 'Fish oil 1–2 g EPA+DHA', notes: 'Heart/triglycerides' },
        { name: 'CoQ10 (ubiquinol) 200 mg', notes: 'Statin support' },
      ],
    },
    {
      time: 'dinner', label: '6:30 PM — Dinner', emoji: '🌆',
      notes: 'Second doses of fish oil and CoQ10.',
      items: [
        { name: 'Metformin 500 mg', notes: 'Metabolic/longevity', rx: true },
        { name: 'Vitamin B complex', notes: 'Homocysteine; metformin depletes B12' },
        { name: 'Fish oil 1–2 g EPA+DHA', notes: 'Heart/triglycerides' },
        { name: 'CoQ10 (ubiquinol) 200 mg', notes: 'Statin support' },
      ],
    },
    {
      time: 'bedtime', label: '9:00 PM — Bedtime', emoji: '🌙',
      notes: 'Light snack or empty stomach.',
      items: [
        { name: 'Rosuvastatin 5 mg', notes: 'Cholesterol; max 5 mg with rapamycin', rx: true },
        { name: 'Ezetimibe 10 mg', notes: 'Cholesterol', rx: true },
        { name: 'Tadalafil 5 mg', notes: 'Vascular; ≥12 hr from rapamycin', rx: true },
      ],
    },
    {
      time: 'weekly', label: 'Weekly', emoji: '📅',
      notes: 'Separate from daily schedule.',
      items: [
        { name: 'Rapamycin 5 mg', notes: 'Sunday AM fasting, water only', rx: true },
        { name: 'Tirzepatide SC injection', notes: 'Any day, rotate injection sites', rx: true },
      ],
    },
  ],

  // Flat arrays kept for backward compat (Medical page, health score, etc.)
  medications: [
    { name: "Metformin 500 mg (3x/day)", why: "Metabolic health, longevity", category: "metabolic", timing: "morning/lunch/dinner", withFood: true, awayFromFiber: true },
    { name: "Rosuvastatin 5 mg", why: "LDL reduction, plaque prevention", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
    { name: "Ezetimibe 10 mg", why: "Additional LDL lowering", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
    { name: "Enclomiphene", why: "Maintain testosterone, muscle mass", category: "hormonal", timing: "morning", withFood: false, awayFromFiber: true },
    { name: "Tadalafil 5 mg", why: "Vascular health", category: "cardiovascular", timing: "bedtime", withFood: false, awayFromFiber: false },
    { name: "Aspirin 81 mg", why: "CRC chemoprevention", category: "gi", timing: "morning", withFood: false, awayFromFiber: true },
    { name: "Rapamycin 5 mg (weekly)", why: "Longevity, mTOR inhibition", category: "longevity", timing: "Sunday AM fasting", withFood: false, awayFromFiber: false },
    { name: "Tirzepatide SC (weekly)", why: "Metabolic/weight management", category: "metabolic", timing: "weekly", withFood: false, awayFromFiber: false },
  ],

  supplements: [
    { name: "Vitamin D", why: "Bone, immune", timing: "breakfast", withFood: true, awayFromFiber: true },
    { name: "Visbiome", why: "Probiotic, gut health, Crohn's support", timing: "breakfast", withFood: true, awayFromFiber: false },
    { name: "Fiber supplement", why: "Cholesterol, gut health", timing: "mid-morning", withFood: false, awayFromFiber: false },
    { name: "Apigenin 50 mg", why: "Longevity", timing: "lunch", withFood: true, awayFromFiber: true },
    { name: "Pterostilbene 50 mg", why: "Longevity", timing: "lunch", withFood: true, awayFromFiber: true },
    { name: "Fish oil 1–2 g EPA+DHA (2x/day)", why: "Heart, triglycerides", timing: "lunch + dinner", withFood: true, awayFromFiber: true },
    { name: "CoQ10 (ubiquinol) 200 mg (2x/day)", why: "Statin support", timing: "lunch + dinner", withFood: true, awayFromFiber: true },
    { name: "Vitamin B complex", why: "Homocysteine; metformin depletes B12", timing: "dinner", withFood: true, awayFromFiber: true },
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
