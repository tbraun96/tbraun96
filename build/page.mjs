// The document: head, navigation and the sections in the order the 2026 site served them.

import { esc } from './html.mjs';
import { hero, experience, education } from './sections-top.mjs';
import { skills, projects, contact, footer } from './sections-bottom.mjs';

const NAV = [
  ['#home', 'Home'],
  ['#experience', 'Experience'],
  ['#education', 'Education'],
  ['#skills', 'Skills'],
  ['#projects', 'Projects'],
  ['#contact', 'Contact'],
];

function structuredData(c) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.person.fullName,
    url: c.site.url,
    email: `mailto:${c.person.email}`,
    jobTitle: 'Founder',
    worksFor: [{ '@type': 'Organization', name: 'Atlas Cybernetics Corp', url: 'https://atlasinference.io' }, { '@type': 'Organization', name: 'Avarok Cybersecurity' }],
    sameAs: c.links.filter((l) => l.href.startsWith('https://')).map((l) => l.href),
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function head(c, css) {
  const s = c.site;
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(s.title)}</title>
<meta name="description" content="${esc(s.description)}">
<link rel="canonical" href="${esc(s.url)}/">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8fafc">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b1120">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(s.title)}">
<meta property="og:description" content="${esc(s.description)}">
<meta property="og:url" content="${esc(s.url)}">
<meta property="og:image" content="${esc(s.url + s.ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Thomas Braun signature">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/initials.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}</style>
<script type="application/ld+json">${structuredData(c)}</script>
<script type="module" src="/app.js"></script>
</head>`;
}

function nav(name) {
  const items = NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  return `<header class="site-nav">
  <nav class="wrap nav-inner" aria-label="Primary">
    <a class="brand" href="#home">${esc(name)}</a>
    <ul class="nav-links">${items}</ul>
  </nav>
</header>`;
}

export function page(c, { css, signatureSvg, year }) {
  return `<!doctype html>
<html lang="en">
${head(c, css)}
<body>
<a class="skip" href="#main">Skip to content</a>
${nav(c.person.name)}
<main id="main">
${hero(c.person, c.links, signatureSvg)}
${experience(c.experience)}
${education(c.education)}
${skills(c.skills)}
${projects(c.projects)}
${contact(c.contact)}
</main>
${footer(c.person, c.links, year)}
</body>
</html>
`;
}
