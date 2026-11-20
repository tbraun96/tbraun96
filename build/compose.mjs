// Joins the site's copy (content/profile.mjs) with the career data (content/career.json) into the one object
// the page, README and structured data render from. Pure.

import { reverseChronological } from './dates.mjs';

export function compose(copy, career) {
  const { person } = career;
  return {
    site: copy.site,
    person: {
      name: person.name,
      fullName: person.fullName,
      email: person.email,
      headline: copy.hero.headline,
      eyebrow: copy.hero.eyebrow,
      lede: copy.hero.lede,
      footerTagline: copy.hero.footerTagline,
    },
    links: person.profiles.map(({ label, url, icon }) => ({ label, href: url, icon })),
    identityLinks: person.profiles.filter((p) => p.kind === 'identity').map((p) => p.url),
    experience: { ...copy.sections.experience, roles: reverseChronological(career.experience), patent: career.patent },
    education: { ...copy.sections.education, entries: career.education },
    skills: { ...copy.sections.skills, groups: career.skills.groups, areas: career.skills.areas },
    projects: { ...copy.sections.projects, items: career.projects },
    contact: copy.contact,
  };
}
