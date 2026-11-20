// Reads the text back out of the generated files the way a parser would: pdfjs for the PDF, the raw
// word/document.xml for the DOCX. I/O only at the edges; the XML-to-text step is pure and exported.

import JSZip from 'jszip';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** word/document.xml → one line per paragraph, tabs as spaces, entities decoded. Pure. */
export function docxXmlToText(xml) {
  return xml
    .replace(/<w:tab\/>/g, ' ')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENTITIES[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

export async function docxText(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file('word/document.xml');
  if (!file) throw new Error('DOCX has no word/document.xml');
  return docxXmlToText(await file.async('string'));
}

/** @returns {{text: string, pages: number}} */
export async function pdfText(buffer) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdf = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, disableFontFace: true }).promise;
  const lines = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const content = await (await pdf.getPage(i)).getTextContent();
    let line = '';
    for (const item of content.items) {
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = '';
      }
    }
    if (line) lines.push(line);
  }
  return { text: lines.join('\n'), pages: pdf.numPages };
}
