import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { Packer } from 'docx';
import { loadCareer } from '../build/career.mjs';
import { checkParse, missingKeywords } from '../resume/check.mjs';
import { docxText, docxXmlToText } from '../resume/extract.mjs';
import { SECTION_ORDER, plainText, resumeModel } from '../resume/model.mjs';
import { resumeDocx } from '../resume/render-docx.mjs';
import { resumeHtml } from '../resume/render-html.mjs';

const career = await loadCareer();
const tailoring = JSON.parse(await readFile(new URL('../resume/tailoring/artcraft.json', import.meta.url), 'utf8'));
const general = JSON.parse(await readFile(new URL('../resume/tailoring/general.json', import.meta.url), 'utf8'));
// Test-only contact details: the real ones live in the gitignored resume/contact.private.json.
const contact = { phone: '555-010-0199' };
const { doc, warnings } = resumeModel(career, tailoring, contact);

test('sections come in the ATS order and the contact line is in the body', () => {
  assert.deepEqual(doc.sections.map((s) => s.heading), SECTION_ORDER);
  assert.deepEqual(doc.contact.slice(0, 3), [career.person.location, contact.phone, career.person.email]);
  assert.equal(doc.name, 'Thomas Braun');
  assert.equal(doc.title, career.person.titleVariants[tailoring.titleVariant]);
});

test('experience is reverse chronological and dated; undated roles are reported, not guessed', () => {
  const titles = doc.sections[1].blocks.map((b) => `${b.title} @ ${b.org}`);
  assert.equal(titles[0], 'Co-Founder @ Atlas Cybernetics Corp, Atlas Inference Engine');
  assert.equal(titles.at(-1), 'Solidity Developer @ Bitgem NFT');
  assert.ok(titles.every((t) => !t.includes('Ansys')));
  assert.deepEqual(warnings, ['omitted from the resume (no dates in career.json): R&D Engineer II, Ansys']);
  for (const b of doc.sections[1].blocks) assert.match(b.dates, /^[A-Z][a-z]{2} \d{4} - ([A-Z][a-z]{2} \d{4}|Present)$/);
});

test('projects follow the tailoring order, end with the patent, and carry sourced figures', () => {
  const titles = doc.sections[2].blocks.map((b) => b.title);
  assert.equal(titles[0], 'Atlas Inference Engine');
  assert.ok(titles.at(-1).startsWith('Recursive Cryptography Protocol (US Patent 12,224,993 B2)'));
  assert.ok(!titles.includes('Rust Neural Network Engine'), 'legacy, unverifiable projects stay off the resume');
  assert.match(doc.sections[2].blocks[0].bullets.at(-1), /737 GitHub stars\.$/);
});

test('the tailoring must name every knob and only known ids', () => {
  assert.throws(() => resumeModel(career, { ...tailoring, keywords: undefined }, contact), /tailoring is missing: keywords/);
  assert.throws(() => resumeModel(career, { ...tailoring, projects: ['nope'] }, contact), /unknown project: nope/);
  assert.throws(() => resumeModel(career, tailoring, {}), /contact is missing: phone/);
  assert.throws(() => resumeModel(career, tailoring, { phone: '' }), /contact.phone must be/);
  assert.throws(() => resumeModel(career, { ...tailoring, summary: 5 }, contact), /tailoring.summary must be/);
  assert.throws(() => resumeModel(career, { ...tailoring, titleVariant: 'nope' }, contact), /unknown title variant: nope/);
});

test('the plain text of the model passes its own parse check, and a dropped heading fails it', () => {
  const text = plainText(doc);
  assert.deepEqual(checkParse(text, doc).problems, []);
  const broken = text.replace('\nProjects\n', '\n');
  assert.deepEqual(checkParse(broken, doc).problems, ['heading out of order or missing: Projects']);
  const reordered = text.replace('\nSkills\n', '\n').replace('\nEducation\n', '\nEducation\nSkills\n');
  assert.ok(checkParse(reordered, doc).problems.some((p) => p.startsWith('Skills: out of order or missing')));
});

test('keywords are matched as whole words', () => {
  assert.deepEqual(missingKeywords('specific things', ['CI']), ['keyword absent: CI']);
  assert.deepEqual(missingKeywords('testing, CI and release gates', ['CI']), []);
  assert.deepEqual(missingKeywords('agent-ready CLIs', ['CLI']), ['keyword absent: CLI']);
});

test('the public resume (general tailoring, phone null) carries city, email and links but no phone', () => {
  const pub = resumeModel(career, general, { phone: null }).doc;
  assert.deepEqual(pub.contact, [career.person.location, career.person.email, 'github.com/tbraun96', 'linkedin.com/in/tpbraun', 'thomaspbraun.com']);
  assert.equal(pub.sections[0].blocks[0].text, career.summary);
  assert.doesNotMatch(resumeHtml(pub).replace(/[\s().+-]/g, ''), /\d{10,}/);
  assert.deepEqual(checkParse(plainText(pub), pub).problems, []);
});

test('the HTML is single-column, table-free, image-free and selectable', () => {
  const html = resumeHtml(doc);
  assert.doesNotMatch(html, /<table|<img|column-count|position:\s*absolute/);
  assert.match(html, /<h2>Summary<\/h2>[\s\S]*<h2>Experience<\/h2>[\s\S]*<h2>Projects<\/h2>[\s\S]*<h2>Skills<\/h2>[\s\S]*<h2>Education<\/h2>/);
  assert.ok(html.includes(contact.phone));
});

test('the DOCX round-trips through its XML with every section, entry and keyword in order', async () => {
  const buffer = await Packer.toBuffer(resumeDocx(doc));
  const text = await docxText(buffer);
  assert.deepEqual(checkParse(text, doc).problems, []);
  assert.doesNotMatch(text, /<w:/);
  assert.equal(docxXmlToText('<w:p><w:r><w:t>A &amp; B</w:t></w:r><w:tab/><w:t>C</w:t></w:p><w:p><w:t>D</w:t></w:p>'), 'A & B C\nD\n');
});
