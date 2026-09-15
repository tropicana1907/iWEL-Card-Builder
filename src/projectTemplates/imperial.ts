import type { ProjectTemplate } from './types'

// Imperial compass: WEST = UP (270°), NORTH = RIGHT (0°), EAST = DOWN (90°), SOUTH = LEFT (180°)
const IMPERIAL_COMPASS = {
  northAngle: 0,
  eastAngle: 90,
  southAngle: 180,
  westAngle: 270,
}

export const imperialTemplate: ProjectTemplate = {
  id: 'imperial',
  name: 'ИМПЕРИАЛ',
  shortName: 'ИМПЕРИАЛ',
  slogan: 'ЖИВИ В ГАРМОНИИ',
  address: 'Каспийск, Каспийское шоссе, 1А',
  disclaimer:
    'Площади указаны по проектной документации. Итоговые параметры могут незначительно отличаться. Предложение не является публичной офертой.',
  compassOrientation: IMPERIAL_COMPASS,
  colors: {
    navy: '#1B2D4F',
    bronze: '#B5924C',
    ivory: '#FAF8F3',
    beige: '#F0EBE3',
    greige: '#E5DDD4',
    white: '#FFFFFF',
  },
  defaultCeilingHeight: 3.10,
  advantages: [
    { id: 1, icon: 'location', line1: 'Идеальное', line2: 'расположение', line3: 'в Каспийске' },
    { id: 2, icon: 'park', line1: '70% территории', line2: 'благоустройства', line3: 'двора-парка' },
    { id: 3, icon: 'window', line1: 'Панорамные', line2: 'окна в пол', line3: '' },
    { id: 4, icon: 'elevator', line1: 'Высокоскоростные', line2: 'лифты', line3: '' },
    { id: 5, icon: 'building', line1: 'Монолитная', line2: 'технология', line3: 'строительства' },
    { id: 6, icon: 'school', line1: 'Школа и детский', line2: 'сад рядом', line3: '' },
    { id: 7, icon: 'security', line1: 'Служба', line2: 'безопасности', line3: '24/7' },
    { id: 8, icon: 'parking', line1: 'Подземный паркинг', line2: 'на 110 мест', line3: 'с просторными келлерами' },
  ],
}
