// The single source of every word on thomaspbraun.com and in the GitHub profile README.
// Reconstructed from the site as it was served in 2026 (Wayback capture 2026-08-10, plus the
// 2026-09-02 edits that added Atlas Inference Engine and CertifiedCopy).

export const site = {
  url: 'https://thomaspbraun.com',
  title: 'Portfolio of Thomas Braun',
  description:
    'AI inference innovator and Rust expert. Founder of Atlas Cybernetics and creator of the Atlas Inference Engine, plus The Citadel Protocol and Avarok Cybersecurity.',
  ogImage: '/img/og.jpg',
};

export const person = {
  name: 'Thomas Braun',
  fullName: 'Thomas Phillip Braun',
  footerTagline: 'Founder · AI Inference Innovator · Rust Veteran',
  eyebrow: 'Thomas Braun • Founder, Atlas Cybernetics',
  headline: ['AI Inference Innovator', '& Rust Expert'],
  lede:
    'Founder of Atlas Cybernetics and creator of the Atlas Inference Engine: open-source LLM inference in pure Rust and CUDA, one ~75 MB binary from edge accelerators to expert-parallel clusters, submitted to MLPerf Inference on both NVIDIA and AMD. Also the creator of The Citadel Protocol, a post-quantum peer-to-peer framework, and founder of Avarok Cybersecurity.',
  email: 'thomas@avarok.net',
};

export const links = [
  { label: 'Atlas Inference Engine', href: 'https://atlasinference.io', icon: 'cpu' },
  { label: 'GitHub', href: 'https://github.com/tbraun96', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/tpbraun', icon: 'linkedin' },
  { label: 'CertifiedCopy', href: 'https://certified.sh', icon: 'filecheck' },
  { label: 'Medium Blog', href: 'https://blog.thomaspbraun.com/', icon: 'medium' },
];

export const experience = {
  eyebrow: 'Career Journey',
  title: 'Professional Experience',
  intro:
    'My professional path has moved from cryptography and secure systems to AI inference, with Rust and a consistent theme of innovation running through every role.',
  roles: [
    {
      title: 'Founder',
      org: 'Atlas Cybernetics Corp',
      when: 'Current',
      logo: '/logos/atlas-cybernetics.svg',
      text: 'Leading the Atlas Inference Engine: LLM inference in pure Rust and CUDA with hand-tuned kernels for NVIDIA DGX Spark, the same kernels compiled for AMD Strix Halo, MLPerf Inference v6.1 submissions in the closed edge division on both, and a release gate that ships an image only after every model passes the serve matrix.',
    },
    {
      title: 'Founder & Rust Consultant',
      org: 'Avarok Cybersecurity',
      when: 'Current',
      logo: '/logos/avarok-logo.svg',
      text: 'Leading the development of cutting-edge post-quantum communication protocols. Created The Citadel Protocol, a Rust-based secure communications framework designed to protect against quantum computing threats. Providing expert Rust consulting services for complex systems development.',
    },
    {
      title: 'Software Engineer',
      org: 'Kraken Digital Asset Exchange',
      when: 'Previous',
      logo: '/logos/kraken-logo.svg',
      text: 'Applied cryptographic expertise to build secure financial systems. Contributed to the development of blockchain integration and digital asset custody solutions.',
    },
    {
      title: 'R&D Engineer II',
      org: 'Ansys',
      when: 'Previous',
      logo: '/logos/ansys-logo.svg',
      text: 'Engaged in research and development of simulation technologies. Applied technical expertise to engineering challenges in a high-performance computing environment.',
    },
  ],
  patent: {
    label: 'Patent Achievement',
    title: 'Recursive Cryptography Protocol',
    number: 'USPTO #12224993',
    text: 'Recognized as patent of the month by the largest R&D advisory firm in the US. The patent discloses a post-quantum session-layer protocol that has highly configurable security settings like matrix-based ratcheting, enforced per-packet perfect forward secrecy, multi-layered encryption, and more depending on application needs',
    image: { alt: 'Recursive Cryptography Protocol Algorithm', w: 1346, h: 1114 },
  },
};

export const education = {
  eyebrow: 'Learning Journey',
  title: 'Educational Background',
  intro: 'A diverse educational foundation spanning geospatial sciences, physics, and technical disciplines.',
  entries: [
    {
      degree: 'Bachelor of Science',
      field: 'Geospatial Sciences and Geography',
      school: 'Oregon State University',
      place: 'Corvallis, Oregon',
      logo: '/logos/oregon-state-logo.svg',
      text: 'Specialized in Geographic Information Systems (GIS) and spatial data analysis, providing a foundation for work with location-based systems and mapping technologies.',
    },
    {
      degree: 'Studies in Physics',
      field: 'Physics',
      school: 'California Polytechnic State University',
      place: 'San Luis Obispo, California',
      logo: '/logos/cal-poly-logo.svg',
      text: 'Pursued studies in physics for one year, gaining valuable knowledge in the fundamental principles of matter and energy that would later inform cybersecurity and cryptography work.',
    },
    {
      degree: 'Honors Diploma',
      field: 'General Studies',
      school: 'DHS',
      place: '',
      logo: '/img/graduation.webp',
      text: 'Received an Honors Diploma, demonstrating academic excellence and a foundation for future educational pursuits.',
    },
  ],
  early: {
    title: 'Early Programming Experience',
    text: "Thomas's journey in programming began in elementary school with HTML, followed by Java in middle school. This early start laid the foundation for his expertise in software development and cryptographic systems.",
  },
};

export const skills = {
  eyebrow: 'Expertise',
  title: 'Technical Skills',
  intro: 'A technical skillset rooted in Rust, spanning AI inference, computer security, cryptography and specialized domains.',
  levels: [
    { name: 'Rust Programming', pct: 98, text: 'Expert-level proficiency in Rust for systems programming, with extensive experience in memory safety, performance optimization, and professional consulting.' },
    { name: 'Cryptography', pct: 90, text: 'Deep understanding of cryptographic algorithms, protocols, and their implementations.' },
    { name: 'Networking', pct: 85, text: 'Extensive knowledge of network protocols, architecture, and secure communication systems.' },
    { name: 'Java', pct: 80, text: 'Proficient in Java development with experience dating back to middle school.' },
    { name: 'Geographic Information Systems', pct: 75, text: 'Specialized knowledge in geospatial data analysis and geographic information systems.' },
    { name: 'Neural Networks', pct: 70, text: 'Experience in designing and implementing artificial neural networks and deep learning systems.' },
  ],
  areasTitle: 'Areas of Specialization',
  areas: [
    { name: 'LLM Inference Engineering', text: 'Inference engines in pure Rust and CUDA: NVFP4 and FP8 quantization, MTP speculative decoding, and expert parallelism across nodes.' },
    { name: 'GPU Kernel Optimization', text: 'Hand-tuned CUDA kernels for NVIDIA Grace Blackwell (GB10), compiled unchanged for AMD RDNA 3.5 with SCALE.' },
    { name: 'Rust Consultancy', text: 'Professional consulting services for Rust-based systems, focusing on performance, safety, and scalability.' },
    { name: 'Post-Quantum Communication', text: 'Development of communication protocols secure against quantum computing threats.' },
    { name: 'Cryptographic Protocol Design', text: 'Invention and implementation of novel cryptographic protocols for secure systems.' },
    { name: 'Computer & Network Security', text: 'Comprehensive approaches to securing computer systems and network infrastructure.' },
  ],
};

export { projects } from './projects.mjs';
export { contact } from './contact.mjs';
