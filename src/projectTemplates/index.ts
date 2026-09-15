import type { ProjectPreset } from '@/types'
import type { ProjectTemplate } from './types'
import { imperialTemplate } from './imperial'
import { defaultTemplate } from './default'
import { towersTemplate } from './towers'

export { imperialTemplate, defaultTemplate, towersTemplate }
export type { ProjectTemplate }

export function getTemplate(preset: ProjectPreset): ProjectTemplate {
  switch (preset) {
    case 'imperial': return imperialTemplate
    case 'towers': return towersTemplate
    default: return defaultTemplate
  }
}
