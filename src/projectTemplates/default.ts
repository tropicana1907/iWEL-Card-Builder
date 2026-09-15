import type { ProjectTemplate } from './types'

export const defaultTemplate: ProjectTemplate = {
  id: 'default',
  name: 'ПРОЕКТ',
  shortName: 'ПРОЕКТ',
  slogan: 'ВАША КВАРТИРА',
  address: '',
  disclaimer:
    'Площади указаны по проектной документации. Итоговые параметры могут незначительно отличаться. Предложение не является публичной офертой.',
  compassOrientation: {
    northAngle: 270,  // North = UP by default
    eastAngle: 0,
    southAngle: 90,
    westAngle: 180,
  },
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
    { id: 1, icon: 'location', line1: 'Удобное', line2: 'расположение', line3: '' },
    { id: 2, icon: 'park', line1: 'Благоустроенная', line2: 'территория', line3: '' },
    { id: 3, icon: 'window', line1: 'Качественное', line2: 'остекление', line3: '' },
    { id: 4, icon: 'elevator', line1: 'Современные', line2: 'лифты', line3: '' },
    { id: 5, icon: 'building', line1: 'Надёжная', line2: 'технология', line3: 'строительства' },
    { id: 6, icon: 'school', line1: 'Инфраструктура', line2: 'рядом', line3: '' },
    { id: 7, icon: 'security', line1: 'Охраняемая', line2: 'территория', line3: '24/7' },
    { id: 8, icon: 'parking', line1: 'Паркинг', line2: 'для жильцов', line3: '' },
  ],
}
