// The only module here that touches the filesystem. `node build/build.mjs` writes dist/ (the page, the static
// files and the public resume at /resume.pdf) and README.md; `--check` fails instead of writing when README.md
// is out of date.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as copy from '../content/profile.mjs';
import { resumeModel } from '../resume/model.mjs';
import { checkPdf, printPdf } from '../resume/pdf.mjs';
import { resumeHtml } from '../resume/render-html.mjs';
import { loadCareer } from './career.mjs';
import { compose } from './compose.mjs';
import { page } from './page.mjs';
import { readme } from './readme.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (p) => root + p;
const REPO = 'tbraun96/tbraun96';
const PUBLIC_TAILORING = 'resume/tailoring/general.json';

function inlineSignature(svg) {
  const inline = svg
    .replace(/fill="#[0-9a-fA-F]{6}"/, 'fill="currentColor"')
    .replace(/<svg /, '<svg class="signature" ');
  if (inline === svg) throw new Error('signature.svg: expected a <svg> with one fill colour');
  return inline;
}

/** The public resume: the same model as `npm run resume`, with no phone number (contact.phone null). */
async function publicResume(career) {
  const tailoring = JSON.parse(await readFile(at(PUBLIC_TAILORING), 'utf8'));
  const { doc, warnings } = resumeModel(career, tailoring, { phone: null });
  for (const w of warnings) console.warn(`warning: ${w}`);
  const pdf = await printPdf(resumeHtml(doc));
  const { pages, problems } = await checkPdf(pdf, doc);
  if (problems.length > 0) throw new Error(`/resume.pdf failed its parse check:\n  - ${problems.join('\n  - ')}`);
  return { pdf, pages };
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
  const resume = await publicResume(career);

  await rm(at('dist'), { recursive: true, force: true });
  await mkdir(at('dist'));
  await cp(at('static'), at('dist'), { recursive: true, filter: (src) => !src.endsWith('styles.css') });
  await writeFile(at('dist/index.html'), html);
  await writeFile(at('dist/resume.pdf'), resume.pdf);
  await writeFile(at('README.md'), expected);
  console.log(`dist/ built (${(html.length / 1024).toFixed(1)} KiB index.html, resume.pdf ${resume.pages} pages, parse check passed); README.md written.`);
}

await main();
