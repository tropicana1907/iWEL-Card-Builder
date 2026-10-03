import type { FloorplanEntry, AppState, ApartmentEntry, CalcVariant } from '@/types'
import { SITEPLAN_TEMPLATES } from '@/config/templateAssets'

const PLANS_KEY = 'imperial_plans'
const STATE_KEY = 'imperial_state'
const APTS_KEY = 'imperial_apartments'
const CALC_KEY = 'imperial_calc_variants'

export function savePlan(entry: FloorplanEntry): boolean {
  try {
    const plans = loadPlans()
    const idx = plans.findIndex(p => p.id === entry.id)
    if (idx >= 0) plans[idx] = entry
    else plans.push(entry)
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
    return true
  } catch {
    // localStorage quota exceeded (data-URL images are large) — report, don't lie
    return false
  }
}

export function loadPlans(): FloorplanEntry[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function findPlan(block: number, area: number): FloorplanEntry | null {
  const plans = loadPlans()
  return plans.find(p => p.block === block && Math.abs(p.area - area) < 0.01) ?? null
}

export function deletePlan(id: string): void {
  try {
    const plans = loadPlans().filter(p => p.id !== id)
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
  } catch {}
}

// No view point, no rays — applied on load and whenever the site plan or project changes
export const NO_VIEW_POINT = {
  anchorX: null,
  anchorY: null,
  viewWest: false,
  viewNorth: false,
  viewEast: false,
  viewSouth: false,
} satisfies Partial<AppState>

const VIEW_POINT_KEYS = Object.keys(NO_VIEW_POINT) as (keyof typeof NO_VIEW_POINT)[]

export function saveState(state: AppState): void {
  try {
    // Exclude large data URLs and transient UI flags from the persisted state:
    // showSitePlanEditor persisted in v1 → the modal reopened after page reload
    // The view point and rays belong to one site plan — they are not persisted
    // either (a stale point reappeared on the new Towers site plan, on block C)
    const { planImage: _p, customSitePlan: _c, showSitePlanEditor: _e, ...rest } = state
    void _p; void _c; void _e
    const persisted: Partial<AppState> = { ...rest }
    for (const k of VIEW_POINT_KEYS) delete persisted[k]
    localStorage.setItem(STATE_KEY, JSON.stringify(persisted))
  } catch {}
}

export function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Safe number coercions to avoid NaN in state
    if (parsed.ceilingHeight !== undefined) parsed.ceilingHeight = Number(parsed.ceilingHeight) || 3.10
    if (parsed.rayOpacity !== undefined) parsed.rayOpacity = Number(parsed.rayOpacity) || 25
    if (parsed.offerPricePerSqm !== undefined) parsed.offerPricePerSqm = Number(parsed.offerPricePerSqm) || 0
    if (parsed.offerMonths !== undefined) parsed.offerMonths = Number(parsed.offerMonths) || 36
    if (parsed.downPayment !== undefined) parsed.downPayment = Number(parsed.downPayment) || 0
    // Never restore transient UI flags or the view point (older saved states may still carry them)
    delete parsed.showSitePlanEditor
    for (const k of VIEW_POINT_KEYS) delete parsed[k]
    return parsed
  } catch {
    return {}
  }
}

// ── Per-project site plan storage ──────────────────────────────────────────────
// Stored separately from state because data URLs are large (~1–3 MB each)

export function saveProjectSitePlan(projectId: string, dataUrl: string | null): void {
  try {
    const key = `iwel_siteplan_${projectId}`
    if (dataUrl) localStorage.setItem(key, dataUrl)
    else localStorage.removeItem(key)
  } catch {}
}

export function loadProjectSitePlan(projectId: string): string | null {
  try {
    const saved = localStorage.getItem(`iwel_siteplan_${projectId}`)
    // A bundled template that no longer exists (e.g. the old towers-aerial.jpg)
    // falls back to the project's current bundled site plan
    if (saved && saved.includes('/templates/siteplans/') && !SITEPLAN_TEMPLATES.some(t => t.src === saved)) {
      return SITEPLAN_TEMPLATES.find(t => t.project === projectId)?.src ?? null
    }
    return saved
  } catch {
    return null
  }
}

// ── Apartment library ──────────────────────────────────────────────────────────

export function saveApartment(entry: ApartmentEntry): boolean {
  try {
    const apts = loadApartments()
    const idx = apts.findIndex(a => a.id === entry.id)
    if (idx >= 0) apts[idx] = entry
    else apts.unshift(entry)
    // Store metadata without large planImage
    const metaOnly = apts.slice(0, 200).map(a => ({ ...a, planImage: null }))
    localStorage.setItem(APTS_KEY, JSON.stringify(metaOnly))
    // Store planImage separately per apartment
    if (entry.planImage) {
      localStorage.setItem(`iwel_apt_plan_${entry.id}`, entry.planImage)
    }
    return true
  } catch {
    return false
  }
}

export function loadApartments(): ApartmentEntry[] {
  try {
    const raw = localStorage.getItem(APTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function loadApartmentWithPlan(entry: ApartmentEntry): ApartmentEntry {
  try {
    const plan = localStorage.getItem(`iwel_apt_plan_${entry.id}`)
    return { ...entry, planImage: plan }
  } catch {
    return entry
  }
}

export function findApartment(projectId: string, block: number, apartment: string): ApartmentEntry | null {
  const apts = loadApartments()
  const found = apts.find(a => a.projectId === projectId && a.block === block && a.apartment === apartment)
  return found ? loadApartmentWithPlan(found) : null
}

export function deleteApartment(id: string): void {
  try {
    const apts = loadApartments().filter(a => a.id !== id)
    localStorage.setItem(APTS_KEY, JSON.stringify(apts))
    localStorage.removeItem(`iwel_apt_plan_${id}`)
  } catch {}
}

// Quick calculator variants — kept so switching tabs doesn't wipe the calculation
export function saveCalcVariants(variants: CalcVariant[]): void {
  try {
    localStorage.setItem(CALC_KEY, JSON.stringify(variants))
  } catch {}
}

export function loadCalcVariants(): CalcVariant[] | null {
  try {
    const raw = localStorage.getItem(CALC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}
