import type { FloorplanEntry, AppState, ApartmentEntry } from '@/types'

const PLANS_KEY = 'imperial_plans'
const STATE_KEY = 'imperial_state'
const APTS_KEY = 'imperial_apartments'

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

export function saveState(state: AppState): void {
  try {
    // Exclude large data URLs and transient UI flags from the persisted state:
    // showSitePlanEditor persisted in v1 → the modal reopened after page reload
    const { planImage: _p, customSitePlan: _c, showSitePlanEditor: _e, ...rest } = state
    void _p; void _c; void _e
    localStorage.setItem(STATE_KEY, JSON.stringify(rest))
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
    // Never restore transient UI flags (older saved states may still carry them)
    delete parsed.showSitePlanEditor
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
    return localStorage.getItem(`iwel_siteplan_${projectId}`)
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
