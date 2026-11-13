// Escaping and small markup helpers. Every string from content/ passes through esc().

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

export const isExternal = (href) => /^https?:\/\//.test(href);

export function link(href, inner, { cls = '', label = '' } = {}) {
  const attrs = [`href="${esc(href)}"`];
  if (cls) attrs.push(`class="${cls}"`);
  if (label) attrs.push(`aria-label="${esc(label)}"`);
  if (isExternal(href)) attrs.push('target="_blank" rel="noopener"');
  return `<a ${attrs.join(' ')}>${inner}</a>`;
}

export function sectionHead({ eyebrow, title, intro }, id) {
  return `<header class="section-head">
  <p class="eyebrow">${esc(eyebrow)}</p>
  <h2 id="${id}-title">${esc(title)}</h2>
  ${intro ? `<p class="lede">${esc(intro)}</p>` : ''}
</header>`;
}

export const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
