// Shared geometry for view-direction rays on the site plan.
// Used by both the SitePlanEditor preview and the exported card,
// so what the manager sees in the editor is exactly what renders on the card.

import type { CompassOrientation } from '@/types'
import { DIRECTION_ANGLES } from '@/config/constants'

export function buildSectorPath(
  cx: number, cy: number,
  angleDeg: number, halfAngleDeg: number,
  length: number
): string {
  const a1 = ((angleDeg - halfAngleDeg) * Math.PI) / 180
  const a2 = ((angleDeg + halfAngleDeg) * Math.PI) / 180
  const x1 = cx + length * Math.cos(a1)
  const y1 = cy + length * Math.sin(a1)
  const x2 = cx + length * Math.cos(a2)
  const y2 = cy + length * Math.sin(a2)
  const large = halfAngleDeg * 2 > 180 ? 1 : 0
  return `M${cx},${cy} L${x1},${y1} A${length},${length} 0 ${large},1 ${x2},${y2} Z`
}

export const DEFAULT_COMPASS: CompassOrientation = {
  northAngle: DIRECTION_ANGLES.NORTH,
  eastAngle: DIRECTION_ANGLES.EAST,
  southAngle: DIRECTION_ANGLES.SOUTH,
  westAngle: DIRECTION_ANGLES.WEST,
}

export interface DirectionRay {
  key: 'west' | 'north' | 'east' | 'south'
  angle: number
  active: boolean
}

export function directionRays(
  compass: CompassOrientation | null | undefined,
  views: { west: boolean; north: boolean; east: boolean; south: boolean }
): DirectionRay[] {
  const c = compass ?? DEFAULT_COMPASS
  return [
    { key: 'west', angle: c.westAngle, active: views.west },
    { key: 'north', angle: c.northAngle, active: views.north },
    { key: 'east', angle: c.eastAngle, active: views.east },
    { key: 'south', angle: c.southAngle, active: views.south },
  ]
}

// Site plan canvas on the card is 1080×400 (aspect 2.7:1). The editor MUST
// use the same aspect ratio: anchor coordinates are stored as percentages of
// the container, and object-fit: contain letterboxes an image identically
// only when both containers share the aspect ratio. (v1 used 800×320 = 2.5:1
// in the editor — the marked point drifted on the exported card.)
export const SITEPLAN_ASPECT = 1080 / 400
