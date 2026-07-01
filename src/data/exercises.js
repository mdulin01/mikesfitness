// Exercise library — gym-based, joint-aware selections for a 59-year-old
// building strength for longevity. `repRange` drives double progression;
// `increment` is the load jump when the top of the range is reached on all sets.
export const EXERCISES = [
  // ---- Squat / knee dominant ----
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'legs', lowerBody: true, equipment: 'dumbbell', repRange: [8, 12], increment: 10, cue: 'Chest tall, sit between the hips, full foot pressure.' },
  { id: 'leg-press', name: 'Leg Press', category: 'legs', lowerBody: true, equipment: 'machine', repRange: [10, 15], increment: 20, cue: 'Knees track over toes; don\'t lock out hard.' },
  { id: 'squat', name: 'Barbell Back Squat', category: 'legs', lowerBody: true, equipment: 'barbell', repRange: [6, 10], increment: 10, cue: 'Brace, break at hips and knees together.' },
  { id: 'split-squat', name: 'DB Split Squat', category: 'legs', lowerBody: true, equipment: 'dumbbell', repRange: [8, 12], increment: 5, cue: 'Per leg. Rear-foot flat; drop the back knee straight down.' },
  { id: 'stepup', name: 'DB Step-Up', category: 'legs', lowerBody: true, equipment: 'dumbbell', repRange: [8, 12], increment: 5, cue: 'Per leg. Drive through the top foot, control the descent — great for bone density.' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'legs', lowerBody: true, equipment: 'machine', repRange: [10, 15], increment: 10, cue: 'Squeeze at the top; protects the knees when kept smooth.' },
  // ---- Hinge / posterior chain ----
  { id: 'rdl', name: 'Romanian Deadlift (DB or Bar)', category: 'hinge', lowerBody: true, equipment: 'dumbbell', repRange: [8, 12], increment: 10, cue: 'Soft knees, push hips back, flat back, feel the hamstrings.' },
  { id: 'trapbar-deadlift', name: 'Trap-Bar Deadlift', category: 'hinge', lowerBody: true, equipment: 'barbell', repRange: [6, 10], increment: 10, cue: 'Easier on the low back than straight bar. Stand up tall, don\'t yank.' },
  { id: 'hip-thrust', name: 'Hip Thrust / Glute Bridge', category: 'hinge', lowerBody: true, equipment: 'barbell', repRange: [10, 15], increment: 10, cue: 'Chin tucked, full hip extension, 1-sec squeeze.' },
  { id: 'back-extension', name: 'Back Extension', category: 'hinge', lowerBody: true, equipment: 'machine', repRange: [10, 15], increment: 5, cue: 'Smooth reps; add a plate to chest when easy.' },
  { id: 'calf-raise', name: 'Standing Calf Raise', category: 'legs', lowerBody: true, equipment: 'machine', repRange: [10, 15], increment: 10, cue: 'Full stretch at the bottom, pause at the top. Ankle strength = fall prevention.' },
  // ---- Push ----
  { id: 'bench', name: 'Bench Press (Bar or DB)', category: 'push', equipment: 'barbell', repRange: [8, 12], increment: 5, cue: 'Shoulder blades pinned, feet planted, bar to mid-chest.' },
  { id: 'incline-db-press', name: 'Incline DB Press', category: 'push', equipment: 'dumbbell', repRange: [8, 12], increment: 5, cue: 'Shoulder-friendly pressing angle; elbows ~45°.' },
  { id: 'ohp', name: 'Overhead Press (DB)', category: 'push', equipment: 'dumbbell', repRange: [8, 12], increment: 5, cue: 'Ribs down, press slightly back to stack over shoulders.' },
  { id: 'machine-chest-press', name: 'Machine Chest Press', category: 'push', equipment: 'machine', repRange: [10, 15], increment: 10, cue: 'Good fatigue option after free weights.' },
  { id: 'pushup', name: 'Push-Up', category: 'push', equipment: 'bodyweight', repRange: [10, 20], increment: 0, cue: 'Body in one line; elevate hands to scale easier.' },
  // ---- Pull ----
  { id: 'latpull', name: 'Lat Pulldown', category: 'pull', equipment: 'machine', repRange: [8, 12], increment: 10, cue: 'Pull elbows to ribs, chest up, no swinging.' },
  { id: 'row', name: 'Seated Cable Row', category: 'pull', equipment: 'machine', repRange: [8, 12], increment: 10, cue: 'Squeeze shoulder blades; posture muscle #1.' },
  { id: 'db-row', name: 'One-Arm DB Row', category: 'pull', equipment: 'dumbbell', repRange: [8, 12], increment: 5, cue: 'Per arm. Flat back, pull to hip pocket.' },
  { id: 'assisted-pullup', name: 'Pull-Up (Assisted OK)', category: 'pull', equipment: 'machine', repRange: [6, 10], increment: 5, cue: 'Reduce assistance over time — a pull-up at 60 is a superpower.' },
  { id: 'face-pull', name: 'Face Pull', category: 'pull', equipment: 'cable', repRange: [12, 15], increment: 5, cue: 'Rope to eyebrows, elbows high — shoulder health staple.' },
  { id: 'curl', name: 'DB Curl', category: 'pull', equipment: 'dumbbell', repRange: [10, 15], increment: 5, cue: 'Control the lowering half.' },
  { id: 'triceps-pressdown', name: 'Triceps Pressdown', category: 'push', equipment: 'cable', repRange: [10, 15], increment: 5, cue: 'Elbows glued to sides.' },
  // ---- Core / carry ----
  { id: 'plank', name: 'Plank', category: 'core', equipment: 'bodyweight', repRange: [30, 60], unit: 'sec', increment: 0, cue: 'Glutes tight, ribs down — quality seconds over long saggy ones.' },
  { id: 'side-plank', name: 'Side Plank', category: 'core', equipment: 'bodyweight', repRange: [20, 45], unit: 'sec', increment: 0, cue: 'Per side. Hips stacked and lifted.' },
  { id: 'deadbug', name: 'Dead Bug', category: 'core', equipment: 'bodyweight', repRange: [8, 12], increment: 0, cue: 'Per side. Low back stays glued to the floor.' },
  { id: 'farmer-carry', name: 'Farmer Carry', category: 'core', equipment: 'dumbbell', repRange: [40, 60], unit: 'steps', increment: 10, cue: 'Heavy DBs, tall posture, brisk walk. Grip + core + real life.' },
  { id: 'pallof-press', name: 'Pallof Press', category: 'core', equipment: 'cable', repRange: [10, 12], increment: 5, cue: 'Per side. Resist the rotation.' },
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise', category: 'core', equipment: 'bodyweight', repRange: [8, 12], increment: 0, cue: 'Slow and controlled, no swing; doubles as grip work.' },
];

export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

export const EXERCISE_CATEGORIES = [
  { id: 'legs', label: 'Legs (squat/knee)', emoji: '🦵' },
  { id: 'hinge', label: 'Hinge (hips/back)', emoji: '🍑' },
  { id: 'push', label: 'Push', emoji: '🙌' },
  { id: 'pull', label: 'Pull', emoji: '🪢' },
  { id: 'core', label: 'Core & Carries', emoji: '🧱' },
];

// Daily 10-minute mobility routine (also the Sunday session, done longer).
export const MOBILITY_ROUTINE = [
  { id: 'catcow', name: 'Cat-Cow', dose: '10 slow reps' },
  { id: '9090', name: '90/90 Hip Switch', dose: '8 per side' },
  { id: 'couch', name: 'Couch Stretch (hip flexor)', dose: '45 sec per side' },
  { id: 'hamstring', name: 'Hamstring Floss', dose: '10 per side' },
  { id: 'tspine', name: 'Thoracic Rotation (open book)', dose: '8 per side' },
  { id: 'shoulder-cars', name: 'Shoulder CARs / Pass-Through', dose: '8 slow circles' },
  { id: 'ankle', name: 'Ankle Rocks (knee over toe)', dose: '10 per side' },
];
