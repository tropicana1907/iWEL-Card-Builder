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
  cx?: number // centre of the apartment, % — badges of apartments on sale sit here (dense plans)
  cy?: number
}

export interface SideInfo {
  label: string
  sea?: boolean
  blank?: boolean // blind end wall — no windows on this side (label, if any, is orientation only)
}

export interface FloorPlan {
  floors?: [number, number] // floors this plan covers (inclusive); omitted = every floor
  floorList?: number[] // or an explicit list (odd / even floors)
  soldOverlay?: boolean // dense plans grey out the drawn labels of sold apartments; off when labels don't match positions
  floorLabel?: string // chip text, e.g. «3 этаж · с террасами»
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
  // The drawn number circles were removed from the image; compact badges sit in their place
  badge: { w: 6.6, h: 8.6 },
  positions: [
    { pos: 1, x: 31.2, y: 81.5, sides: ['bottom'] },
    { pos: 2, x: 15.4, y: 87.5, sides: ['bottom', 'left'] },
    { pos: 3, x: 13.7, y: 33.6, sides: ['top', 'left'] },
    { pos: 4, x: 32.5, y: 21.4, sides: ['top'] },
    { pos: 5, x: 44.6, y: 18.7, sides: ['top'], w: 6.2 },
    { pos: 6, x: 53.6, y: 18.7, sides: ['top'], w: 6.2 },
    { pos: 7, x: 68.5, y: 21.4, sides: ['top'] },
    { pos: 8, x: 84.8, y: 33.6, sides: ['top', 'right'] },
    { pos: 9, x: 83.2, y: 87.5, sides: ['bottom', 'right'] },
    { pos: 10, x: 67.8, y: 81.5, sides: ['bottom'] },
  ],
  sides: {
    '2': {
      // Windows only on the two long facades; both end walls are blind (sales lead, 09.10.2026).
      // End-wall labels stay as orientation only — they give no window view.
      top: { label: 'Море', sea: true },
      right: { label: 'ул. Кобякина', blank: true },
      bottom: { label: 'Линейная ул. · вход' },
      left: { label: 'Духовный центр', blank: true },
    },
    '1': {
      top: { label: 'Духовный центр · корпус C' },
      // Buildings 1 and 3 stand side-on to the sea: a blind wall, left unlabelled (sales lead, 09.10.2026)
      right: { label: '', blank: true },
      bottom: { label: 'Двор, к корпусу 2 · вход' },
      left: { label: 'Линейная ул.', blank: true },
    },
    '3': {
      top: { label: 'ул. Кобякина · боковой вид на море и горы (зависит от этажа)' },
      right: { label: 'Линейная ул.', blank: true },
      bottom: { label: 'Духовный центр · внутренний двор · вход' },
      left: { label: '', blank: true },
    },
  },
}

