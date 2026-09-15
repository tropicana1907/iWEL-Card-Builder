import type { CompassOrientation } from '@/types'

export interface Advantage {
  id: number
  icon: string
  line1: string
  line2: string
  line3?: string
}

export interface TemplateColors {
  navy: string
  bronze: string
  ivory: string
  beige: string
  greige: string
  white: string
}

export interface ProjectTemplate {
  id: string
  name: string
  shortName: string
  slogan: string
  address: string
  disclaimer: string
  compassOrientation: CompassOrientation
  colors: TemplateColors
  advantages: Advantage[]
  defaultCeilingHeight: number
}
