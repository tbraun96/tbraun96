// Date helpers shared by the site, the README and the resume. Pure.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-03" → "Mar 2026". */
export function monthLabel(month) {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) throw new Error(`not a YYYY-MM month: ${month}`);
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export const isDated = (r) => r.start !== 'unknown';
export const isCurrent = (r) => r.end === 'present';

/** "Mar 2026 - Present" for the resume and the site; undated roles have no range. */
export function dateRange(r) {
  if (!isDated(r)) return '';
  return `${monthLabel(r.start)} - ${isCurrent(r) ? 'Present' : monthLabel(r.end)}`;
}

/** "Current" / "Previous" pills, as the site has always shown them. */
export const whenLabel = (r) => (isCurrent(r) ? 'Current' : 'Previous');

const monthNumber = (m) => Number(m.replace('-', ''));

/**
 * Reverse chronological: current roles first (newest start first), then ended roles by end date (newest first),
 * then roles whose dates are unknown, in their source order.
 */
export function reverseChronological(roles) {
  const rank = (r) => (!isDated(r) ? 0 : isCurrent(r) ? 2 : 1);
  return roles
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const ra = rank(a.r), rb = rank(b.r);
      if (ra !== rb) return rb - ra;
      if (ra === 0) return a.i - b.i;
      const ka = ra === 2 ? monthNumber(a.r.start) : monthNumber(a.r.end);
      const kb = rb === 2 ? monthNumber(b.r.start) : monthNumber(b.r.end);
      return kb - ka || monthNumber(b.r.start) - monthNumber(a.r.start) || a.i - b.i;
    })
    .map(({ r }) => r);
}
