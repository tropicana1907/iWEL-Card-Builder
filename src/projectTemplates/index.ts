import type { ProjectPreset } from '@/types'
import type { ProjectTemplate } from './types'
import { imperialTemplate } from './imperial'
import { defaultTemplate } from './default'
import { towersTemplate } from './towers'
import { azurPrimeTemplate } from './azurPrime'
import { azurResidenceTemplate } from './azurResidence'

export { imperialTemplate, defaultTemplate, towersTemplate, azurPrimeTemplate, azurResidenceTemplate }
export type { ProjectTemplate }

export function getTemplate(preset: ProjectPreset): ProjectTemplate {
  switch (preset) {
    case 'imperial': return imperialTemplate
    case 'towers': return towersTemplate
    case 'azur-prime': return azurPrimeTemplate
    case 'azur-residence': return azurResidenceTemplate
    default: return defaultTemplate
  }
}
