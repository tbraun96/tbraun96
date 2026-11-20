// Hero, experience and education. Pure: content in, markup out.

import { esc, link, sectionHead } from './html.mjs';
import { icon } from './icons.mjs';
import { dateRange, whenLabel } from './dates.mjs';

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

function logo(r) {
  if (r.logo) return `<img class="logo" src="${esc(r.logo)}" alt="${esc(r.org)}" width="120" height="48" loading="lazy" decoding="async">`;
  return `<span class="logo logo-mono" aria-hidden="true">${esc(r.org.replace(/[^A-Za-z]/g, '').slice(0, 1))}</span>`;
}

function highlights(bullets) {
  if (bullets.length === 0) return '';
  return `<details><summary>Highlights</summary><ul class="highlights">${bullets.map((b) => `<li>${icon('check', 'icon icon-inline')}${esc(b)}</li>`).join('')}</ul></details>`;
}

function role(r) {
  const range = dateRange(r);
  const dates = range ? `<span>${esc(range)}</span>` : '';
  const where = [r.unit, r.location].filter(Boolean).map(esc).join(' · ');
  return `<li class="card role">
  ${logo(r)}
  <div>
    <h3>${esc(r.title)}</h3>
    <p class="meta"><span>${esc(r.org)}</span>${dates}<span class="pill">${esc(whenLabel(r))}</span></p>
    ${where ? `<p class="meta">${where}</p>` : ''}
    <p>${esc(r.summary)}</p>
    ${highlights(r.bullets)}
  </div>
</li>`;
}

function patent(p, label) {
  return `<article class="card patent" aria-labelledby="patent-title">
  <div class="patent-copy">
    <p class="eyebrow">${icon('award', 'icon icon-inline')}${esc(label)}</p>
    <h3 id="patent-title">${esc(p.title)}</h3>
    <p class="meta">${link(p.url, esc(p.number))}<span>Granted ${esc(p.granted)}</span><span>${esc(p.recognition.title)}, ${esc(p.recognition.by)}</span></p>
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
    ${patent(x.patent, x.patentLabel)}
  </div>
</section>`;
}

function school(e) {
  const where = [e.place, e.year].filter(Boolean).map(esc).join(' · ');
  const place = where ? `<p class="meta">${icon('mappin', 'icon icon-inline')}${where}</p>` : '';
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
