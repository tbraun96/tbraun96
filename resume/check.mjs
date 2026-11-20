// The ATS parse check, pure: given the text recovered from a generated file and the model it was drawn from,
// report everything an applicant tracking system would have to find, in the order it would have to find it.

import { SECTION_ORDER } from './model.mjs';

const normalise = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** Whole-word match, so a short keyword such as "CI" cannot hide inside another word. */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordPattern = (k) => new RegExp(`(?<![a-z0-9])${escapeRegExp(normalise(k))}(?![a-z0-9])`);

/** Index of `needle` in `hay` at or after `from`, both normalised; -1 when absent. */
const find = (hay, needle, from = 0) => hay.indexOf(normalise(needle), from);

/** The tailoring keywords absent from `text`, as whole words. */
export const missingKeywords = (text, keywords) => keywords.filter((k) => !wordPattern(k).test(normalise(text))).map((k) => `keyword absent: ${k}`);

/**
 * @returns {{problems: string[], found: number}} problems is empty when every heading, every entry title and
 * every keyword is present and the headings and entries come in model order.
 */
export function checkParse(text, doc) {
  const hay = normalise(text);
  const problems = [];
  let cursor = 0;
  let found = 0;
  for (const part of [doc.name, doc.title, ...doc.contact]) {
    if (find(hay, part) === -1) problems.push(`contact detail missing: ${part}`);
    else found += 1;
  }
  const headings = doc.sections.map((s) => s.heading);
  if (headings.join() !== SECTION_ORDER.join()) problems.push(`sections are ${headings.join(', ')}, expected ${SECTION_ORDER.join(', ')}`);
  for (const section of doc.sections) {
    const at = find(hay, section.heading, cursor);
    if (at === -1) {
      problems.push(`heading out of order or missing: ${section.heading}`);
      continue;
    }
    cursor = at + section.heading.length;
    found += 1;
    for (const b of section.blocks) {
      const label = b.type === 'entry' ? b.title : b.type === 'kv' ? b.label : b.text.slice(0, 40);
      const hit = find(hay, label, cursor);
      if (hit === -1) problems.push(`${section.heading}: out of order or missing: ${label}`);
      else {
        cursor = hit + normalise(label).length;
        found += 1;
      }
      if (b.type === 'entry' && b.dates && find(hay, b.dates) === -1) problems.push(`${section.heading}: dates missing for ${b.title}`);
    }
  }
  problems.push(...missingKeywords(hay, doc.keywords));
  return { problems, found };
}

/** Phone numbers and street addresses must never reach the public site. */
export function privacyProblems(publicHtml, contact) {
  const problems = [];
  const digits = contact.phone.replace(/\D/g, '');
  if (digits && publicHtml.replace(/\D/g, '').includes(digits)) problems.push('the phone number appears on the public site');
  if (/\btel:/i.test(publicHtml)) problems.push('a tel: link appears on the public site');
  return problems;
}
