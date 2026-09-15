// Bundled template images (public/templates/**) — site plans and floorplans
// extracted from the official project presentations. Paths are prefixed with
// the build-time base path so they work at any mount point.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export interface AssetTemplate {
  id: string
  project: 'imperial' | 'towers' | string
  label: string
  src: string
}

export const SITEPLAN_TEMPLATES: AssetTemplate[] = [
  {
    id: 'imperial-siteplan',
    project: 'imperial',
    label: 'Империал — генплан (блоки 1–4)',
    src: `${BASE}/templates/siteplans/imperial.jpg`,
  },
  {
    id: 'towers-aerial',
    project: 'towers',
    label: 'Башни — вид сверху',
    src: `${BASE}/templates/siteplans/towers-aerial.jpg`,
  },
]

export const FLOORPLAN_TEMPLATES: AssetTemplate[] = [
  { id: 'imperial-plan-1', project: 'imperial', label: 'Империал · вариант 1', src: `${BASE}/templates/floorplans/imperial-plan-1.webp` },
  { id: 'imperial-plan-2', project: 'imperial', label: 'Империал · вариант 2', src: `${BASE}/templates/floorplans/imperial-plan-2.webp` },
  { id: 'imperial-plan-3', project: 'imperial', label: 'Империал · вариант 3', src: `${BASE}/templates/floorplans/imperial-plan-3.webp` },
  { id: 'imperial-plan-4', project: 'imperial', label: 'Империал · вариант 4', src: `${BASE}/templates/floorplans/imperial-plan-4.webp` },
  { id: 'imperial-plan-5', project: 'imperial', label: 'Империал · вариант 5', src: `${BASE}/templates/floorplans/imperial-plan-5.webp` },
  { id: 'towers-plan-1', project: 'towers', label: 'Башни · вариант 1', src: `${BASE}/templates/floorplans/towers-plan-1.webp` },
  { id: 'towers-plan-2', project: 'towers', label: 'Башни · вариант 2', src: `${BASE}/templates/floorplans/towers-plan-2.webp` },
  { id: 'towers-plan-3', project: 'towers', label: 'Башни · вариант 3', src: `${BASE}/templates/floorplans/towers-plan-3.webp` },
]

// Current project first, the rest after — the manager most often needs
// templates of the project the card is being built for.
export function templatesForProject<T extends AssetTemplate>(templates: T[], project: string): T[] {
  return [...templates].sort((a, b) =>
    (a.project === project ? 0 : 1) - (b.project === project ? 0 : 1)
  )
}
