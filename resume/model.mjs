// The resume as a document model: career.json + a tailoring file + private contact details in, a tree of
// sections, entries and bullets out. Pure. render-html.mjs and render-docx.mjs each draw this one model, so
// the PDF and the DOCX cannot drift apart.

import { dateRange, isDated, reverseChronological } from '../build/dates.mjs';

/** The ATS-standard headings, in the order every renderer and the parse check expect them. */
export const SECTION_ORDER = ['Summary', 'Experience', 'Projects', 'Skills', 'Education'];

const TAILORING_FIELDS = ['target', 'title', 'summary', 'keywords', 'experienceBullets', 'projects', 'projectHighlights', 'projectStats', 'includePatent', 'patentBullets', 'skillGroups'];
const CONTACT_FIELDS = ['location', 'phone'];

function requireFields(obj, fields, what) {
  const missing = fields.filter((f) => obj[f] === undefined);
  if (missing.length > 0) throw new Error(`${what} is missing: ${missing.join(', ')}`);
}

const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function contactLine(person, contact) {
  const handles = person.profiles.filter((p) => p.handle).map((p) => p.handle);
  return [contact.location, contact.phone, person.email, ...handles, host(person.website)];
}

function byId(list, what) {
  const map = new Map(list.map((x) => [x.id, x]));
  return (id) => {
    const found = map.get(id);
    if (!found) throw new Error(`tailoring names an unknown ${what}: ${id}`);
    return found;
  };
}

function roleEntry(r, cap) {
  if (cap === undefined) throw new Error(`tailoring.experienceBullets has no entry for role ${r.id}`);
  const org = [r.org, r.unit].filter(Boolean).join(', ');
  return { type: 'entry', title: r.title, org, meta: r.location ?? '', dates: dateRange(r), bullets: r.bullets.slice(0, cap) };
}

/** Roles with dates, newest first; undated roles cannot be placed in a reverse-chronological list. */
export function experienceEntries(career, tailoring) {
  const dated = career.experience.filter(isDated);
  return {
    entries: reverseChronological(dated).map((r) => roleEntry(r, tailoring.experienceBullets[r.id])),
    skipped: career.experience.filter((r) => !isDated(r)).map((r) => `${r.title}, ${r.org}`),
  };
}

const statLine = (stats, cap) => stats.slice(0, cap).map((s) => `${s.value} ${s.label}`).join('; ');

function projectEntry(p, tailoring) {
  const cap = tailoring.projectHighlights[p.id];
  if (cap === undefined) throw new Error(`tailoring.projectHighlights has no entry for project ${p.id}`);
  const bullets = p.highlights.slice(0, cap);
  const stats = statLine(p.stats, tailoring.projectStats);
  if (stats) bullets.push(`${stats}.`);
  const link = p.url ?? p.repo ?? '';
  return { type: 'entry', title: p.name, org: p.role ?? '', meta: link ? host(link) : '', dates: p.start ? dateRange(p) : '', bullets };
}

function patentEntry(patent, bulletCap) {
  return {
    type: 'entry',
    title: `${patent.title} (${patent.number})`,
    org: `Inventor; assigned to ${patent.assignee}`,
    meta: `${patent.recognition.title}, ${patent.recognition.by}`,
    dates: `Granted ${patent.granted}`,
    bullets: [patent.text, ...patent.bullets.slice(0, bulletCap)],
  };
}

export function projectEntries(career, tailoring) {
  const project = byId(career.projects, 'project');
  const entries = tailoring.projects.map((id) => projectEntry(project(id), tailoring));
  if (tailoring.includePatent) entries.push(patentEntry(career.patent, tailoring.patentBullets));
  return entries;
}

export function skillEntries(career, tailoring) {
  const groups = new Map(career.skills.groups.map((g) => [g.name, g]));
  return tailoring.skillGroups.map((name) => {
    const g = groups.get(name);
    if (!g) throw new Error(`tailoring names an unknown skill group: ${name}`);
    return { type: 'kv', label: g.name, text: g.items.join(', ') };
  });
}

export function educationEntries(career) {
  return career.education
    .filter((e) => e.onResume)
    .map((e) => ({
      type: 'entry',
      title: `${e.degree}, ${e.field} - ${e.school}`,
      org: e.place,
      meta: '',
      dates: e.year === undefined ? '' : String(e.year),
      bullets: [],
    }));
}

/** @returns {{doc: object, warnings: string[]}} */
export function resumeModel(career, tailoring, contact) {
  requireFields(tailoring, TAILORING_FIELDS, 'tailoring');
  requireFields(contact, CONTACT_FIELDS, 'contact');
  const experience = experienceEntries(career, tailoring);
  const doc = {
    name: career.person.shortName,
    title: tailoring.title,
    contact: contactLine(career.person, contact),
    sections: [
      { heading: 'Summary', blocks: [{ type: 'p', text: tailoring.summary }] },
      { heading: 'Experience', blocks: experience.entries },
      { heading: 'Projects', blocks: projectEntries(career, tailoring) },
      { heading: 'Skills', blocks: skillEntries(career, tailoring) },
      { heading: 'Education', blocks: educationEntries(career) },
    ],
    keywords: tailoring.keywords,
    target: tailoring.target,
  };
  const warnings = experience.skipped.map((r) => `omitted from the resume (no dates in career.json): ${r}`);
  return { doc, warnings };
}

/** The resume as plain text, in reading order: what an ATS should recover from either file. */
export function plainText(doc) {
  const lines = [doc.name, doc.title, doc.contact.join(' | ')];
  for (const s of doc.sections) {
    lines.push(s.heading);
    for (const b of s.blocks) {
      if (b.type === 'p') lines.push(b.text);
      else if (b.type === 'kv') lines.push(`${b.label}: ${b.text}`);
      else {
        lines.push([b.title, b.dates].filter(Boolean).join(' '), [b.org, b.meta].filter(Boolean).join(' | '));
        lines.push(...b.bullets);
      }
    }
  }
  return lines.filter(Boolean).join('\n');
}
