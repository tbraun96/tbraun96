// The site's own words: hero, section headings and intros. Every fact about roles, projects, education and
// skills lives in content/career.json (validated by career.schema.json) and reaches the page through
// build/compose.mjs, so the site, the README and the resume cannot disagree.

export const site = {
  url: 'https://thomaspbraun.com',
  title: 'Portfolio of Thomas Braun',
  description:
    'AI inference innovator and Rust expert. Founder of Atlas Cybernetics and creator of the Atlas Inference Engine, plus The Citadel Protocol and Avarok Cybersecurity.',
  ogImage: '/img/og.jpg',
};

export const hero = {
  footerTagline: 'Founder · AI Inference Innovator · Rust Veteran',
  eyebrow: 'Thomas Braun • Founder, Atlas Cybernetics',
  headline: ['AI Inference Innovator', '& Rust Expert'],
  lede:
    'Founder of Atlas Cybernetics and creator of the Atlas Inference Engine: open-source LLM inference in pure Rust and CUDA, one ~75 MB binary from edge accelerators to expert-parallel clusters, submitted to MLPerf Inference on both NVIDIA and AMD. Also the creator of The Citadel Protocol, a post-quantum peer-to-peer framework, and founder of Avarok Cybersecurity.',
};

export const sections = {
  experience: {
    eyebrow: 'Career Journey',
    title: 'Professional Experience',
    intro:
      'From cryptographic protocols and secure distributed systems to LLM inference engines, with Rust running through every role since 2018.',
    patentLabel: 'Patent',
  },
  education: {
    eyebrow: 'Learning Journey',
    title: 'Educational Background',
    intro: 'A foundation in geospatial sciences and physics, and programming since elementary school.',
    early: {
      title: 'Early Programming Experience',
      text: 'Programming began in elementary school with HTML, followed by Java in middle school: the start of a career in systems software and cryptography.',
    },
  },
  skills: {
    eyebrow: 'Expertise',
    title: 'Technical Skills',
    intro: 'A toolkit rooted in Rust and applied across AI inference, cryptography, networking and the web.',
    areasTitle: 'Areas of Specialization',
  },
  projects: {
    eyebrow: 'Portfolio',
    title: 'Products & Open Source',
    intro:
      'A family of inter-related systems: an LLM inference engine, a post-quantum protocol and the workspace built on it, browser-side forensics, a deploy harness and the tools that connect them. All built in Rust for performance, memory safety and results that can be verified.',
    filters: [
      { name: 'All Projects', match: '' },
      { name: 'AI Inference', match: 'AI Inference' },
      { name: 'P2P & Networking', match: 'P2P' },
      { name: 'Web & WebAssembly', match: 'WebAssembly' },
      { name: 'Developer Tools', match: 'Developer Tools' },
    ],
    sourceLink: { label: 'View Rust Source Code on GitHub', href: 'https://github.com/Avarok-Cybersecurity' },
  },
};

export { contact } from './contact.mjs';
