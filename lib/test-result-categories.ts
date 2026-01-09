export interface TestResultCategory {
  value: string
  icon: string
  description: string
}

export const TEST_RESULT_CATEGORIES: TestResultCategory[] = [
  {
    value: 'Lab Work',
    icon: '🧪',
    description: 'Analysis of bodily fluids or tissues (e.g., Blood tests, Urine culture, Lipid profile, Glucose).'
  },
  {
    value: 'Imaging',
    icon: '☢️',
    description: 'Visual diagnostic tests like X-Rays (Rayos X), MRI (Resonancia), CT Scans (Scanner), and Ultrasounds (Ecografías).'
  },
  {
    value: 'Cardio Tests',
    icon: '💓',
    description: 'Specific heart monitoring tests like Electrocardiogram (ECG), Holter monitor, or Stress tests.'
  },
  {
    value: 'Genetics',
    icon: '🧬',
    description: 'Specialized DNA testing, allergy panels, or hereditary screening.'
  },
  {
    value: 'Biopsy',
    icon: '🔬',
    description: 'Pathology reports analyzing tissue samples taken during a procedure (e.g., mole or cyst analysis).'
  },
  {
    value: 'Reports',
    icon: '📋',
    description: 'General medical summaries, discharge papers (Epicrisis), or doctor\'s written evaluations that aren\'t specific tests.'
  }
]













