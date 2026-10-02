// Bundled template images (public/templates/**) — site plans and floorplans
// extracted from the official project presentations. Paths are prefixed with
// the build-time base path so they work at any mount point.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export interface AssetTemplate {
  id: string
  project: 'imperial' | 'towers' | string
  label: string
  src: string
  // Imperial/Towers block — the floorplan picker groups templates by it
  block?: number
}

export const SITEPLAN_TEMPLATES: AssetTemplate[] = [
  {
    id: 'imperial-siteplan',
    project: 'imperial',
    label: 'Империал — генплан (блоки 1–5)',
    src: `${BASE}/templates/siteplans/imperial.webp`,
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
  { id: 'imperial-b5-f16-kv1', project: 'imperial', block: 5, label: 'Империал · №1 · 68,65 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv1-68.webp` },
  { id: 'imperial-b5-f16-kv2', project: 'imperial', block: 5, label: 'Империал · №2 · 82,90 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv2-82.webp` },
  { id: 'imperial-b5-f16-kv3', project: 'imperial', block: 5, label: 'Империал · №3 · 45,70 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv3-45.webp` },
  { id: 'imperial-b5-f16-kv4', project: 'imperial', block: 5, label: 'Империал · №4 · 46,00 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv4-46.webp` },
  { id: 'imperial-b5-f16-kv5', project: 'imperial', block: 5, label: 'Империал · №5 · 45,70 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv5-45.webp` },
  { id: 'imperial-b5-f16-kv6', project: 'imperial', block: 5, label: 'Империал · №6 · 82,90 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv6-82.webp` },
  { id: 'imperial-b5-f16-kv7', project: 'imperial', block: 5, label: 'Империал · №7 · 68,65 м² · 16 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f16-kv7-68.webp` },
  { id: 'imperial-b5-f15-kv1', project: 'imperial', block: 5, label: 'Империал · №1 · 83,80 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv1-83.webp` },
  { id: 'imperial-b5-f15-kv2', project: 'imperial', block: 5, label: 'Империал · №2 · 86,20 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv2-86.webp` },
  { id: 'imperial-b5-f15-kv3', project: 'imperial', block: 5, label: 'Империал · №3 · 57,30 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv3-57.webp` },
  { id: 'imperial-b5-f15-kv4', project: 'imperial', block: 5, label: 'Империал · №4 · 57,60 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv4-57.webp` },
  { id: 'imperial-b5-f15-kv5', project: 'imperial', block: 5, label: 'Империал · №5 · 57,30 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv5-57.webp` },
  { id: 'imperial-b5-f15-kv6', project: 'imperial', block: 5, label: 'Империал · №6 · 86,20 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv6-86.webp` },
  { id: 'imperial-b5-f15-kv7', project: 'imperial', block: 5, label: 'Империал · №7 · 83,80 м² · 15 этаж, терраса', src: `${BASE}/templates/floorplans/imperial-b5-f15-kv7-83.webp` },
  { id: 'imperial-b5-f2-14-kv1', project: 'imperial', block: 5, label: 'Империал · №1 · 57,40 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv1-57.webp` },
  { id: 'imperial-b5-f2-14-kv2', project: 'imperial', block: 5, label: 'Империал · №2 · 26,82 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv2-26.webp` },
  { id: 'imperial-b5-f2-14-kv3', project: 'imperial', block: 5, label: 'Империал · №3 · 82,88 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv3-82.webp` },
  { id: 'imperial-b5-f2-14-kv4', project: 'imperial', block: 5, label: 'Империал · №4 · 57,40 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv4-57.webp` },
  { id: 'imperial-b5-f2-14-kv5', project: 'imperial', block: 5, label: 'Империал · №5 · 28,00 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv5-28.webp` },
  { id: 'imperial-b5-f2-14-kv6', project: 'imperial', block: 5, label: 'Империал · №6 · 28,00 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv6-28.webp` },
  { id: 'imperial-b5-f2-14-kv7', project: 'imperial', block: 5, label: 'Империал · №7 · 57,40 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv7-57.webp` },
  { id: 'imperial-b5-f2-14-kv8', project: 'imperial', block: 5, label: 'Империал · №8 · 82,88 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv8-82.webp` },
  { id: 'imperial-b5-f2-14-kv9', project: 'imperial', block: 5, label: 'Империал · №9 · 26,82 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv9-26.webp` },
  { id: 'imperial-b5-f2-14-kv10', project: 'imperial', block: 5, label: 'Империал · №10 · 57,40 м² · 2–14 этаж', src: `${BASE}/templates/floorplans/imperial-b5-f2-14-kv10-57.webp` },
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