// AZUR Prime: 25 номеров на этаже, «Номер N» на плане = позиция N в шахматке. Море — сверху плана.
const AZUR_PRIME_SIDES: Record<string, Record<PlanSide, SideInfo>> = {
  '1': {
    top: { label: 'Море', sea: true },
    right: { label: '', blank: true },
    bottom: { label: '', blank: true },
    left: { label: '', blank: true },
  },
}
const AZUR_PRIME_F3: FloorPlan = {
  floors: [3, 3],
  floorLabel: '3 этаж · с террасами',
  image: `${BASE}/templates/floorplans-floor/azur-prime-f3.webp`,
  aspect: 1536 / 1024,
  perFloor: 25,
  badge: { w: 4.9, h: 5.9 },
  positions: [
    { pos: 1, x: 9.1, y: 43.5, cx: 9.1, cy: 40.5, sides: ['left'] },
    { pos: 2, x: 9.6, y: 30.2, cx: 9.6, cy: 30.8, sides: ['top'] },
    { pos: 3, x: 21.7, y: 30.2, cx: 21.7, cy: 30.8, sides: ['top'] },
    { pos: 4, x: 30.9, y: 30.2, cx: 30.9, cy: 30.8, sides: ['top'] },
    { pos: 5, x: 37.5, y: 30.2, cx: 37.5, cy: 30.8, sides: ['top'] },
    { pos: 6, x: 45.6, y: 30.2, cx: 45.6, cy: 30.8, sides: ['top'] },
    { pos: 7, x: 54.6, y: 30.2, cx: 54.6, cy: 30.8, sides: ['top'] },
    { pos: 8, x: 63.7, y: 30.2, cx: 63.7, cy: 30.8, sides: ['top'] },
    { pos: 9, x: 70.3, y: 30.2, cx: 70.3, cy: 30.8, sides: ['top'] },
    { pos: 10, x: 77.5, y: 30.2, cx: 77.5, cy: 30.8, sides: ['top'] },
    { pos: 11, x: 90.2, y: 30.2, cx: 90.2, cy: 30.8, sides: ['top'] },
    { pos: 12, x: 90.8, y: 43.5, cx: 90.8, cy: 40.5, sides: ['right'] },
    { pos: 13, x: 93.4, y: 51.3, cx: 93.4, cy: 51.3, sides: ['right'] },
    { pos: 14, x: 90.7, y: 61.0, cx: 90.7, cy: 66.0, sides: ['right'] },
    { pos: 15, x: 83.5, y: 85.2, cx: 83.5, cy: 82.0, sides: ['bottom'] },
    { pos: 16, x: 76.8, y: 85.2, cx: 76.8, cy: 77.0, sides: ['bottom'] },
    { pos: 17, x: 69.7, y: 85.2, cx: 69.7, cy: 77.0, sides: ['bottom'] },
    { pos: 18, x: 61.8, y: 85.2, cx: 61.8, cy: 77.0, sides: ['bottom'] },
    { pos: 19, x: 55.5, y: 85.2, cx: 55.5, cy: 77.0, sides: ['bottom'] },
    { pos: 20, x: 43.9, y: 85.2, cx: 43.9, cy: 77.0, sides: ['bottom'] },
    { pos: 21, x: 37.8, y: 85.2, cx: 37.8, cy: 77.0, sides: ['bottom'] },
    { pos: 22, x: 29.6, y: 85.2, cx: 29.6, cy: 77.0, sides: ['bottom'] },
    { pos: 23, x: 23.4, y: 85.2, cx: 23.4, cy: 77.0, sides: ['bottom'] },
    { pos: 24, x: 16.6, y: 85.2, cx: 16.6, cy: 82.0, sides: ['bottom'] },
    { pos: 25, x: 9.1, y: 60.5, cx: 9.1, cy: 66.0, sides: ['left'] },
  ],
  sides: AZUR_PRIME_SIDES,
}
const AZUR_PRIME_F4_7: FloorPlan = {
  floors: [4, 7],
  floorLabel: '4–7 этажи',
  image: `${BASE}/templates/floorplans-floor/azur-prime-f4-7.webp`,
  aspect: 1618 / 972,
  perFloor: 25,
  badge: { w: 4.6, h: 5.6 },
  positions: [
    { pos: 1, x: 9.4, y: 40.6, cx: 9.4, cy: 37.5, sides: ['left'] },
    { pos: 2, x: 9.4, y: 26.0, cx: 9.4, cy: 26.5, sides: ['top'] },
    { pos: 3, x: 21.3, y: 26.0, cx: 21.3, cy: 26.5, sides: ['top'] },
    { pos: 4, x: 29.9, y: 26.0, cx: 29.9, cy: 26.5, sides: ['top'] },
    { pos: 5, x: 35.2, y: 26.0, cx: 35.2, cy: 26.5, sides: ['top'] },
    { pos: 6, x: 44.4, y: 26.0, cx: 44.4, cy: 26.5, sides: ['top'] },
    { pos: 7, x: 53.3, y: 26.0, cx: 53.3, cy: 26.5, sides: ['top'] },
    { pos: 8, x: 62.5, y: 26.0, cx: 62.5, cy: 26.5, sides: ['top'] },
    { pos: 9, x: 67.9, y: 26.0, cx: 67.9, cy: 26.5, sides: ['top'] },
    { pos: 10, x: 76.5, y: 26.0, cx: 76.5, cy: 26.5, sides: ['top'] },
    { pos: 11, x: 89.5, y: 26.0, cx: 89.5, cy: 26.5, sides: ['top'] },
    { pos: 12, x: 89.4, y: 40.8, cx: 89.4, cy: 37.5, sides: ['right'] },
    { pos: 13, x: 92.3, y: 49.3, cx: 92.3, cy: 49.5, sides: ['right'] },
    { pos: 14, x: 89.2, y: 59.9, cx: 89.2, cy: 64.0, sides: ['right'] },
    { pos: 15, x: 81.9, y: 87.6, cx: 81.9, cy: 83.0, sides: ['bottom'] },
    { pos: 16, x: 75.0, y: 87.6, cx: 75.0, cy: 78.0, sides: ['bottom'] },
    { pos: 17, x: 69.3, y: 87.6, cx: 69.3, cy: 78.0, sides: ['bottom'] },
    { pos: 18, x: 60.8, y: 87.6, cx: 60.8, cy: 78.0, sides: ['bottom'] },
    { pos: 19, x: 54.8, y: 87.6, cx: 54.8, cy: 78.0, sides: ['bottom'] },
    { pos: 20, x: 42.5, y: 87.6, cx: 42.5, cy: 78.0, sides: ['bottom'] },
    { pos: 21, x: 36.7, y: 87.6, cx: 36.7, cy: 78.0, sides: ['bottom'] },
    { pos: 22, x: 28.4, y: 87.6, cx: 28.4, cy: 78.0, sides: ['bottom'] },
    { pos: 23, x: 22.9, y: 87.6, cx: 22.9, cy: 78.0, sides: ['bottom'] },
    { pos: 24, x: 16.0, y: 87.6, cx: 16.0, cy: 83.0, sides: ['bottom'] },
    { pos: 25, x: 9.3, y: 59.9, cx: 9.3, cy: 64.0, sides: ['left'] },
  ],
  sides: AZUR_PRIME_SIDES,
}

