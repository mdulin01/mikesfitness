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

  medications: [
    { name: "Rosuvastatin 5 mg", why: "LDL reduction, plaque prevention", category: "cardiovascular" },
    { name: "Ezetimibe 10 mg", why: "Additional LDL lowering", category: "cardiovascular" },
    { name: "GLP-1 (semaglutide or tirzepatide)", why: "Weight, CV risk, inflammation", category: "metabolic" },
    { name: "Enclomiphene", why: "Maintain testosterone, muscle mass", category: "hormonal" },
    { name: "Vitamin D", why: "Bone, immune", category: "supplement" },
    { name: "Fish oil (EPA/DHA)", why: "Triglycerides, anti-inflammatory", category: "supplement" },
    { name: "Creatine 5 g/day", why: "Muscle, brain", category: "supplement" },
    { name: "Magnesium", why: "Sleep, muscle, bone", category: "supplement" },
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
  }
};
