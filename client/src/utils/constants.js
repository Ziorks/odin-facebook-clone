export const CURRENT_YEAR = new Date().getFullYear();

export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => CURRENT_YEAR - i,
);

export const MONTHS = [
  { name: "January", nDays: 31 },
  { name: "February", nDays: 29 },
  { name: "March", nDays: 31 },
  { name: "April", nDays: 30 },
  { name: "May", nDays: 31 },
  { name: "June", nDays: 30 },
  { name: "July", nDays: 31 },
  { name: "August", nDays: 31 },
  { name: "September", nDays: 30 },
  { name: "October", nDays: 31 },
  { name: "November", nDays: 30 },
  { name: "December", nDays: 31 },
];