// AZUR Residence (21.10.2026, планы Катерины): 2-й этаж — 16 апартаментов как в шахматке; 3–12 — по проекту АР
// (12 номеров, части больших номеров продаются отдельно — их таблички стоят в своей половине). Море — сверху плана.
const AZUR_RESIDENCE_SIDES: Record<string, Record<PlanSide, SideInfo>> = {
  '1': {
    top: { label: 'Море', sea: true },
    right: { label: '', blank: true },
    bottom: { label: '', blank: true },
    left: { label: '', blank: true },
  },
}
const AZUR_RESIDENCE_F2: FloorPlan = {
  floors: [2, 2],
  floorLabel: '2 этаж',
  image: `${BASE}/templates/floorplans-floor/azur-residence-f2.webp`,
  aspect: 2000 / 1197,
  perFloor: 16,
  badge: { w: 6.4, h: 6.4 },
  positions: [
    { pos: 1, x: 31.4, y: 76.5, cx: 31.4, cy: 76.5, sides: ['bottom'] },
    { pos: 2, x: 22.0, y: 83.4, cx: 22.0, cy: 83.4, sides: ['bottom'] },
    { pos: 3, x: 12.7, y: 76.0, cx: 12.7, cy: 76.0, sides: ['bottom'] },
    { pos: 4, x: 10.0, y: 22.6, cx: 10.0, cy: 22.6, sides: ['top'] },
    { pos: 5, x: 22.0, y: 22.6, cx: 22.0, cy: 22.6, sides: ['top'] },
    { pos: 6, x: 31.4, y: 22.6, cx: 31.4, cy: 22.6, sides: ['top'] },
    { pos: 7, x: 40.8, y: 22.6, cx: 40.8, cy: 22.6, sides: ['top'] },
    { pos: 8, x: 49.9, y: 22.6, cx: 49.9, cy: 22.6, sides: ['top'] },
    { pos: 9, x: 59.2, y: 22.6, cx: 59.2, cy: 22.6, sides: ['top'] },
    { pos: 10, x: 68.8, y: 22.6, cx: 68.8, cy: 22.6, sides: ['top'] },
    { pos: 11, x: 78.1, y: 22.6, cx: 78.1, cy: 22.6, sides: ['top'] },
    { pos: 12, x: 90.0, y: 22.6, cx: 90.0, cy: 22.6, sides: ['top'] },
    { pos: 13, x: 87.4, y: 76.0, cx: 87.4, cy: 76.0, sides: ['bottom'] },
    { pos: 14, x: 78.1, y: 83.4, cx: 78.1, cy: 83.4, sides: ['bottom'] },
    { pos: 15, x: 68.8, y: 76.5, cx: 68.8, cy: 76.5, sides: ['bottom'] },
    { pos: 16, x: 59.2, y: 76.5, cx: 59.2, cy: 76.5, sides: ['bottom'] },
  ],
  sides: AZUR_RESIDENCE_SIDES,
}
const AZUR_RESIDENCE_ODD: FloorPlan = {
  floorList: [3, 5, 7, 9, 11],
  floorLabel: '3, 5, 7, 9, 11 этажи',
  image: `${BASE}/templates/floorplans-floor/azur-residence-odd.webp`,
  aspect: 2000 / 1211,
  perFloor: 16,
  soldOverlay: false,
  badge: { w: 6.4, h: 6.4 },
  positions: [
    { pos: 1, x: 31.8, y: 75.3, cx: 31.8, cy: 75.3, sides: ['bottom'] },
    { pos: 2, x: 22.0, y: 79.3, cx: 22.0, cy: 79.3, sides: ['bottom'] },
    { pos: 3, x: 10.8, y: 75.1, cx: 10.8, cy: 75.1, sides: ['bottom'] },
    { pos: 4, x: 10.7, y: 23.0, cx: 10.7, cy: 23.0, sides: ['top'] },
    { pos: 5, x: 22.4, y: 23.0, cx: 22.4, cy: 23.0, sides: ['top'] },
    { pos: 6, x: 31.8, y: 23.0, cx: 31.8, cy: 23.0, sides: ['top'] },
    { pos: 7, x: 41.0, y: 27.3, cx: 41.0, cy: 27.3, sides: ['top'] },
    { pos: 8, x: 49.8, y: 27.3, cx: 49.8, cy: 27.3, sides: ['top'] },
    { pos: 9, x: 59.1, y: 23.0, cx: 59.1, cy: 23.0, sides: ['top'] },
    { pos: 10, x: 68.5, y: 23.0, cx: 68.5, cy: 23.0, sides: ['top'] },
    { pos: 11, x: 77.7, y: 23.0, cx: 77.7, cy: 23.0, sides: ['top'] },
    { pos: 12, x: 89.3, y: 23.0, cx: 89.3, cy: 23.0, sides: ['top'] },
    { pos: 13, x: 89.2, y: 75.1, cx: 89.2, cy: 75.1, sides: ['bottom'] },
    { pos: 14, x: 78.0, y: 79.3, cx: 78.0, cy: 79.3, sides: ['bottom'] },
    { pos: 15, x: 67.0, y: 77.0, cx: 67.0, cy: 77.0, sides: ['bottom'] },
    { pos: 16, x: 58.2, y: 79.3, cx: 58.2, cy: 79.3, sides: ['bottom'] },
  ],
  sides: AZUR_RESIDENCE_SIDES,
}
const AZUR_RESIDENCE_EVEN: FloorPlan = { ...AZUR_RESIDENCE_ODD, floorList: [4, 6, 8, 10, 12], floorLabel: '4, 6, 8, 10, 12 этажи',
  image: `${BASE}/templates/floorplans-floor/azur-residence-even.webp` }

