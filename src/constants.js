export const ALLOWED_EMAILS = ['mdulin@gmail.com'];

export const COLLECTIONS = {
  HEALTH_DATA: 'mikesfitness',
  SHARED_FITNESS: 'tripData', // shared with mikeandadam
};

export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'training', label: 'Training', emoji: '🏋️' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'appointments', label: 'Appointments', emoji: '🏥' },
  { id: 'plan', label: '10-Year Plan', emoji: '🎯' },
];

export const APPOINTMENT_TYPES = [
  { id: 'primary', label: 'Primary Care', color: '#2563eb', emoji: '🩺' },
  { id: 'gi', label: 'GI / Gastroenterology', color: '#7c3aed', emoji: '🔬' },
  { id: 'cardiology', label: 'Cardiology', color: '#dc2626', emoji: '❤️' },
  { id: 'dentist', label: 'Dentist', color: '#0891b2', emoji: '🦷' },
  { id: 'dermatology', label: 'Dermatology', color: '#ea580c', emoji: '🧴' },
  { id: 'eye', label: 'Eye / Ophthalmology', color: '#4f46e5', emoji: '👁️' },
  { id: 'lab', label: 'Lab Work', color: '#059669', emoji: '🧪' },
  { id: 'other', label: 'Other', color: '#64748b', emoji: '📋' },
];

export const LAB_CATEGORIES = [
  { id: 'lipid', label: 'Lipid Panel', markers: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'ApoB'] },
  { id: 'hormones', label: 'Hormones', markers: ['Testosterone', 'Estradiol', 'Fasting Insulin'] },
  { id: 'inflammation', label: 'Inflammation', markers: ['CRP', 'Fecal Calprotectin'] },
  { id: 'vitamins', label: 'Vitamins', markers: ['Vitamin D'] },
  { id: 'metabolic', label: 'Metabolic', markers: ['Fasting Glucose', 'HbA1c'] },
  { id: 'other', label: 'Other', markers: ['Lp(a)', 'PSA'] },
];
