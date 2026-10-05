import { fromDateKey, toDateKey, addDays, type DateKey } from '@sparshtomar/olive-shared';

export const todayKey = (): DateKey => toDateKey(new Date());

export const kcal = (n: number) => `${Math.round(n).toLocaleString('en-IN')}`;

export const grams = (n: number) => (n < 10 ? `${Math.round(n * 10) / 10}` : `${Math.round(n)}`);

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const weekdayShort = (key: DateKey) => WEEKDAY[fromDateKey(key).getDay()]!;

/** "Today", "Yesterday", or "Mon, 28 Sep". */
export const relativeDay = (key: DateKey) => {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  const d = fromDateKey(key);
  return `${WEEKDAY[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]}`;
};

/** "12 Sep 2026" */
export const longDate = (key: DateKey) => {
  const d = fromDateKey(key);
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
};

export const shortDate = (key: DateKey) => {
  const d = fromDateKey(key);
  return `${d.getDate()} ${MONTH[d.getMonth()]}`;
};

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const time = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
