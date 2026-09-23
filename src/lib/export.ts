import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import { CARD_WIDTH, CARD_HEIGHT } from '@/config/card'

export async function exportToPNG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(el, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
  })
  download(dataUrl, `${filename}.png`)
}

export async function exportToJPG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toJpeg(el, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio: 1,
    skipAutoScale: true,
    quality: 0.95,
    style: { transform: 'none' },
  })
  download(dataUrl, `${filename}.jpg`)
}

export async function exportToPDF(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(el, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
  })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [CARD_WIDTH, CARD_HEIGHT] })
  pdf.addImage(dataUrl, 'PNG', 0, 0, CARD_WIDTH, CARD_HEIGHT)

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (isMobile) {
    // Safari / Chrome mobile: blob URL opens in system PDF viewer
    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    a.download = `${filename}.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } else {
    pdf.save(`${filename}.pdf`)
  }
}

export async function exportToClipboard(el: HTMLElement, filename: string): Promise<'copied' | 'fallback'> {
  const dataUrl = await toPng(el, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
