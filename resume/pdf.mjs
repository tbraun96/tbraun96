// Prints HTML to PDF with the Chromium that playwright-core manages, and reads a PDF back through the parse
// check. The I/O the site build and the resume build share.

import { chromium } from 'playwright-core';
import { checkParse } from './check.mjs';
import { pdfText } from './extract.mjs';

export const MAX_PAGES = 2;

export async function printPdf(html) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    return await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: false });
  } finally {
    await browser.close();
  }
}

/** @returns {{pages: number, problems: string[]}} every problem an ATS would hit, plus the page cap. */
export async function checkPdf(pdf, doc) {
  const { text, pages } = await pdfText(pdf);
  const { problems } = checkParse(text, doc);
  if (pages > MAX_PAGES) problems.push(`PDF is ${pages} pages; at most ${MAX_PAGES} allowed`);
  return { pages, problems };
}
