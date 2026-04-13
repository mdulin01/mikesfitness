// Structured lab results extracted from Labcorp and NIH patient portals
// Each entry: { date, source, values: { testName: { value, unit, flag, ref, note? } } }

export const labHistory = [
  {
    date: '2023-05-11',
    source: 'Labcorp',
    values: {
      // NMR LipoProfile
      'LDL-P': { value: 1808, unit: 'nmol/L', flag: 'high', ref: '<1000' },
      'LDL-C': { value: 172, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 59, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 92, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 247, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'HDL-P': { value: 34.2, unit: 'umol/L', flag: null, ref: '>=30.5' },
      'Small LDL-P': { value: 123, unit: 'nmol/L', flag: null, ref: '<=527' },
      'LDL Size': { value: 22.3, unit: 'nm', flag: null, ref: '>20.5' },
      'Large VLDL-P': { value: 2.4, unit: 'nmol/L', flag: null, ref: '<=2.7' },
      'Large HDL-P': { value: 7.0, unit: 'umol/L', flag: null, ref: '>=4.8' },
      'VLDL Size': { value: 65.6, unit: 'nm', flag: 'high', ref: '<=46.6' },
      'HDL Size': { value: 9.3, unit: 'nm', flag: null, ref: '>=9.2' },
      'LP-IR Score': { value: 60, unit: '', flag: 'high', ref: '<=45' },
      'ApoB': { value: 111, unit: 'mg/dL', flag: 'high', ref: '<90' },
      'Lp(a)': { value: 164.6, unit: 'nmol/L', flag: 'high', ref: '<75' },
      'CRP': { value: 0.39, unit: 'mg/L', flag: null, ref: '0-3.0' },
      // TSH / Thyroid
      'TSH': { value: 1.270, unit: 'uIU/mL', flag: null, ref: '0.45-4.5' },
      'Free T4': { value: 1.22, unit: 'ng/dL', flag: null, ref: '0.82-1.77' },
      // CBC
      'WBC': { value: 4.6, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.39, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 15.9, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 47.4, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 88, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.7, unit: '%', flag: null, ref: '11.6-15.4' },
      // CMP
      'Glucose': { value: 85, unit: 'mg/dL', flag: null, ref: '70-99' },
      'BUN': { value: 16, unit: 'mg/dL', flag: null, ref: '6-24' },
      'Creatinine': { value: 1.07, unit: 'mg/dL', flag: null, ref: '0.76-1.27' },
      'eGFR': { value: 81, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Sodium': { value: 138, unit: 'mmol/L', flag: null, ref: '134-144' },
      'Potassium': { value: 4.3, unit: 'mmol/L', flag: null, ref: '3.5-5.2' },
      'Chloride': { value: 102, unit: 'mmol/L', flag: null, ref: '96-106' },
      'CO2': { value: 21, unit: 'mmol/L', flag: null, ref: '20-29' },
      'Calcium': { value: 9.7, unit: 'mg/dL', flag: null, ref: '8.7-10.2' },
      'Protein': { value: 6.3, unit: 'g/dL', flag: null, ref: '6.0-8.5' },
      'Albumin': { value: 4.5, unit: 'g/dL', flag: null, ref: '3.8-4.9' },
      'Globulin': { value: 1.8, unit: 'g/dL', flag: null, ref: '1.5-4.5' },
      'Bilirubin': { value: 0.8, unit: 'mg/dL', flag: null, ref: '0-1.2' },
      'ALP': { value: 58, unit: 'IU/L', flag: null, ref: '44-121' },
      'AST': { value: 16, unit: 'IU/L', flag: null, ref: '0-40' },
      'ALT': { value: 12, unit: 'IU/L', flag: null, ref: '0-44' },
      // Other
      'HbA1c': { value: 5.1, unit: '%', flag: null, ref: '4.8-5.6' },
      'Testosterone': { value: 619, unit: 'ng/dL', flag: null, ref: '264-916' },
      'Vitamin D': { value: 30.6, unit: 'ng/mL', flag: null, ref: '30-100' },
    },
  },
  {
    date: '2023-09-14',
    source: 'NIH Clinical Center',
    provider: 'Ko, Seong',
    values: {
      // CBC
      'WBC': { value: 5.09, unit: 'K/mcL', flag: null, ref: '4.23-9.07' },
      'RBC': { value: 5.57, unit: 'M/mcL', flag: null, ref: '4.63-6.08' },
      'Hemoglobin': { value: 16.8, unit: 'g/dL', flag: null, ref: '13.7-17.5' },
      'Hematocrit': { value: 49.5, unit: '%', flag: null, ref: '40.1-51.0' },
      'MCV': { value: 88.9, unit: 'fL', flag: null, ref: '79.0-92.2' },
      'MCH': { value: 30.2, unit: 'pg', flag: null, ref: '25.7-32.2' },
      'MCHC': { value: 33.9, unit: 'g/dL', flag: null, ref: '32.3-36.5' },
      'RDW': { value: 13.3, unit: '%', flag: null, ref: '11.6-14.4' },
      'Platelets': { value: 152, unit: 'K/mcL', flag: 'low', ref: '161-347', note: 'Near-normal at NIH vs consistently low at Labcorp — pseudothrombocytopenia likely' },
      'MPV': { value: 10.8, unit: 'fL', flag: null, ref: '9.4-12.4' },
      'Neutrophils': { value: 55.2, unit: '%', flag: null, ref: '34.0-67.9' },
      'Lymphocytes': { value: 32.2, unit: '%', flag: null, ref: '21.8-53.1' },
      'Monocytes': { value: 10, unit: '%', flag: null, ref: '5.3-12.2' },
      'Eosinophils': { value: 2, unit: '%', flag: null, ref: '0.8-7.0' },
      'Basophils': { value: 0.6, unit: '%', flag: null, ref: '0.2-1.2' },
      'Neutrophil Abs': { value: 2.81, unit: 'K/mcL', flag: null, ref: '1.78-5.38' },
      'Lymphocyte Abs': { value: 1.64, unit: 'K/mcL', flag: null, ref: '1.32-3.57' },
      'Monocyte Abs': { value: 0.51, unit: 'K/mcL', flag: null, ref: '0.30-0.82' },
      'Eosinophil Abs': { value: 0.1, unit: 'K/mcL', flag: null, ref: '0.04-0.54' },
      'Basophil Abs': { value: 0.03, unit: 'K/mcL', flag: null, ref: '0.01-0.08' },
      // Urinalysis
      'Urine Specific Gravity': { value: 1.008, unit: '', flag: null, ref: '1.002-1.035' },
      'Urine pH': { value: 7, unit: '', flag: null, ref: '5.0-8.0' },
    },
  },
  {
    date: '2023-12-06',
    source: 'Labcorp',
    values: {
      // NMR LipoProfile
      'LDL-P': { value: 1464, unit: 'nmol/L', flag: 'high', ref: '<1000' },
      'LDL-C': { value: 133, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 59, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 73, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 205, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'HDL-P': { value: 34.7, unit: 'umol/L', flag: null, ref: '>=30.5' },
      'Small LDL-P': { value: 411, unit: 'nmol/L', flag: null, ref: '<=527' },
      'LDL Size': { value: 21.6, unit: 'nm', flag: null, ref: '>20.5' },
      'Large VLDL-P': { value: 1.6, unit: 'nmol/L', flag: null, ref: '<=2.7' },
      'Large HDL-P': { value: 6.6, unit: 'umol/L', flag: null, ref: '>=4.8' },
      'VLDL Size': { value: 43.1, unit: 'nm', flag: null, ref: '<=46.6' },
      'HDL Size': { value: 9.3, unit: 'nm', flag: null, ref: '>=9.2' },
      'LP-IR Score': { value: 29, unit: '', flag: null, ref: '<=45' },
      'ApoB': { value: 108, unit: 'mg/dL', flag: 'high', ref: '<90' },
      'Lp(a)': { value: 153.7, unit: 'nmol/L', flag: 'high', ref: '<75' },
      // CBC
      'WBC': { value: 4.8, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.57, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 16.4, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 50.1, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 90, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.1, unit: '%', flag: null, ref: '11.6-15.4' },
      // CMP
      'Glucose': { value: 85, unit: 'mg/dL', flag: null, ref: '70-99' },
      'BUN': { value: 15, unit: 'mg/dL', flag: null, ref: '6-24' },
      'Creatinine': { value: 1.16, unit: 'mg/dL', flag: null, ref: '0.76-1.27' },
      'eGFR': { value: 74, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Sodium': { value: 142, unit: 'mmol/L', flag: null, ref: '134-144' },
      'Potassium': { value: 4.3, unit: 'mmol/L', flag: null, ref: '3.5-5.2' },
      'Chloride': { value: 104, unit: 'mmol/L', flag: null, ref: '96-106' },
      'CO2': { value: 23, unit: 'mmol/L', flag: null, ref: '20-29' },
      'Calcium': { value: 9.7, unit: 'mg/dL', flag: null, ref: '8.7-10.2' },
      'Protein': { value: 6.6, unit: 'g/dL', flag: null, ref: '6.0-8.5' },
      'Albumin': { value: 4.6, unit: 'g/dL', flag: null, ref: '3.8-4.9' },
      'Globulin': { value: 2.0, unit: 'g/dL', flag: null, ref: '1.5-4.5' },
      'Bilirubin': { value: 0.7, unit: 'mg/dL', flag: null, ref: '0-1.2' },
      'ALP': { value: 73, unit: 'IU/L', flag: null, ref: '44-121' },
      'AST': { value: 16, unit: 'IU/L', flag: null, ref: '0-40' },
      'ALT': { value: 14, unit: 'IU/L', flag: null, ref: '0-44' },
      // Other
      'Vitamin D': { value: 53.9, unit: 'ng/mL', flag: null, ref: '30-100' },
    },
  },
  {
    date: '2023-12-29',
    source: 'Labcorp',
    values: {
      // CBC
      'WBC': { value: 6.2, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.54, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 17.0, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 50.0, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 90, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.5, unit: '%', flag: null, ref: '11.6-15.4' },
      'Platelets': { value: null, unit: 'x10E3/uL', flag: 'abnormal', ref: '150-450', note: 'Platelet aggregates identified, unable to quantitate' },
      // Urinalysis
      'Urine Specific Gravity': { value: 1.005, unit: '', flag: null, ref: '1.005-1.030' },
      'Urine pH': { value: 7.0, unit: '', flag: null, ref: '5.0-7.5' },
      'Alb/Creat Ratio': { value: '<19', unit: 'mg/g creat', flag: null, ref: '0-29' },
    },
  },
  {
    date: '2024-10-07',
    source: 'Labcorp',
    values: {
      // Lipid Panel
      'LDL-C': { value: 203, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 58, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 73, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 273, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'VLDL': { value: 12, unit: 'mg/dL', flag: null, ref: '5-40' },
      // TSH / Thyroid
      'TSH': { value: 1.620, unit: 'uIU/mL', flag: null, ref: '0.45-4.5' },
      'Free T4': { value: 1.26, unit: 'ng/dL', flag: null, ref: '0.82-1.77' },
      // CBC
      'WBC': { value: 7.5, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.75, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 16.8, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 51.2, unit: '%', flag: 'high', ref: '37.5-51.0' },
      'MCV': { value: 89, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.3, unit: '%', flag: null, ref: '11.6-15.4' },
      'Platelets': { value: 100, unit: 'x10E3/uL', flag: 'critical', ref: '150-450' },
      // CMP
      'Glucose': { value: 66, unit: 'mg/dL', flag: 'low', ref: '65-99' },
      'BUN': { value: 19, unit: 'mg/dL', flag: null, ref: '6-24' },
      'Creatinine': { value: 1.20, unit: 'mg/dL', flag: null, ref: '0.76-1.27' },
      'eGFR': { value: 71, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Sodium': { value: 140, unit: 'mmol/L', flag: null, ref: '134-144' },
      'Potassium': { value: 4.7, unit: 'mmol/L', flag: null, ref: '3.5-5.2' },
      'Chloride': { value: 103, unit: 'mmol/L', flag: null, ref: '96-106' },
      'CO2': { value: 20, unit: 'mmol/L', flag: null, ref: '20-29' },
      'Calcium': { value: 9.7, unit: 'mg/dL', flag: null, ref: '8.7-10.2' },
      'Protein': { value: 7.0, unit: 'g/dL', flag: null, ref: '6.0-8.5' },
      'Albumin': { value: 4.6, unit: 'g/dL', flag: null, ref: '3.8-4.9' },
      'Globulin': { value: 2.4, unit: 'g/dL', flag: null, ref: '1.5-4.5' },
      'Bilirubin': { value: 0.9, unit: 'mg/dL', flag: null, ref: '0-1.2' },
      'ALP': { value: 70, unit: 'IU/L', flag: null, ref: '48-121' },
      'AST': { value: 19, unit: 'IU/L', flag: null, ref: '0-40' },
      'ALT': { value: 13, unit: 'IU/L', flag: null, ref: '0-44' },
      // Other
      'HbA1c': { value: 5.1, unit: '%', flag: null, ref: '4.8-5.6' },
      'Vitamin D': { value: 44.7, unit: 'ng/mL', flag: null, ref: '30-100' },
      'PSA': { value: 0.7, unit: 'ng/mL', flag: null, ref: '0-4.0' },
    },
  },
  {
    date: '2024-11-01',
    source: 'Labcorp',
    values: {
      // Lipid Panel
      'LDL-C': { value: 139, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 68, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 53, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 216, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'VLDL': { value: 9, unit: 'mg/dL', flag: null, ref: '5-40' },
      // CBC
      'WBC': { value: 5.2, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.74, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 17.0, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 51.9, unit: '%', flag: 'high', ref: '37.5-51.0' },
      'MCV': { value: 90, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.4, unit: '%', flag: null, ref: '11.6-15.4' },
      'Platelets': { value: 112, unit: 'x10E3/uL', flag: 'low', ref: '150-450' },
    },
  },
  {
    date: '2024-12-06',
    source: 'Labcorp',
    values: {
      // CBC only
      'WBC': { value: 5.4, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.66, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 16.9, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 50.9, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 90, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.4, unit: '%', flag: null, ref: '11.6-15.4' },
      'Platelets': { value: 108, unit: 'x10E3/uL', flag: 'low', ref: '150-450' },
    },
  },
  {
    date: '2025-02-26',
    source: 'Labcorp',
    values: {
      // CBC
      'WBC': { value: 4.8, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.43, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 16.3, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 49.7, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 92, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.3, unit: '%', flag: null, ref: '11.6-15.4' },
      // CMP
      'Glucose': { value: 83, unit: 'mg/dL', flag: null, ref: '70-99' },
      'BUN': { value: 21, unit: 'mg/dL', flag: null, ref: '6-24' },
      'Creatinine': { value: 1.35, unit: 'mg/dL', flag: 'high', ref: '0.76-1.27' },
      'eGFR': { value: 61, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Sodium': { value: 143, unit: 'mmol/L', flag: null, ref: '134-144' },
      'Potassium': { value: 4.9, unit: 'mmol/L', flag: null, ref: '3.5-5.2' },
      'Chloride': { value: 104, unit: 'mmol/L', flag: null, ref: '96-106' },
      'CO2': { value: 21, unit: 'mmol/L', flag: null, ref: '20-29' },
      'Calcium': { value: 9.9, unit: 'mg/dL', flag: null, ref: '8.7-10.2' },
      'Protein': { value: 6.7, unit: 'g/dL', flag: null, ref: '6.0-8.5' },
      'Albumin': { value: 4.5, unit: 'g/dL', flag: null, ref: '3.8-4.9' },
      'Globulin': { value: 2.2, unit: 'g/dL', flag: null, ref: '1.5-4.5' },
      'Bilirubin': { value: 0.6, unit: 'mg/dL', flag: null, ref: '0-1.2' },
      'ALP': { value: 61, unit: 'IU/L', flag: null, ref: '44-121' },
      'AST': { value: 20, unit: 'IU/L', flag: null, ref: '0-40' },
      'ALT': { value: 17, unit: 'IU/L', flag: null, ref: '0-44' },
      // ANA / Autoimmune
      'ANA': { value: 'Positive 1:80 Speckled', unit: '', flag: 'abnormal', ref: 'Negative' },
      'C3 Complement': { value: 96, unit: 'mg/dL', flag: null, ref: '90-180' },
      'C4 Complement': { value: 16, unit: 'mg/dL', flag: null, ref: '14-44' },
      'ESR': { value: 2, unit: 'mm/hr', flag: null, ref: '0-30' },
    },
  },
  {
    date: '2025-06-27',
    source: 'Labcorp',
    values: {
      // NMR LipoProfile
      'LDL-P': { value: 1578, unit: 'nmol/L', flag: 'high', ref: '<1000' },
      'LDL-C': { value: 146, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 48, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 236, unit: 'mg/dL', flag: 'high', ref: '0-149' },
      'Total Cholesterol': { value: 237, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'HDL-P': { value: 28.3, unit: 'umol/L', flag: 'low', ref: '>=30.5' },
      'Small LDL-P': { value: 570, unit: 'nmol/L', flag: 'high', ref: '<=527' },
      'LDL Size': { value: 21.4, unit: 'nm', flag: null, ref: '>20.5' },
      'LP-IR Score': { value: 42, unit: '', flag: null, ref: '<=45' },
      'ApoB': { value: 111, unit: 'mg/dL', flag: 'high', ref: '<90' },
      'Lp(a)': { value: 181.7, unit: 'nmol/L', flag: 'high', ref: '<75' },
      'Homocysteine': { value: 21.4, unit: 'umol/L', flag: 'high', ref: '0-14.5' },
      'CRP': { value: 0.34, unit: 'mg/L', flag: null, ref: '0-3.0' },
      // CBC
      'WBC': { value: 6.4, unit: 'x10E3/uL', flag: null, ref: '3.4-10.8' },
      'RBC': { value: 5.26, unit: 'x10E6/uL', flag: null, ref: '4.14-5.80' },
      'Hemoglobin': { value: 15.4, unit: 'g/dL', flag: null, ref: '13.0-17.7' },
      'Hematocrit': { value: 48.4, unit: '%', flag: null, ref: '37.5-51.0' },
      'MCV': { value: 92, unit: 'fL', flag: null, ref: '79-97' },
      'RDW': { value: 13.2, unit: '%', flag: null, ref: '11.6-15.4' },
      'Platelets': { value: 121, unit: 'x10E3/uL', flag: 'low', ref: '150-450' },
      // CMP
      'Glucose': { value: 93, unit: 'mg/dL', flag: null, ref: '70-99' },
      'BUN': { value: 24, unit: 'mg/dL', flag: null, ref: '6-24' },
      'Creatinine': { value: 1.45, unit: 'mg/dL', flag: 'high', ref: '0.76-1.27' },
      'eGFR': { value: 56, unit: 'mL/min/1.73', flag: 'low', ref: '>59' },
      'Sodium': { value: 139, unit: 'mmol/L', flag: null, ref: '134-144' },
      'Potassium': { value: 4.8, unit: 'mmol/L', flag: null, ref: '3.5-5.2' },
      'Chloride': { value: 103, unit: 'mmol/L', flag: null, ref: '96-106' },
      'CO2': { value: 18, unit: 'mmol/L', flag: 'low', ref: '20-29' },
      'Calcium': { value: 9.7, unit: 'mg/dL', flag: null, ref: '8.7-10.2' },
      'Protein': { value: 6.6, unit: 'g/dL', flag: null, ref: '6.0-8.5' },
      'Albumin': { value: 4.4, unit: 'g/dL', flag: null, ref: '3.8-4.9' },
      'Bilirubin': { value: 0.3, unit: 'mg/dL', flag: null, ref: '0-1.2' },
      'ALP': { value: 70, unit: 'IU/L', flag: null, ref: '44-121' },
      'AST': { value: 24, unit: 'IU/L', flag: null, ref: '0-40' },
      'ALT': { value: 19, unit: 'IU/L', flag: null, ref: '0-44' },
      // Other
      'HbA1c': { value: 5.0, unit: '%', flag: null, ref: '4.8-5.6' },
      'Insulin': { value: 11.9, unit: 'uIU/mL', flag: null, ref: '2.6-24.9' },
      'TSH': { value: 1.310, unit: 'uIU/mL', flag: null, ref: '0.45-4.5' },
      'Free T4': { value: 1.22, unit: 'ng/dL', flag: null, ref: '0.82-1.77' },
      'Vitamin D': { value: 46.8, unit: 'ng/mL', flag: null, ref: '30-100' },
      // Thrombotic Risk
      'Plasminogen': { value: 104, unit: '%', flag: null, ref: '80-120' },
      'Antithrombin': { value: 93, unit: '%', flag: null, ref: '80-120' },
      'Protein C': { value: 102, unit: '%', flag: null, ref: '73-180' },
      'Protein S': { value: 103, unit: '%', flag: null, ref: '60-150' },
      'APCR': { value: 2.1, unit: 'ratio', flag: 'low', ref: '2.2-3.5' },
      'Factor V Leiden': { value: 'Not Detected', unit: '', flag: null, ref: 'Negative' },
      'Factor II': { value: 'Not Detected', unit: '', flag: null, ref: 'Negative' },
    },
  },
  {
    date: '2025-09-02',
    source: 'NIH Clinical Center',
    provider: 'Ko, Seong',
    values: {
      // CBC
      'WBC': { value: 6.16, unit: 'K/mcL', flag: null, ref: '4.23-9.07' },
      'RBC': { value: 5.54, unit: 'M/mcL', flag: null, ref: '4.63-6.08' },
      'Hemoglobin': { value: 16.5, unit: 'g/dL', flag: null, ref: '13.7-17.5' },
      'Hematocrit': { value: 49.5, unit: '%', flag: null, ref: '40.1-51.0' },
      'MCV': { value: 89.4, unit: 'fL', flag: null, ref: '79.0-92.2' },
      'MCH': { value: 29.8, unit: 'pg', flag: null, ref: '25.7-32.2' },
      'MCHC': { value: 33.3, unit: 'g/dL', flag: null, ref: '32.3-36.5' },
      'RDW': { value: 13.6, unit: '%', flag: null, ref: '11.6-14.4' },
      'Platelets': { value: 208, unit: 'K/mcL', flag: null, ref: '161-347', note: 'Normal at NIH — confirms pseudothrombocytopenia at Labcorp (EDTA artifact)' },
      'MPV': { value: 9.8, unit: 'fL', flag: null, ref: '9.4-12.4' },
      'Neutrophils': { value: 57.4, unit: '%', flag: null, ref: '34.0-67.9' },
      'Lymphocytes': { value: 31, unit: '%', flag: null, ref: '21.8-53.1' },
      'Monocytes': { value: 7.8, unit: '%', flag: null, ref: '5.3-12.2' },
      'Eosinophils': { value: 2.9, unit: '%', flag: null, ref: '0.8-7.0' },
      'Basophils': { value: 0.6, unit: '%', flag: null, ref: '0.2-1.2' },
      'Neutrophil Abs': { value: 3.53, unit: 'K/mcL', flag: null, ref: '1.78-5.38' },
      'Lymphocyte Abs': { value: 1.91, unit: 'K/mcL', flag: null, ref: '1.32-3.57' },
      'Monocyte Abs': { value: 0.48, unit: 'K/mcL', flag: null, ref: '0.30-0.82' },
      'Eosinophil Abs': { value: 0.18, unit: 'K/mcL', flag: null, ref: '0.04-0.54' },
      'Basophil Abs': { value: 0.04, unit: 'K/mcL', flag: null, ref: '0.01-0.08' },
      // Acute Care Panel (CMP equivalent)
      'Sodium': { value: 140, unit: 'mmol/L', flag: null, ref: '136-145' },
      'Potassium': { value: 3.8, unit: 'mmol/L', flag: null, ref: '3.5-5.1' },
      'Chloride': { value: 104, unit: 'mmol/L', flag: null, ref: '98-107' },
      'CO2': { value: 27, unit: 'mmol/L', flag: null, ref: '22-29' },
      'Creatinine': { value: 1.19, unit: 'mg/dL', flag: 'high', ref: '0.73-1.18' },
      'eGFR': { value: 71, unit: 'mL/min/1.73', flag: null, ref: '>59', note: 'CKD-EPI 2021 formula' },
      'Glucose': { value: 95, unit: 'mg/dL', flag: null, ref: '70-99' },
      'BUN': { value: 17, unit: 'mg/dL', flag: null, ref: '8-26' },
      // Mineral Panel
      'Albumin': { value: 4.4, unit: 'g/dL', flag: null, ref: '3.5-5.2' },
      'Calcium': { value: 9.7, unit: 'mg/dL', flag: null, ref: '8.4-10.2' },
      'Magnesium': { value: 2, unit: 'mg/dL', flag: null, ref: '1.6-2.6' },
      'Phosphorus': { value: 2.9, unit: 'mg/dL', flag: null, ref: '2.3-4.7' },
      // Hepatic Panel
      'ALP': { value: 58, unit: 'U/L', flag: null, ref: '40-150' },
      'ALT': { value: 15, unit: 'U/L', flag: null, ref: '0-55' },
      'AST': { value: 19, unit: 'U/L', flag: null, ref: '5-34' },
      'Bilirubin': { value: 0.8, unit: 'mg/dL', flag: null, ref: '0.2-1.2' },
      'Bilirubin Direct': { value: 0.2, unit: 'mg/dL', flag: null, ref: '0.0-0.5' },
      // Urinalysis
      'Urine Specific Gravity': { value: 1.004, unit: '', flag: null, ref: '1.002-1.035' },
      'Urine pH': { value: 7, unit: '', flag: null, ref: '5.0-8.0' },
    },
  },
];

// Key metrics with current values and goals for the Health page
export const keyMetrics = [
  { id: 'weight', label: 'Weight', current: null, goal: 185, unit: 'lbs', direction: 'lower', category: 'body' },
  { id: 'bodyFat', label: 'Body Fat', current: null, goal: 20, goalLabel: '18-20%', unit: '%', direction: 'lower', category: 'body' },
  { id: 'apoB', label: 'ApoB', current: 111, goal: 70, unit: 'mg/dL', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'ldl', label: 'LDL-C', current: 146, goal: 70, unit: 'mg/dL', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'lpa', label: 'Lp(a)', current: 181.7, goal: null, goalLabel: 'genetic', unit: 'nmol/L', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'homocysteine', label: 'Homocysteine', current: 21.4, goal: 10, unit: 'umol/L', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'egfr', label: 'eGFR', current: 56, goal: null, goalLabel: 'stable', unit: 'mL/min', direction: 'higher', category: 'kidney', lastDate: '2025-06-27' },
  { id: 'creatinine', label: 'Creatinine', current: 1.45, goal: null, goalLabel: '< 1.27', unit: 'mg/dL', direction: 'lower', category: 'kidney', lastDate: '2025-06-27' },
  { id: 'hba1c', label: 'HbA1c', current: 5.0, goal: null, goalLabel: '< 5.7', unit: '%', direction: 'lower', category: 'metabolic', lastDate: '2025-06-27' },
  { id: 'crp', label: 'hs-CRP', current: 0.34, goal: null, goalLabel: '< 1.0', unit: 'mg/L', direction: 'lower', category: 'inflammation', lastDate: '2025-06-27' },
  { id: 'platelets', label: 'Platelets', current: 121, goal: 150, unit: 'x10E3', direction: 'higher', category: 'blood', lastDate: '2025-06-27' },
  { id: 'vitD', label: 'Vitamin D', current: 46.8, goal: null, goalLabel: '40-60', unit: 'ng/mL', direction: 'maintain', category: 'vitamins', lastDate: '2025-06-27' },
];

// Risk reduction plans
export const riskPlans = [
  {
    id: 'heart',
    label: 'Heart Disease',
    emoji: '❤️',
    color: '#ef4444',
    actions: [
      'Rosuvastatin + Ezetimibe (LDL/ApoB)',
      'Fish oil (triglycerides)',
      'Fiber 30g/day',
      'Mediterranean diet',
      'Zone 2 cardio 150 min/week',
      'B-vitamins for homocysteine',
    ],
  },
  {
    id: 'kidney',
    label: 'Kidney Disease',
    emoji: '🫘',
    color: '#f59e0b',
    actions: [
      'BP monitoring & control',
      'Hydration 80+ oz/day',
      'Avoid NSAIDs',
      'Monitor creatinine/eGFR every 6 mo',
      'Limit protein if eGFR drops further',
    ],
  },
  {
    id: 'muscle',
    label: 'Muscle Loss',
    emoji: '💪',
    color: '#3b82f6',
    actions: [
      'Lift 3x/week',
      'Protein 120g/day',
      'Creatine 5g/day',
      'Enclomiphene (testosterone)',
    ],
  },
  {
    id: 'crohns',
    label: "Crohn's",
    emoji: '🔬',
    color: '#8b5cf6',
    actions: [
      'Mediterranean diet',
      'Probiotics',
      'Colonoscopy per GI schedule',
      'Avoid trigger foods',
      'Monitor calprotectin',
    ],
  },
];

// Monitoring schedule
export const monitoringSchedule = [
  { test: 'Lipids / ApoB', frequency: 'Every 6 months', nextDue: '2025-12', category: 'heart' },
  { test: 'CMP (kidney)', frequency: 'Every 6 months', nextDue: '2025-12', category: 'kidney' },
  { test: 'Homocysteine', frequency: 'Every 6 months', nextDue: '2025-12', category: 'heart' },
  { test: 'Testosterone', frequency: 'Yearly', nextDue: '2026-06', category: 'hormonal' },
  { test: 'Colonoscopy', frequency: 'Per GI', nextDue: 'TBD', category: 'crohns' },
  { test: 'Coronary calcium', frequency: 'Every 3-5 years', nextDue: 'TBD', category: 'heart' },
  { test: 'DEXA scan', frequency: 'Every 5 years', nextDue: 'TBD', category: 'bone' },
  { test: 'MRI Abdomen (HPRC)', frequency: 'Every 2 years', nextDue: '2027-09', category: 'cancer' },
  { test: 'Dermatology exam', frequency: 'Yearly', nextDue: '2026', category: 'cancer' },
  { test: 'Eye exam', frequency: 'Yearly', nextDue: '2026', category: 'general' },
  { test: 'PSA', frequency: 'Yearly', nextDue: '2025-10', category: 'cancer' },
];

// Helper: get latest value for a given test across all lab dates
export function getLatestValue(testName) {
  for (let i = labHistory.length - 1; i >= 0; i--) {
    const v = labHistory[i].values[testName];
    if (v && v.value != null) return { ...v, date: labHistory[i].date };
  }
  return null;
}

// Helper: get trend data (all values over time) for a given test
export function getTrend(testName) {
  return labHistory
    .filter(h => h.values[testName]?.value != null)
    .map(h => ({ date: h.date, value: h.values[testName].value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
