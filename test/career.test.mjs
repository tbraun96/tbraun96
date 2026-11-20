import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { CareerError, loadCareer, validateCareer } from '../build/career.mjs';
import { dateRange, reverseChronological, whenLabel } from '../build/dates.mjs';

const schema = JSON.parse(await readFile(new URL('../content/career.schema.json', import.meta.url), 'utf8'));
const career = await loadCareer();
const copy = () => structuredClone(career);
const problemsOf = (data) => {
  try {
    validateCareer(data, schema);
    return [];
  } catch (e) {
    assert.ok(e instanceof CareerError);
    return e.problems;
  }
};

test('content/career.json validates against its schema', () => {
  assert.deepEqual(problemsOf(career), []);
});

test('a missing required field fails the build', () => {
  const data = copy();
  delete data.experience[0].start;
  assert.match(problemsOf(data).join('\n'), /experience\/0 must have required property 'start'/);
});

test('an unknown field fails the build (no silent extras)', () => {
  const data = copy();
  data.projects[0].stars = 5;
  assert.match(problemsOf(data).join('\n'), /additional properties \(stars\)/);
});

test('a statistic without a source or retrieval date fails', () => {
  const data = copy();
  const withStats = data.projects.find((p) => p.stats.length > 0);
  delete withStats.stats[0].source;
  assert.match(problemsOf(data).join('\n'), /must have required property 'source'/);
});

test('source keys must resolve to the sources map', () => {
  const data = copy();
  data.experience[0].sources.push('made-up');
  assert.deepEqual(problemsOf(data), ['experience/atlas: unknown source "made-up"']);
});

test('a role cannot end before it starts, and ids are unique', () => {
  const data = copy();
  data.experience[1].end = '2001-01';
  data.projects[1].id = data.projects[0].id;
  const problems = problemsOf(data);
  assert.ok(problems.some((p) => p.endsWith('ends before it starts')), problems.join('\n'));
  assert.ok(problems.some((p) => p.includes('duplicate id')), problems.join('\n'));
});

test('every role from both sources is present', () => {
  const orgs = career.experience.map((r) => r.org);
  for (const org of ['Atlas Cybernetics Corp', 'Nomyx', 'Avarok Cybersecurity', 'Synopsys', 'Commonwealth Labs', 'Kraken Digital Asset Exchange', 'Webb.tools', 'Bitgem NFT', 'Ansys']) {
    assert.ok(orgs.includes(org), `missing role at ${org}`);
  }
  assert.ok(career.projects.some((p) => p.name === 'LatticeDB'));
  assert.ok(career.projects.every((p) => p.url || p.repo), 'every project points at a page or a repository');
});

test('date helpers', () => {
  assert.equal(dateRange({ start: '2026-03', end: 'present' }), 'Mar 2026 - Present');
  assert.equal(dateRange({ start: '2022-10', end: '2022-12' }), 'Oct 2022 - Dec 2022');
  assert.equal(dateRange({ start: 'unknown', end: 'unknown' }), '');
  assert.equal(whenLabel({ start: '2022-10', end: '2022-12' }), 'Previous');
  assert.throws(() => dateRange({ start: '2026-3', end: 'present' }), /not a YYYY-MM month/);
});

test('reverse chronological order: current by start, then ended by end, undated last', () => {
  const ids = reverseChronological(career.experience).map((r) => r.id);
  assert.deepEqual(ids, ['atlas', 'nomyx', 'avarok', 'synopsys', 'commonwealth-labs', 'kraken', 'webb', 'bitgem', 'ansys']);
});
