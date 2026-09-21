// 1. Job Types Enum
export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time', color: 'blue' },
  { value: 'PART_TIME', label: 'Part-time', color: 'cyan' },
  { value: 'CONTRACT', label: 'Contract', color: 'orange' },
  { value: 'INTERNSHIP', label: 'Internship', color: 'green' },
  { value: 'MANDATE_BASED', label: 'Mandate / Assignment', color: 'purple' },
];

export const getJobTypeLabel = (type) => {
  if (!type) return 'Full-time';
  const found = JOB_TYPES.find(jt => jt.value === type || jt.label.toLowerCase() === type.toLowerCase());
  return found ? found.label : type;
};

export const getJobTypeColor = (type) => {
  if (!type) return 'blue';
  const found = JOB_TYPES.find(jt => jt.value === type || jt.label.toLowerCase() === type.toLowerCase());
  return found ? found.color : 'blue';
};

// 2. Salary Bracket Enum
export const SALARY_RANGES = [
  { value: 'UNDER_6_LPA', label: '< ₹6 LPA / Stipend', shortLabel: '< ₹6L PA' },
  { value: 'RANGE_6_TO_12_LPA', label: '₹6L - ₹12L PA', shortLabel: '₹6L - ₹12L PA' },
  { value: 'RANGE_12_TO_18_LPA', label: '₹12L - ₹18L PA', shortLabel: '₹12L - ₹18L PA' },
  { value: 'RANGE_18_TO_25_LPA', label: '₹18L - ₹25L PA', shortLabel: '₹18L - ₹25L PA' },
  { value: 'RANGE_25_TO_40_LPA', label: '₹25L - ₹40L PA', shortLabel: '₹25L - ₹40L PA' },
  { value: 'ABOVE_40_LPA', label: '₹40L+ PA', shortLabel: '₹40L+ PA' },
  { value: 'NEGOTIABLE', label: 'Negotiable / Market Rate', shortLabel: 'Negotiable' },
];

export const getSalaryRangeLabel = (val) => {
  if (!val) return 'Competitive / Negotiable';
  const found = SALARY_RANGES.find(sr => sr.value === val || sr.label === val || sr.shortLabel === val);
  return found ? found.shortLabel : val;
};

// 3. Experience Level Enum
export const EXPERIENCE_LEVELS = [
  { value: 'ENTRY_LEVEL', label: 'Entry Level (0-2 Yrs / Trainee)', shortLabel: '0-2 Yrs' },
  { value: 'MID_LEVEL', label: 'Mid Level (3-5 Yrs)', shortLabel: '3-5 Yrs' },
  { value: 'SENIOR_LEVEL', label: 'Senior Level (6-10 Yrs)', shortLabel: '6-10 Yrs' },
  { value: 'DIRECTOR_EXECUTIVE', label: 'Executive / Partner (10+ Yrs)', shortLabel: '10+ Yrs' },
  { value: 'MANDATE_SPECIFIC', label: 'Mandate / Domain Specific', shortLabel: 'Mandate Specific' },
];

export const getExperienceLevelLabel = (val) => {
  if (!val) return 'Mid Level (3-5 Yrs)';
  const found = EXPERIENCE_LEVELS.find(el => el.value === val || el.label === val || el.shortLabel === val);
  return found ? found.label : val;
};

export const getExperienceLevelShortLabel = (val) => {
  if (!val) return '3-5 Yrs';
  const found = EXPERIENCE_LEVELS.find(el => el.value === val || el.label === val || el.shortLabel === val);
  return found ? found.shortLabel : val;
};
