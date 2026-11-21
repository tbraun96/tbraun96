// The only module here that touches the filesystem. `node build/build.mjs` writes dist/ (the page, the static
// files and the public resume at /resume.pdf) and README.md; `--check` fails instead of writing when README.md
// is out of date. /resume.pdf is the PDF ATSGate rendered and scored (RESUME_PDF, set by the deploy workflow);
// this build copies it unchanged so the file people download is the file that was scored.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as copy from '../content/profile.mjs';
import { loadCareer } from './career.mjs';
import { compose } from './compose.mjs';
import { page } from './page.mjs';
import { readme } from './readme.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (p) => root + p;
const REPO = 'tbraun96/tbraun96';

function inlineSignature(svg) {
  const inline = svg
    .replace(/fill="#[0-9a-fA-F]{6}"/, 'fill="currentColor"')
    .replace(/<svg /, '<svg class="signature" ');
  if (inline === svg) throw new Error('signature.svg: expected a <svg> with one fill colour');
  return inline;
}

/** The PDF ATSGate rendered and scored. There is no fallback: a build without it would ship an unscored resume. */
async function scoredResume() {
  const path = process.env.RESUME_PDF;
  if (!path) throw new Error('RESUME_PDF is not set: it must name the PDF ATSGate rendered and scored (see .github/workflows/deploy.yml).');
  const pdf = await readFile(path);
  if (pdf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error(`RESUME_PDF (${path}) is not a PDF`);
  return pdf;
}

async function main() {
  const check = process.argv.includes('--check');
  const career = await loadCareer();
  const content = compose(copy, career);
  const expected = readme(content, { repo: REPO });
  if (check) {
    const actual = await readFile(at('README.md'), 'utf8');
    if (actual !== expected) {
      console.error('README.md is out of date: run `npm run build` and commit the result.');
      process.exit(1);
    }
    console.log('README.md matches content/.');
    return;
  }
  const css = (await readFile(at('static/styles.css'), 'utf8')).replace(/\s*\n\s*/g, '');
  const signatureSvg = inlineSignature(await readFile(at('static/img/signature.svg'), 'utf8'));
  const html = page(content, { css, signatureSvg, year: new Date().getUTCFullYear() });
  const resume = await scoredResume();

  await rm(at('dist'), { recursive: true, force: true });
  await mkdir(at('dist'));
  await cp(at('static'), at('dist'), { recursive: true, filter: (src) => !src.endsWith('styles.css') });
  await writeFile(at('dist/index.html'), html);
  await writeFile(at('dist/resume.pdf'), resume);
  await writeFile(at('README.md'), expected);
  console.log(`dist/ built (${(html.length / 1024).toFixed(1)} KiB index.html, resume.pdf ${(resume.length / 1024).toFixed(1)} KiB from ATSGate); README.md written.`);
}

await main();
