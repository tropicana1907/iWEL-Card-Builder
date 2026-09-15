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
    label: 'Towers — генплан',
    src: `${BASE}/templates/siteplans/towers-aerial.jpg`,
  },
]

// Types, areas and images come from the official project presentations —
// alt-texts of the 3D plans carried the exact areas.
export const FLOORPLAN_TEMPLATES: AssetTemplate[] = [
  { id: 'imperial-penthouse-104', project: 'imperial', label: 'Империал · Пентхаус 104,11 м²', src: `${BASE}/templates/floorplans/imperial-penthouse-104.webp` },
  { id: 'imperial-penthouse-79', project: 'imperial', label: 'Империал · Пентхаус 79,75 м²', src: `${BASE}/templates/floorplans/imperial-penthouse-79.webp` },
  { id: 'imperial-penthouse-57', project: 'imperial', label: 'Империал · Пентхаус 57,31 м²', src: `${BASE}/templates/floorplans/imperial-penthouse-57.webp` },
  { id: 'imperial-2k-81', project: 'imperial', label: 'Империал · 2-комнатная 81 м²', src: `${BASE}/templates/floorplans/imperial-2k-81.webp` },
  { id: 'imperial-2k-56', project: 'imperial', label: 'Империал · 2-комнатная 56,51 м²', src: `${BASE}/templates/floorplans/imperial-2k-56.webp` },
  { id: 'imperial-studio-28', project: 'imperial', label: 'Империал · Студия 28,32 м²', src: `${BASE}/templates/floorplans/imperial-studio-28.webp` },
  { id: 'towers-3k-107', project: 'towers', label: 'Towers · 3-комнатная 107,63 м²', src: `${BASE}/templates/floorplans/towers-3k-107.webp` },
  { id: 'towers-2k-70', project: 'towers', label: 'Towers · 2-комнатная 70,21 м²', src: `${BASE}/templates/floorplans/towers-2k-70.webp` },
  { id: 'towers-1k-43', project: 'towers', label: 'Towers · 1-комнатная 43,94 м²', src: `${BASE}/templates/floorplans/towers-1k-43.webp` },
  { id: 'towers-studio-21', project: 'towers', label: 'Towers · Студия 21,33 м²', src: `${BASE}/templates/floorplans/towers-studio-21.webp` },
  { id: 'towers-floor-13', project: 'towers', label: 'Towers · План типового этажа (блоки 1, 3)', src: `${BASE}/templates/floorplans/towers-floor-13.webp` },
]

export const FLOORPLAN_TABS: { key: string; label: string }[] = [
  { key: 'imperial', label: 'Империал' },
  { key: 'towers', label: 'Towers' },
]

// Current project first, the rest after — the manager most often needs
// templates of the project the card is being built for.
export function templatesForProject<T extends AssetTemplate>(templates: T[], project: string): T[] {
  return [...templates].sort((a, b) =>
    (a.project === project ? 0 : 1) - (b.project === project ? 0 : 1)
  )
}
