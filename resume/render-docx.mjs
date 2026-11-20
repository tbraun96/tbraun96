// The resume model as a DOCX, drawn with the `docx` package. Pure: returns a Document; the caller packs it.
// Same ATS rules as the HTML: single column, Arial, standard headings, right-aligned dates by tab stop (not
// a table), native bullets, nothing in the page header or footer.

import { AlignmentType, BorderStyle, Document, LevelFormat, Paragraph, TabStopType, TextRun } from 'docx';

const FONT = 'Arial';
const PT = (points) => points * 2; // docx sizes are half-points
const TWIP = { pageW: 12240, pageH: 15840, margin: 720 }; // Letter, 0.5in margins
const RIGHT_TAB = TWIP.pageW - 2 * TWIP.margin;

const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: PT(10), ...opts });

function heading(text) {
  return new Paragraph({
    spacing: { before: PT(5.5), after: PT(1.5) },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333', space: 1 } },
    children: [run(text.toUpperCase(), { bold: true, size: PT(10.6) })],
  });
}

function titleLine(left, right) {
  const children = [run(left, { bold: true })];
  if (right) children.push(run(`\t${right}`));
  return new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }], spacing: { before: PT(2) }, keepNext: true, children });
}

function entry(b) {
  const out = [titleLine(b.title, b.dates)];
  const sub = [b.org, b.meta].filter(Boolean).join(' | ');
  if (sub) out.push(new Paragraph({ keepNext: b.bullets.length > 0, children: [run(sub, { italics: true })] }));
  for (const text of b.bullets) {
    out.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: PT(0.5) }, children: [run(text)] }));
  }
  return out;
}

function block(b) {
  if (b.type === 'p') return [new Paragraph({ children: [run(b.text)] })];
  if (b.type === 'kv') return [new Paragraph({ spacing: { after: PT(1.5) }, children: [run(`${b.label}: `, { bold: true }), run(b.text)] })];
  return entry(b);
}

export function resumeDocx(doc) {
  const children = [
    new Paragraph({ alignment: AlignmentType.LEFT, children: [run(doc.name, { bold: true, size: PT(19) })] }),
    new Paragraph({ children: [run(doc.title, { bold: true, size: PT(11) })] }),
    new Paragraph({ spacing: { after: PT(2) }, children: [run(doc.contact.join(' | '), { size: PT(9.6) })] }),
  ];
  for (const s of doc.sections) {
    children.push(heading(s.heading));
    for (const b of s.blocks) children.push(...block(b));
  }
  return new Document({
    creator: doc.name,
    title: `${doc.name} - Resume`,
    styles: { default: { document: { run: { font: FONT, size: PT(10) } } } },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 280, hanging: 200 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: TWIP.pageW, height: TWIP.pageH }, margin: { top: TWIP.margin, right: TWIP.margin, bottom: TWIP.margin, left: TWIP.margin } } },
        children,
      },
    ],
  });
}
