// Skills, projects, contact and footer. Pure: content in, markup out.

import { esc, link, sectionHead, slug } from './html.mjs';
import { icon } from './icons.mjs';

export function skills(x) {
  const bars = x.levels
    .map(
      (s) => `<li class="skill">
  <div class="skill-head"><h3>${esc(s.name)}</h3><span class="skill-pct">${s.pct}%</span></div>
  <div class="bar" aria-hidden="true"><span style="--pct:${s.pct}%"></span></div>
  <p>${esc(s.text)}</p>
</li>`,
    )
    .join('');
  const areas = x.areas
    .map((a) => `<li class="card area"><h4>${esc(a.name)}</h4><p>${esc(a.text)}</p></li>`)
    .join('');
  return `<section id="skills" class="section" aria-labelledby="skills-title">
  <div class="wrap">
    ${sectionHead(x, 'skills')}
    <div class="skills-grid">
      <ul class="card skill-list" role="list">${bars}</ul>
      <div><h3 class="sub">${esc(x.areasTitle)}</h3><ul class="grid grid-2" role="list">${areas}</ul></div>
    </div>
  </div>
</section>`;
}

function projectLinks(p) {
  const out = [];
  if (p.link) {
    const label = p.link.startsWith('mailto:') ? 'Enquire' : 'Visit site';
    out.push(link(p.link, `${label}${icon('external', 'icon icon-inline')}`, { cls: 'btn btn-small', label: `${label}: ${p.title}` }));
  }
  if (p.github) out.push(link(p.github, `${icon('github', 'icon icon-inline')}Source`, { cls: 'btn btn-small btn-ghost', label: `Source code: ${p.title}` }));
  return out.length ? `<div class="project-links">${out.join('')}</div>` : '';
}

function project(p) {
  const tags = p.technologies.map((t) => `<li>${esc(t)}</li>`).join('');
  const highlights = p.highlights.map((h) => `<li>${icon('check', 'icon icon-inline')}${esc(h)}</li>`).join('');
  return `<li class="card project" data-category="${esc(p.category)}">
  <div class="project-head">${icon(p.icon, 'icon icon-badge')}<div><h3 id="p-${slug(p.title)}">${esc(p.title)}</h3><p class="meta">${esc(p.category)}</p></div></div>
  <p>${esc(p.description)}</p>
  <ul class="tags" aria-label="Technologies">${tags}</ul>
  <details><summary>Highlights</summary><ul class="highlights">${highlights}</ul></details>
  ${projectLinks(p)}
</li>`;
}

export function projects(x) {
  const filters = x.filters
    .map((f, i) => `<button type="button" class="chip" data-match="${esc(f.match)}" aria-pressed="${i === 0}">${esc(f.name)}</button>`)
    .join('');
  return `<section id="projects" class="section" aria-labelledby="projects-title">
  <div class="wrap">
    ${sectionHead(x, 'projects')}
    <div class="filters" role="group" aria-label="Filter projects" hidden>${filters}</div>
    <ul class="grid grid-2 projects" role="list">${x.items.map(project).join('')}</ul>
    <p class="center">${link(x.sourceLink.href, `${icon('github', 'icon icon-inline')}${esc(x.sourceLink.label)}`, { cls: 'btn btn-ghost' })}</p>
  </div>
</section>`;
}

export function contact(x) {
  const channels = x.channels
    .map((c) => `<li>${link(c.href, `${icon(c.icon, 'icon icon-badge')}<span><strong>${esc(c.label)}</strong><span>${esc(c.value)}</span></span>`, { cls: 'channel' })}</li>`)
    .join('');
  const inquiries = x.inquiries.map((q) => `<li>${icon('check', 'icon icon-inline')}${esc(q)}</li>`).join('');
  return `<section id="contact" class="section" aria-labelledby="contact-title">
  <div class="wrap">
    ${sectionHead(x, 'contact')}
    <div class="grid grid-2">
      <div class="card"><h3 class="sub">${esc(x.channelsTitle)}</h3><ul class="channels" role="list">${channels}</ul></div>
      <div class="card"><h3 class="sub">${esc(x.inquiriesTitle)}</h3><ul class="checks" role="list">${inquiries}</ul></div>
    </div>
  </div>
</section>`;
}

export function footer(person, links, year) {
  const social = links.map((l) => `<li>${link(l.href, icon(l.icon), { cls: 'social', label: l.label })}</li>`).join('');
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div><p class="footer-name">${esc(person.fullName)}</p><p>${esc(person.footerTagline)}</p></div>
    <ul class="socials" aria-label="Profiles">${social}</ul>
    <p class="copyright">&copy; ${year} ${esc(person.fullName)}. All rights reserved.</p>
  </div>
</footer>`;
}
