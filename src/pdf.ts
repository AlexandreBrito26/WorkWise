import * as pdfjs from 'pdfjs-dist'
import { MAX_CHARS, MAX_PAGES, PdfError } from './pdfErrors'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl


/** Lê o PDF no próprio navegador e devolve só o texto; o arquivo não é guardado nem enviado a lugar nenhum. */
export async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  // Confere o conteúdo real, não só a extensão: todo PDF começa com "%PDF-".
  if (bytes.length < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== '%PDF-') throw new PdfError('not-pdf')

  let doc: pdfjs.PDFDocumentProxy
  try {
    doc = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise
  } catch {
    throw new PdfError('invalid-or-protected')
  }

  try {
    if (doc.numPages > MAX_PAGES) throw new PdfError('too-many-pages')
    const parts: string[] = []
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p)
      const content = await page.getTextContent()
      let line = ''
      for (const item of content.items) {
        if (!('str' in item)) continue
        line += item.str
        line += item.hasEOL ? '\n' : ' '
      }
      parts.push(line)
    }
    const text = parts.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
    if (!text) throw new PdfError('no-text')
    return text.slice(0, MAX_CHARS)
  } finally {
    void doc.destroy()
  }
}
