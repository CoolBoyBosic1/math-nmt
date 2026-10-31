// Правила плану підготовки:
// - дата завершення (дата НМТ) — щонайменше через MIN_DAYS днів від сьогодні;
// - кількість годин на тиждень — від MIN_HOURS до MAX_HOURS.
export const MIN_DAYS = 7;
export const MIN_HOURS = 1;
export const MAX_HOURS = 80;

export function isValidEndDate(date: Date | string): boolean {
  const end = new Date(date);
  if (Number.isNaN(end.getTime())) return false;
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + MIN_DAYS);
  return end >= earliest;
}

export function isValidHours(hours: number): boolean {
  return Number.isFinite(hours) && hours >= MIN_HOURS && hours <= MAX_HOURS;
}

export const END_DATE_ERROR = `Invalid end date: it must be at least ${MIN_DAYS} days from today`;
export const HOURS_ERROR = `Invalid amount of hours: allowed ${MIN_HOURS}–${MAX_HOURS} per week`;
