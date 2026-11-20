// `node resume/build.mjs --tailoring resume/tailoring/artcraft.json --contact resume/contact.private.json`
// writes out/resume-<target>.pdf and .docx from content/career.json, then reads both back and fails if an
// ATS could not recover every section, entry, date and keyword in order, or if the PDF runs past two pages.
// Filesystem I/O lives here; the browser lives in pdf.mjs.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Packer } from 'docx';
import { loadCareer } from '../build/career.mjs';
import { checkParse } from './check.mjs';
import { docxText } from './extract.mjs';
import { plainText, resumeModel } from './model.mjs';
import { checkPdf, printPdf } from './pdf.mjs';
import { resumeDocx } from './render-docx.mjs';
import { resumeHtml } from './render-html.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

function report(label, problems) {
  if (problems.length === 0) return console.log(`${label}: parse check passed`);
  console.error(`${label}: parse check FAILED\n  - ${problems.join('\n  - ')}`);
  process.exitCode = 1;
}

async function main() {
  const { values } = parseArgs({ options: { tailoring: { type: 'string' }, contact: { type: 'string' }, out: { type: 'string', default: 'out' } } });
  if (!values.tailoring || !values.contact) throw new Error('usage: node resume/build.mjs --tailoring <file> --contact <file> [--out dir]');
  const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));
  const [career, tailoring, contact] = await Promise.all([loadCareer(), readJson(values.tailoring), readJson(values.contact)]);
  const { doc, warnings } = resumeModel(career, tailoring, contact);
  for (const w of warnings) console.warn(`warning: ${w}`);

  const slug = doc.target.company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const outDir = `${root}${values.out}/`;
  await mkdir(outDir, { recursive: true });
  const base = `${outDir}resume-${slug}`;

  const html = resumeHtml(doc);
  const pdf = await printPdf(html);
  const docxBuffer = await Packer.toBuffer(resumeDocx(doc));
  await Promise.all([writeFile(`${base}.pdf`, pdf), writeFile(`${base}.docx`, docxBuffer), writeFile(`${base}.html`, html), writeFile(`${base}.txt`, plainText(doc))]);

  const fromPdf = await checkPdf(pdf, doc);
  report(`${base}.pdf (${fromPdf.pages} page${fromPdf.pages === 1 ? '' : 's'})`, fromPdf.problems);
  report(`${base}.docx`, checkParse(await docxText(docxBuffer), doc).problems);
  console.log(`keywords checked: ${doc.keywords.length}; target: ${doc.target.postingTitle} (${doc.target.posting})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
