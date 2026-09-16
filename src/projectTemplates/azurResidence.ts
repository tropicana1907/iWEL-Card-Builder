import type { ProjectTemplate } from './types'

export const azurResidenceTemplate: ProjectTemplate = {
  id: 'azur-residence',
  name: 'AZUR Residence',
  shortName: 'AZUR Residence',
  slogan: 'ЖИЗНЬ НА ВЫСШЕМ УРОВНЕ',
  address: '',
  disclaimer:
    'Площади указаны по проектной документации. Итоговые параметры могут незначительно отличаться. Предложение не является публичной офертой.',
  compassOrientation: {
    northAngle: 270,
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
  defaultCeilingHeight: 3.00,
  advantages: [
    { id: 1, icon: 'location', line1: 'Удобное', line2: 'расположение', line3: '' },
    { id: 2, icon: 'building', line1: 'Монолитная', line2: 'технология', line3: 'строительства' },
    { id: 3, icon: 'window', line1: 'Панорамные', line2: 'окна в пол', line3: '' },
    { id: 4, icon: 'elevator', line1: 'Высокоскоростные', line2: 'лифты', line3: '' },
    { id: 5, icon: 'park', line1: 'Благоустроенная', line2: 'территория', line3: '' },
    { id: 6, icon: 'school', line1: 'Школа и детский', line2: 'сад рядом', line3: '' },
    { id: 7, icon: 'security', line1: 'Служба', line2: 'безопасности', line3: '24/7' },
    { id: 8, icon: 'parking', line1: 'Паркинг', line2: 'для жильцов', line3: '' },
  ],
}
