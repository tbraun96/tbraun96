// content/career.json is the single source of the experience, projects, education and skills on the site, in
// the README and in the resume. validateCareer() is pure; loadCareer() is the one place that reads it.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const CONTENT = fileURLToPath(new URL('../content/', import.meta.url));

export class CareerError extends Error {
  constructor(problems) {
    super(`content/career.json is invalid:\n  - ${problems.join('\n  - ')}`);
    this.problems = problems;
  }
}

function schemaProblems(schema, data) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const valid = ajv.validate(schema, data);
  if (valid) return [];
  return ajv.errors.map((e) => `${e.instancePath || '/'} ${e.message}${e.params.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`);
}

const monthValue = (m) => (/^\d{4}-\d{2}$/.test(m) ? Number(m.replace('-', '')) : undefined);

/** Checks the schema cannot express: source keys resolve, ids are unique, dated ranges run forwards. */
function integrityProblems(data) {
  const problems = [];
  const sources = new Set(Object.keys(data.sources));
  const checkSources = (where, keys) => {
    for (const k of keys) if (!sources.has(k)) problems.push(`${where}: unknown source "${k}"`);
  };
  const ids = new Set();
  for (const r of data.experience) {
    if (ids.has(r.id)) problems.push(`experience: duplicate id "${r.id}"`);
    ids.add(r.id);
    checkSources(`experience/${r.id}`, r.sources);
    if ((r.start === 'unknown') !== (r.end === 'unknown')) problems.push(`experience/${r.id}: start and end must both be known or both unknown`);
    const s = monthValue(r.start), e = monthValue(r.end);
    if (s !== undefined && e !== undefined && e < s) problems.push(`experience/${r.id}: ends before it starts`);
  }
  for (const p of data.projects) {
    if (ids.has(p.id)) problems.push(`projects: duplicate id "${p.id}"`);
    ids.add(p.id);
    checkSources(`projects/${p.id}`, p.sources);
    if ((p.start === undefined) !== (p.end === undefined)) problems.push(`projects/${p.id}: start and end come together`);
  }
  checkSources('patent', data.patent.sources);
  data.education.forEach((e, i) => checkSources(`education/${i}`, e.sources));
  return problems;
}

/** Throws CareerError listing every problem; returns the data unchanged when it is valid. */
export function validateCareer(data, schema) {
  const problems = schemaProblems(schema, data);
  if (problems.length === 0) problems.push(...integrityProblems(data));
  if (problems.length > 0) throw new CareerError(problems);
  return data;
}

export async function loadCareer() {
  const [data, schema] = await Promise.all([
    readFile(CONTENT + 'career.json', 'utf8').then(JSON.parse),
    readFile(CONTENT + 'career.schema.json', 'utf8').then(JSON.parse),
  ]);
  return validateCareer(data, schema);
}
