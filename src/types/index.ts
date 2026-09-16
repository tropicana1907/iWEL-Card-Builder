export type ApartmentType =
  | 'Студия'
  | 'Евро-2'
  | '2-комнатная'
  | 'Евро-3'
  | '3-комнатная'
  | 'другое'

export type RayWidth = 'NARROW' | 'MEDIUM' | 'WIDE'
export type CalcMode = 'forward' | 'reverse'
export type ProjectPreset = 'none' | 'imperial' | 'towers' | 'azur-prime' | 'azur-residence'

export interface CompassOrientation {
  northAngle: number
  eastAngle: number
  southAngle: number
  westAngle: number
}

export interface CalcVariant {
  id: string
  type: ApartmentType
  area: string
  pricePerSqm: string
  downPayment: string
  months: string
  mode: CalcMode
  desiredMonthly: string
  preset: ProjectPreset
}

export interface CalcResult {
  totalPrice: number
  remainingBalance: number
  monthlyPayment: number
  requiredDownPayment: number
}

export interface AppState {
  // Apartment identity
  block: number
  apartment: string
  type: ApartmentType
  area: string
  floors: string
  ceilingHeight: number

  // Legacy pricing (Imperial preset)
  downPayment: number

  // Floorplan
  planImage: string | null
  planLocked: boolean

  // Site plan
  anchorX: number | null
  anchorY: number | null
  viewWest: boolean
  viewNorth: boolean
  viewEast: boolean
  viewSouth: boolean
  rayWidth: RayWidth
  rayOpacity: number
  showSitePlanEditor: boolean
  productionLock: boolean
  customSitePlan: string | null

  // ETAP 2: Offer Builder fields
  projectTemplate: ProjectPreset
  address: string
  managerComment: string
  offerCalcResult: CalcResult | null
  offerPricePerSqm: number
  offerMonths: number
  offerCalcMode: CalcMode
  compassOrientation: CompassOrientation | null
}

export interface PricingResult {
  cashPrice: number
  installmentPrice: number
  svoCashPrice: number
  svoInstallmentPrice: number
  monthlyInstallment: number
  svoMonthlyInstallment: number
  downPayment: number
  isStudio: boolean
  hasArea: boolean
}

export interface FloorplanEntry {
  id: string
  block: number
  area: number
  type: ApartmentType
  image: string
}

export interface ApartmentEntry {
  id: string
  projectId: string
  block: number
  apartment: string
  area: number
  type: ApartmentType
  floors: string
  ceilingHeight: number
  planImage: string | null
  anchorX: number | null
  anchorY: number | null
  viewWest: boolean
  viewNorth: boolean
  viewEast: boolean
  viewSouth: boolean
  lastPricePerM2?: number
  savedAt: number
}
