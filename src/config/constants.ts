export const APARTMENT_TYPES = [
  'Студия',
  'Евро-2',
  '2-комнатная',
  'Евро-3',
  '3-комнатная',
  'другое',
] as const

export const TYPE_DISPLAY: Record<string, string> = {
  'Студия': 'СТУДИЯ',
  'Евро-2': 'КВАРТИРА ЕВРО-2',
  '2-комнатная': '2-КОМНАТНАЯ КВАРТИРА',
  'Евро-3': 'КВАРТИРА ЕВРО-3',
  '3-комнатная': '3-КОМНАТНАЯ КВАРТИРА',
  'другое': 'КВАРТИРА',
}

// Direction angles in SVG coordinate system (0° = right, clockwise)
// WEST=UP, NORTH=RIGHT, EAST=DOWN, SOUTH=LEFT  (Imperial compass)
export const DIRECTION_ANGLES: Record<string, number> = {
  WEST: 270,
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
}

export const RAY_HALF_ANGLES: Record<string, number> = {
  NARROW: 15,
  MEDIUM: 30,
  WIDE: 45,
}
