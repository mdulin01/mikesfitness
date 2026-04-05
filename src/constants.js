export const ALLOWED_EMAILS = ['mdulin@gmail.com'];

export const COLLECTIONS = {
  HEALTH_DATA: 'mikesfitness',
  SHARED_FITNESS: 'tripData', // shared with mikeandadam
};

export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { id: 'training', label: 'Training', emoji: '🏋️' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'events', label: 'Events', emoji: '📅' },
  { id: 'plan', label: 'Plan', emoji: '🎯' },
];

// Medical appointment types
export const MEDICAL_EVENT_TYPES = [
  { id: 'primary', label: 'Primary Care', color: '#2563eb', emoji: '🩺', category: 'medical' },
  { id: 'gi', label: 'GI / Gastroenterology', color: '#7c3aed', emoji: '🔬', category: 'medical' },
  { id: 'cardiology', label: 'Cardiology', color: '#dc2626', emoji: '❤️', category: 'medical' },
  { id: 'dentist', label: 'Dentist', color: '#0891b2', emoji: '🦷', category: 'medical' },
  { id: 'dermatology', label: 'Dermatology', color: '#ea580c', emoji: '🧴', category: 'medical' },
  { id: 'eye', label: 'Eye / Ophthalmology', color: '#4f46e5', emoji: '👁️', category: 'medical' },
  { id: 'lab', label: 'Lab Work', color: '#059669', emoji: '🧪', category: 'medical' },
  { id: 'other-medical', label: 'Other Medical', color: '#64748b', emoji: '📋', category: 'medical' },
];

// Fitness event types
export const FITNESS_EVENT_TYPES = [
  { id: 'half-marathon', label: 'Half Marathon', color: '#16a34a', emoji: '🏃', category: 'fitness' },
  { id: 'triathlon', label: 'Triathlon', color: '#2563eb', emoji: '🏊', category: 'fitness' },
  { id: 'race', label: 'Race / Run', color: '#059669', emoji: '🏅', category: 'fitness' },
  { id: 'swim-event', label: 'Swim Event', color: '#0ea5e9', emoji: '🏊‍♂️', category: 'fitness' },
  { id: 'other-fitness', label: 'Other Fitness', color: '#84cc16', emoji: '💪', category: 'fitness' },
];

// Social event types
export const SOCIAL_EVENT_TYPES = [
  { id: 'dinner', label: 'Dinner / Social', color: '#f59e0b', emoji: '🍽️', category: 'social' },
  { id: 'travel', label: 'Travel', color: '#8b5cf6', emoji: '✈️', category: 'social' },
  { id: 'family', label: 'Family', color: '#ec4899', emoji: '👨‍👩‍👦', category: 'social' },
  { id: 'friends', label: 'Friends', color: '#f97316', emoji: '👥', category: 'social' },
  { id: 'other-social', label: 'Other Social', color: '#64748b', emoji: '🎉', category: 'social' },
];

// Combined for lookups
export const ALL_EVENT_TYPES = [...MEDICAL_EVENT_TYPES, ...FITNESS_EVENT_TYPES, ...SOCIAL_EVENT_TYPES];

// Keep old name as alias for backward compatibility in existing code
export const APPOINTMENT_TYPES = MEDICAL_EVENT_TYPES;

export const LAB_CATEGORIES = [
  { id: 'lipid', label: 'Lipid Panel', markers: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'ApoB'] },
  { id: 'hormones', label: 'Hormones', markers: ['Testosterone', 'Estradiol', 'Fasting Insulin'] },
  { id: 'inflammation', label: 'Inflammation', markers: ['CRP', 'Fecal Calprotectin'] },
  { id: 'vitamins', label: 'Vitamins', markers: ['Vitamin D'] },
  { id: 'metabolic', label: 'Metabolic', markers: ['Fasting Glucose', 'HbA1c'] },
  { id: 'other', label: 'Other', markers: ['Lp(a)', 'PSA'] },
];

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'snack', label: 'Snack', emoji: '🍎' },
];

