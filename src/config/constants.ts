export const THEME = {
  navy: '#1B2D4F',
  bronze: '#B5924C',
  ivory: '#FAF8F3',
  beige: '#F0EBE3',
  greige: '#E5DDD4',
  white: '#FFFFFF',
}

export const ADVANTAGES = [
  {
    id: 1,
    line1: 'Идеальное',
    line2: 'расположение',
    line3: 'в Каспийске',
    icon: 'location',
  },
  {
    id: 2,
    line1: '70% территории',
    line2: 'благоустройства',
    line3: 'двора-парка',
    icon: 'park',
  },
  {
    id: 3,
    line1: 'Панорамные',
    line2: 'окна в пол',
    line3: '',
    icon: 'window',
  },
  {
    id: 4,
    line1: 'Высокоскоростные',
    line2: 'лифты',
    line3: '',
    icon: 'elevator',
  },
  {
    id: 5,
    line1: 'Монолитная',
    line2: 'технология',
    line3: 'строительства',
    icon: 'building',
  },
  {
    id: 6,
    line1: 'Школа и детский',
    line2: 'сад рядом',
    line3: '',
    icon: 'school',
  },
  {
    id: 7,
    line1: 'Служба',
    line2: 'безопасности',
    line3: '24/7',
    icon: 'security',
  },
  {
    id: 8,
    line1: 'Подземный паркинг',
    line2: 'на 110 мест',
    line3: 'с просторными келлерами',
    icon: 'parking',
  },
]

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

export const DIRECTION_LABELS: Record<string, string> = {
  WEST: 'Запад',
  NORTH: 'Север',
  EAST: 'Восток',
  SOUTH: 'Юг',
}

export const RAY_HALF_ANGLES: Record<string, number> = {
  NARROW: 15,
  MEDIUM: 30,
  WIDE: 45,
}
