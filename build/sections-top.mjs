// Hero, experience and education. Pure: content in, markup out.

import { esc, link, sectionHead } from './html.mjs';
import { icon } from './icons.mjs';

export function hero(person, links, signatureSvg) {
  const [lead, accent] = person.headline;
  const social = links
    .map((l) => `<li>${link(l.href, icon(l.icon), { cls: 'social', label: l.label })}</li>`)
    .join('');
  return `<section id="home" class="hero" aria-labelledby="home-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(person.eyebrow)}</p>
      <h1 id="home-title">${esc(lead)}<br><span class="accent">${esc(accent)}</span></h1>
      <p class="hero-lede">${esc(person.lede)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="mailto:${esc(person.email)}">${icon('mail')}Get in Touch</a>
        <a class="btn btn-ghost" href="#projects">${icon('cpu')}View Projects</a>
      </div>
      <ul class="socials" aria-label="Profiles">${social}</ul>
    </div>
    <div class="hero-signature">${signatureSvg}</div>
  </div>
  <a class="scroll-cue" href="#experience" aria-label="Scroll to experience section">${icon('arrowdown')}</a>
</section>`;
}

function role(r) {
  return `<li class="card role">
  <img class="logo" src="${esc(r.logo)}" alt="${esc(r.org)}" width="120" height="48" loading="lazy" decoding="async">
  <div>
    <h3>${esc(r.title)}</h3>
    <p class="meta"><span>${esc(r.org)}</span><span class="pill">${esc(r.when)}</span></p>
    <p>${esc(r.text)}</p>
  </div>
</li>`;
}

function patent(p) {
  return `<article class="card patent" aria-labelledby="patent-title">
  <div class="patent-copy">
    <p class="eyebrow">${icon('award', 'icon icon-inline')}${esc(p.label)}</p>
    <h3 id="patent-title">${esc(p.title)}</h3>
    <p class="meta">${esc(p.number)}</p>
    <p>${esc(p.text)}</p>
  </div>
  <img class="patent-figure" src="/img/patent-800.webp" srcset="/img/patent-800.webp 800w, /img/patent-1346.webp 1346w"
    sizes="(max-width: 860px) 92vw, 520px" alt="${esc(p.image.alt)}" width="${p.image.w}" height="${p.image.h}" loading="lazy" decoding="async">
</article>`;
}

export function experience(x) {
  return `<section id="experience" class="section" aria-labelledby="experience-title">
  <div class="wrap">
    ${sectionHead(x, 'experience')}
    <ul class="grid grid-2" role="list">${x.roles.map(role).join('')}</ul>
    ${patent(x.patent)}
  </div>
</section>`;
}

function school(e) {
  const place = e.place ? `<p class="meta">${icon('mappin', 'icon icon-inline')}${esc(e.place)}</p>` : '';
  return `<li class="card school">
  <img class="logo logo-round" src="${esc(e.logo)}" alt="${esc(e.school)}" width="64" height="64" loading="lazy" decoding="async">
  <p class="eyebrow">${esc(e.degree)}</p>
  <h3>${esc(e.field)}</h3>
  <p class="org">${esc(e.school)}</p>
  ${place}
  <p>${esc(e.text)}</p>
</li>`;
}

export function education(x) {
  return `<section id="education" class="section" aria-labelledby="education-title">
  <div class="wrap">
    ${sectionHead(x, 'education')}
    <ul class="grid grid-3" role="list">${x.entries.map(school).join('')}</ul>
    <aside class="card note" aria-labelledby="early-title">
      ${icon('book', 'icon icon-badge')}
      <div><h3 id="early-title">${esc(x.early.title)}</h3><p>${esc(x.early.text)}</p></div>
    </aside>
  </div>
</section>`;
}
