// All date strings in this app should use LOCAL time, not UTC.
// new Date().toISOString() returns UTC which is wrong for EST/EDT users.

/**
 * Returns YYYY-MM-DD string in local timezone.
 * @param {Date} [d] - Date object, defaults to now
 */
export function toLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns local time string like "3:45 PM"
 */
export function toLocalTimeStr(d = new Date()) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Offset a date by N days and return YYYY-MM-DD in local time.
 */
export function offsetDateStr(dateStr, offsetDays) {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid DST issues
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateStr(d);
}
