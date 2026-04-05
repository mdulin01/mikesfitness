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

  // Prescription medications only
  medications: [
    { name: "Rosuvastatin 5 mg", why: "LDL reduction, plaque prevention", category: "cardiovascular" },
    { name: "Ezetimibe 10 mg", why: "Additional LDL lowering", category: "cardiovascular" },
    { name: "GLP-1 (semaglutide or tirzepatide)", why: "Weight, CV risk, inflammation", category: "metabolic" },
    { name: "Enclomiphene", why: "Maintain testosterone, muscle mass", category: "hormonal" },
  ],

  // Supplements (separate from meds)
  supplements: [
    { name: "Vitamin D", why: "Bone, immune" },
    { name: "Fish oil (EPA/DHA)", why: "Triglycerides, anti-inflammatory" },
    { name: "Creatine 5 g/day", why: "Muscle, brain" },
    { name: "Magnesium", why: "Sleep, muscle, bone" },
    { name: "Probiotic", why: "Gut health, Crohn's support" },
    { name: "Novo", why: "GLP-1 support" },
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
    current: 190,
    target: 185,
    waistTarget: "< 38 inches",
  },

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
