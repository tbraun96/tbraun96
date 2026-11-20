// The resume model as a single-column HTML document, printed to PDF by Chromium. Pure. ATS rules: one
// column, real text, standard fonts, standard headings, contact details in the body (no page header or
// footer), no tables, text boxes or images.

import { esc } from '../build/html.mjs';

const CSS = `
@page { size: Letter; margin: 0.5in 0.5in; }
html { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.2; color: #111; }
body { margin: 0; }
h1 { font-size: 18pt; margin: 0; letter-spacing: .01em; }
.title { font-size: 11pt; font-weight: bold; margin: 2pt 0 0; }
.contact { margin: 2pt 0 0; font-size: 9.4pt; }
h2 { font-size: 10.4pt; text-transform: uppercase; letter-spacing: .08em; margin: 7pt 0 2.5pt; padding-bottom: 1.5pt; border-bottom: 1px solid #333; }
p { margin: 0; }
.entry { margin: 0 0 3.5pt; break-inside: avoid; }
.line { display: flex; justify-content: space-between; gap: 12pt; line-height: 1.15; }
.line .t { font-weight: bold; }
.line .d { white-space: nowrap; }
.sub { font-style: italic; }
ul { margin: 1.5pt 0 0; padding-left: 14pt; }
li { margin: 0; }
.kv { margin: 0 0 2.5pt; }
`;

const line = (left, right, cls) =>
  `<div class="line"><span class="${cls}">${esc(left)}</span>${right ? `<span class="d">${esc(right)}</span>` : ''}</div>`;

function entry(b) {
  const sub = [b.org, b.meta].filter(Boolean).join(' | ');
  const bullets = b.bullets.length ? `<ul>${b.bullets.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  return `<div class="entry">${line(b.title, b.dates, 't')}${sub ? `<p class="sub">${esc(sub)}</p>` : ''}${bullets}</div>`;
}

function block(b) {
  if (b.type === 'p') return `<p>${esc(b.text)}</p>`;
  if (b.type === 'kv') return `<p class="kv"><strong>${esc(b.label)}:</strong> ${esc(b.text)}</p>`;
  return entry(b);
}

export function resumeHtml(doc) {
  const sections = doc.sections
    .map((s) => `<section><h2>${esc(s.heading)}</h2>${s.blocks.map(block).join('')}</section>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(doc.name)} - Resume</title>
<style>${CSS}</style>
</head>
<body>
<header>
<h1>${esc(doc.name)}</h1>
<p class="title">${esc(doc.title)}</p>
<p class="contact">${doc.contact.map(esc).join(' | ')}</p>
</header>
<main>${sections}</main>
</body>
</html>
`;
}
