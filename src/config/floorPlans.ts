// Floor plans for the availability tab: where each apartment sits on the floor and
// which way its windows face. Towers buildings 1–3 share one plan (drawn for building 2,
// entrance at the bottom); buildings 1 and 3 are the same plan turned by their entrance
// (genplan arrows: 1 ← entrance on the east, 3 → entrance on the west).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export type PlanSide = 'top' | 'right' | 'bottom' | 'left'

export interface PlanPosition {
  pos: number
  x: number // badge centre, % of the image width
  y: number // badge centre, % of the image height
  sides: PlanSide[] // sides of the drawing the windows face
  w?: number // badge width override, %
}

export interface SideInfo {
  label: string
  sea?: boolean
  blank?: boolean // blind wall — no windows on this side
}

export interface FloorPlan {
  image: string
  aspect: number // width / height
  perFloor: number // apartments per floor — position = (apt − 1) % perFloor + 1
  badge: { w: number; h: number } // badge size, % of the image
  positions: PlanPosition[]
  sides: Record<string, Record<PlanSide, SideInfo>> // by building
}

const TOWERS_123: FloorPlan = {
  image: `${BASE}/templates/floorplans-floor/towers-b123-floor.webp`,
  aspect: 910 / 518,
  perFloor: 10,
  // Badge boxes cover the drawn number circle + area pill (areas come from the chessboard)
  badge: { w: 10.2, h: 12.4 },
  positions: [
    { pos: 1, x: 31.2, y: 81.5, sides: ['bottom'] },
    { pos: 2, x: 15.4, y: 87.5, sides: ['bottom', 'left'] },
    { pos: 3, x: 13.7, y: 33.6, sides: ['top', 'left'] },
    { pos: 4, x: 32.5, y: 21.4, sides: ['top'], w: 12.6 },
    { pos: 5, x: 44.6, y: 18.7, sides: ['top'], w: 8.8 },
    { pos: 6, x: 53.6, y: 18.7, sides: ['top'], w: 8.8 },
    { pos: 7, x: 68.5, y: 21.4, sides: ['top'] },
    { pos: 8, x: 84.8, y: 33.6, sides: ['top', 'right'] },
    { pos: 9, x: 83.2, y: 87.5, sides: ['bottom', 'right'] },
    { pos: 10, x: 67.8, y: 81.5, sides: ['bottom'] },
  ],
  sides: {
    '2': {
      top: { label: 'Море', sea: true },
      right: { label: 'ул. Кобякина' },
      bottom: { label: 'Линейная ул. · вход' },
      left: { label: 'Духовный центр' },
    },
    '1': {
      top: { label: 'Двор, к корпусу C' },
      // Buildings 1 and 3 stand side-on to the sea: that side is a blind wall (sales lead, 09.10.2026)
      right: { label: 'Море · глухая стена, окон нет', blank: true },
      bottom: { label: 'Двор, к корпусу 2 · вход' },
      left: { label: 'Линейная ул.' },
    },
    '3': {
      top: { label: 'ул. Кобякина' },
      right: { label: 'Линейная ул.' },
      bottom: { label: 'Двор, к корпусу 2 · вход' },
      left: { label: 'Море · глухая стена, окон нет', blank: true },
    },
  },
}

const PLANS: Record<string, Record<string, FloorPlan>> = {
  towers: { '1': TOWERS_123, '2': TOWERS_123, '3': TOWERS_123 },
}

export function floorPlanFor(project: string, block: string): FloorPlan | null {
  return PLANS[project]?.[block] ?? null
}

export function planPosition(plan: FloorPlan, apt: string): PlanPosition | null {
  const n = parseInt(apt, 10)
  if (!n) return null
  const pos = ((n - 1) % plan.perFloor) + 1
  return plan.positions.find(p => p.pos === pos) ?? null
}

/** Window directions of an apartment in a building, e.g. ["Море", "ул. Кобякина"]. */
export function aptView(project: string, block: string, apt: string): SideInfo[] {
  const plan = floorPlanFor(project, block)
  const sides = plan?.sides[block]
  const p = plan && planPosition(plan, apt)
  if (!sides || !p) return []
  return p.sides.map(s => sides[s]).filter(s => !s.blank)
}
