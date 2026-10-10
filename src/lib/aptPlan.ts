import { FLOORPLAN_TEMPLATES, templateBlocks, type AssetTemplate } from '@/config/templateAssets'

interface AptRef {
  apt?: string
  block: string
  floor: number
  area: number
  pos?: number
}

const floorRange = (t: AssetTemplate) => {
  const m = t.label.match(/(\d+)(?:–(\d+))? этаж/)
  return m ? [Number(m[1]), Number(m[2] ?? m[1])] : null
}

/** Floorplan template of the same block whose label carries this area (floor range and position preferred). */
export function findAptPlan(project: string, apt: AptRef, fallbackBlock?: number): AssetTemplate | undefined {
  const block = parseInt(apt.block, 10) || fallbackBlock
  if (!block) return undefined
  const areaLabel = apt.area.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inBlock = FLOORPLAN_TEMPLATES.filter(t => t.project === project && templateBlocks(t).includes(block))
  let candidates = inBlock.filter(t => t.label.includes(areaLabel + ' м²'))
  // The chessboard rounds some areas (26,8 vs the plan's 26,82) — accept a difference of up to 0,1 м²
  if (!candidates.length) {
    candidates = inBlock.filter(t => {
      const m = t.label.match(/(\d+,\d+) м²/)
      return !!m && Math.abs(parseFloat(m[1].replace(',', '.')) - apt.area) <= 0.1
    })
  }
  const onFloor = candidates.filter(t => {
    const r = floorRange(t)
    return !!r && apt.floor >= r[0] && apt.floor <= r[1]
  })
  // Imperial typical floors (blocks 2, 3, 5) have 10 apartments: position = (apt − 1) % 10 + 1 picks the right mirror image
  const n = parseInt(apt.apt ?? '', 10)
  const pos = apt.pos ?? (project === 'imperial' && block !== 4 && n && !String(apt.apt).includes('/') ? ((n - 1) % 10) + 1 : undefined)
  const byPos = pos ? onFloor.find(t => t.label.includes(`№${pos} ·`)) : undefined
  return byPos ?? onFloor[0] ?? candidates[0]
}
