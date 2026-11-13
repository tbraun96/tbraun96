// The only module here that touches the filesystem. `node build/build.mjs` writes dist/ and
// README.md; `--check` fails instead of writing when README.md is out of date.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as content from '../content/profile.mjs';
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

function buildId() {
  const arg = process.argv.find((a) => a.startsWith('--build-id='));
  const id = arg ? arg.slice('--build-id='.length) : '';
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(id)) throw new Error('npm run build -- --build-id=<commit sha or "local"> is required');
  return id;
}

async function main() {
  const check = process.argv.includes('--check');
  const expected = readme(content, { repo: REPO });
  if (check) {
    const actual = await readFile(at('README.md'), 'utf8');
    if (actual !== expected) {
      console.error('README.md is out of date: run `npm run build -- --build-id=local` and commit the result.');
      process.exit(1);
    }
    console.log('README.md matches content/.');
    return;
  }
  const css = (await readFile(at('static/styles.css'), 'utf8')).replace(/\s*\n\s*/g, '');
  const signatureSvg = inlineSignature(await readFile(at('static/img/signature.svg'), 'utf8'));
  const html = page(content, { css, signatureSvg, year: new Date().getUTCFullYear(), build: buildId() });

  await rm(at('dist'), { recursive: true, force: true });
  await mkdir(at('dist'));
  await cp(at('static'), at('dist'), { recursive: true, filter: (src) => !src.endsWith('styles.css') });
  await writeFile(at('dist/index.html'), html);
  await writeFile(at('README.md'), expected);
  console.log(`dist/ built (${(html.length / 1024).toFixed(1)} KiB index.html); README.md written.`);
}

await main();
