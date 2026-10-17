export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

export const USER_ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  ADMIN: 'admin',
};

export const COLLEGES = ['CSIT', 'CSIP'];

export const BRANCHES = [
  'CSE',
  'AI & DS',
  'EEE',
  'Mechanical Engineering',
  'Mechatronics',
  'Civil Engineering',
  'IT',
  'ECE',
];

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate',
];

export const GRADUATION_YEARS = [
  '2028',
  '2027',
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
];

export const COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Meta',
  'Startup',
  'Other',
];