const PLANS: Record<string, Record<string, FloorPlan | FloorPlan[]>> = {
  towers: { '1': TOWERS_123, '2': TOWERS_123, '3': TOWERS_123 },
  'azur-prime': { '1': [AZUR_PRIME_F3, AZUR_PRIME_F4_7] },
  'azur-residence': { '1': [AZUR_RESIDENCE_F2, AZUR_RESIDENCE_ODD, AZUR_RESIDENCE_EVEN] },
}

/** All plans of a building (one per floor range). */
export function floorPlansFor(project: string, block: string): FloorPlan[] {
  const p = PLANS[project]?.[block]
  return !p ? [] : Array.isArray(p) ? p : [p]
}

/** The plan for a floor of a building; without a floor — its first plan. */
export function floorPlanFor(project: string, block: string, floor?: number | null): FloorPlan | null {
  const all = floorPlansFor(project, block)
  if (floor == null) return all[0] ?? null
  return all.find(p => p.floorList ? p.floorList.includes(floor)
    : !p.floors || (floor >= p.floors[0] && floor <= p.floors[1])) ?? null
}

/** Position of an apartment on the plan: the chessboard column when known (AZUR Residence numbers like «14/1»
 *  break the arithmetic), otherwise (apt − 1) % perFloor + 1. */
export function planPosition(plan: FloorPlan, apt: string, knownPos?: number): PlanPosition | null {
  const n = parseInt(apt, 10)
  if (!n && !knownPos) return null
  const pos = knownPos ?? ((n - 1) % plan.perFloor) + 1
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
