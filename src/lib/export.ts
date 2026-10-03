import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import { CARD_WIDTH, CARD_HEIGHT } from '@/config/card'

type RenderOptions = Parameters<typeof toPng>[1]

// html-to-image inlines <img> sources into an SVG snapshot; on the first run
// (notably Safari / mobile) the images are not embedded yet and come out blank —
// the floorplan was missing on the first PNG and present on the second.
// Fix: wait until every image in the card is decoded, then do a throw-away
// warm-up render before the real one.
async function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll('img'))
  await Promise.all(imgs.map(async img => {
    if (!img.complete) {
      await new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
      })
    }
    try { await img.decode() } catch {}
  }))
}

async function renderCard(
  el: HTMLElement,
  render: (el: HTMLElement, opts: RenderOptions) => Promise<string>,
  extra: RenderOptions = {},
): Promise<string> {
  const opts: RenderOptions = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio: 1,
    skipAutoScale: true,
    style: { transform: 'none' },
    ...extra,
  }
  await waitForImages(el)
  await render(el, opts) // warm-up: embeds images so the real render has them
  return render(el, opts)
}

export async function exportToPNG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await renderCard(el, toPng)
  download(dataUrl, `${filename}.png`)
}

export async function exportToJPG(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await renderCard(el, toJpeg, { quality: 0.95 })
  download(dataUrl, `${filename}.jpg`)
}

export async function exportToPDF(el: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await renderCard(el, toPng)
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
  const dataUrl = await renderCard(el, toPng)
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
  const dataUrl = await renderCard(el, toJpeg, { quality: 0.88 })
  download(dataUrl, `${filename}-wa.jpg`)
}

function download(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
