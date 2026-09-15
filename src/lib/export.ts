import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPNG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(el, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
  })
  download(dataUrl, `${filename}.png`)
}

export async function exportToJPG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toJpeg(el, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    skipAutoScale: true,
    quality: 0.95,
    style: { transform: 'none' },
  })
  download(dataUrl, `${filename}.jpg`)
}

export async function exportToPDF(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(el, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
  })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1080, 1920] })
  pdf.addImage(dataUrl, 'PNG', 0, 0, 1080, 1920)
  pdf.save(`${filename}.pdf`)
}

export async function exportToClipboard(el: HTMLElement, filename: string): Promise<'copied' | 'fallback'> {
  const dataUrl = await toPng(el, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
  })
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return 'copied'
  } catch {
    download(dataUrl, `${filename}.png`)
    return 'fallback'
  }
}

export async function exportForWhatsApp(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toJpeg(el, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    skipAutoScale: true,
    quality: 0.88,
    style: { transform: 'none' },
  })
  download(dataUrl, `${filename}-wa.jpg`)
}

function download(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