// Common meal presets based on Mike's eating patterns
export const MEAL_PRESETS = [
  // Lunch options (Mike usually has these for lunch)
  { id: 'oatmeal-fruit', label: 'Oatmeal & Fruit', type: 'lunch', emoji: '🥣', description: 'Oatmeal with mixed berries', tags: ['whole-grain', 'fiber', 'fruit'] },
  { id: 'yogurt-fruit', label: 'Yogurt & Fruit', type: 'lunch', emoji: '🫐', description: 'Greek yogurt with fresh fruit', tags: ['protein', 'probiotics', 'fruit'] },
  { id: 'salad-chicken', label: 'Chicken Salad', type: 'lunch', emoji: '🥗', description: 'Mixed greens with grilled chicken', tags: ['protein', 'vegetables'] },
  // Dinner options
  { id: 'salad-dinner', label: 'Dinner Salad', type: 'dinner', emoji: '🥗', description: 'Large salad with olive oil dressing', tags: ['vegetables', 'healthy-fats'] },
  { id: 'grilled-fish', label: 'Grilled Fish & Veggies', type: 'dinner', emoji: '🐟', description: 'Grilled salmon or white fish with roasted vegetables', tags: ['protein', 'omega-3', 'vegetables'] },
  { id: 'chicken-veggies', label: 'Chicken & Vegetables', type: 'dinner', emoji: '🍗', description: 'Grilled chicken with steamed or roasted vegetables', tags: ['protein', 'vegetables'] },
  { id: 'ate-out', label: 'Ate Out', type: 'dinner', emoji: '🍽️', description: 'Restaurant meal', tags: ['eating-out'] },
  // Snacks
  { id: 'nuts', label: 'Mixed Nuts', type: 'snack', emoji: '🥜', description: 'Handful of almonds, walnuts, or mixed nuts', tags: ['healthy-fats', 'protein'] },
  { id: 'fruit-snack', label: 'Fresh Fruit', type: 'snack', emoji: '🍎', description: 'Apple, banana, or berries', tags: ['fruit', 'fiber'] },
  { id: 'hummus-veggies', label: 'Hummus & Veggies', type: 'snack', emoji: '🥕', description: 'Hummus with carrots, celery, or peppers', tags: ['fiber', 'protein'] },
];

// Mediterranean diet recipe suggestions
export const RECIPE_SUGGESTIONS = [
  {
    id: 'med-salmon', name: 'Mediterranean Baked Salmon', time: '25 min', emoji: '🐟',
    ingredients: ['Salmon fillet', 'Cherry tomatoes', 'Olives', 'Capers', 'Olive oil', 'Lemon', 'Garlic'],
    steps: 'Season salmon, top with tomatoes, olives, capers. Drizzle olive oil & lemon. Bake 400°F for 20 min.',
    tags: ['omega-3', 'protein', 'anti-inflammatory'],
  },
  {
    id: 'greek-chicken', name: 'Greek Chicken Bowl', time: '30 min', emoji: '🍗',
    ingredients: ['Chicken breast', 'Quinoa', 'Cucumber', 'Tomato', 'Red onion', 'Feta', 'Olive oil', 'Lemon'],
    steps: 'Grill seasoned chicken. Serve over quinoa with chopped veggies, feta, and lemon-olive oil dressing.',
    tags: ['protein', 'whole-grain', 'vegetables'],
  },
  {
    id: 'lentil-soup', name: 'Mediterranean Lentil Soup', time: '35 min', emoji: '🍲',
    ingredients: ['Red lentils', 'Onion', 'Carrots', 'Celery', 'Garlic', 'Cumin', 'Vegetable broth', 'Spinach'],
    steps: 'Sauté onion, carrots, celery, garlic. Add lentils, broth, cumin. Simmer 25 min. Stir in spinach.',
    tags: ['fiber', 'protein', 'anti-inflammatory'],
  },
  {
    id: 'tuna-salad', name: 'Mediterranean Tuna Salad', time: '10 min', emoji: '🥗',
    ingredients: ['Canned tuna', 'Mixed greens', 'Chickpeas', 'Cucumber', 'Red onion', 'Olive oil', 'Red wine vinegar'],
    steps: 'Toss greens with chickpeas, cucumber, onion. Top with tuna. Dress with olive oil and vinegar.',
    tags: ['omega-3', 'protein', 'quick'],
  },
  {
    id: 'shrimp-pasta', name: 'Garlic Shrimp & Whole Wheat Pasta', time: '20 min', emoji: '🍝',
    ingredients: ['Shrimp', 'Whole wheat pasta', 'Garlic', 'Cherry tomatoes', 'Spinach', 'Olive oil', 'Red pepper flakes'],
    steps: 'Cook pasta. Sauté garlic and shrimp in olive oil. Add tomatoes and spinach. Toss with pasta.',
    tags: ['protein', 'whole-grain', 'quick'],
  },
  {
    id: 'veggie-stir-fry', name: 'Veggie & Chickpea Stir Fry', time: '20 min', emoji: '🥘',
    ingredients: ['Chickpeas', 'Bell peppers', 'Broccoli', 'Zucchini', 'Garlic', 'Soy sauce', 'Olive oil', 'Brown rice'],
    steps: 'Stir fry veggies and chickpeas in olive oil with garlic. Season with soy sauce. Serve over brown rice.',
    tags: ['fiber', 'protein', 'vegetables'],
  },
];
