import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as copy from '../content/profile.mjs';
import { loadCareer } from '../build/career.mjs';
import { compose } from '../build/compose.mjs';
import { page } from '../build/page.mjs';
import { readme } from '../build/readme.mjs';
import { privacyProblems } from '../resume/check.mjs';

const career = await loadCareer();
const content = compose(copy, career);
const html = page(content, { css: '', signatureSvg: '<svg class="signature"></svg>', year: 2026 });
const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'");

test('the page shows every role, every project and every skill group from career.json', () => {
  for (const r of career.experience) {
    assert.ok(text.includes(r.title), r.title);
    assert.ok(text.includes(r.org), r.org);
  }
  for (const p of career.projects) assert.ok(text.includes(p.name), p.name);
  for (const g of career.skills.groups) assert.ok(text.includes(g.name), g.name);
  assert.ok(text.includes('Mar 2026 - Present'));
});

test('the page links the public resume', () => {
  assert.match(html, /<a class="btn btn-ghost" href="\/resume.pdf">[\s\S]*?Resume \(PDF\)<\/a>/);
});

test('self-rated skill percentages are gone', () => {
  assert.doesNotMatch(html, /skill-pct|class="bar"|--pct:/);
  const skillsSection = /<section id="skills"[\s\S]*?<\/section>/.exec(html)[0];
  assert.doesNotMatch(skillsSection, /\d%/);
});

test('project figures carry their source for the reader', () => {
  assert.match(html, /<li title="gh repo view Avarok-Cybersecurity\/atlas \(2026-11-20\)"><strong>737<\/strong> GitHub stars<\/li>/);
});

test('roles without a logo get a monogram, roles with one get the image', () => {
  assert.match(html, /<span class="logo logo-mono" aria-hidden="true">N<\/span>/);
  assert.match(html, /<img class="logo" src="\/logos\/avarok-logo.svg"/);
});

test('structured data derives worksFor and sameAs from career.json', () => {
  const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
  assert.deepEqual(ld.worksFor.map((o) => o.name), ['Atlas Cybernetics Corp', 'Avarok Cybersecurity']);
  assert.deepEqual(ld.sameAs, ['https://github.com/tbraun96', 'https://linkedin.com/in/tpbraun', 'https://blog.thomaspbraun.com/']);
});

test('the public page carries no phone number, street address or tel: link', () => {
  assert.doesNotMatch(html, /\btel:/);
  assert.doesNotMatch(text.replace(/[\s().+-]/g, ''), /\d{10,}/);
  assert.deepEqual(privacyProblems(html, { phone: '555-010-0199' }), []);
  assert.deepEqual(privacyProblems(`${html}<a href="tel:5550100199">555-010-0199</a>`, { phone: '555-010-0199' }), [
    'the phone number appears on the public site',
    'a tel: link appears on the public site',
  ]);
});

test('the README lists the roles with their dates and the linked projects', () => {
  const md = readme(content, { repo: 'tbraun96/tbraun96' });
  assert.match(md, /- \*\*Co-Founder\*\*, Atlas Cybernetics Corp — Mar 2026 - Present/);
  assert.match(md, /\[Resume \(PDF\)\]\(https:\/\/thomaspbraun.com\/resume.pdf\)/);
  assert.match(md, /- \*\*R&D Engineer II\*\*, Ansys — previous/);
  assert.match(md, /\[\*\*LatticeDB\*\*\]\(https:\/\/avarok-cybersecurity.github.io\/lattice-db\/\)/);
  assert.doesNotMatch(md, /Rust Neural Network Engine/);
});
