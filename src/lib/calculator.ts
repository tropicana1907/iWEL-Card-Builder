import type { ApartmentType, PricingResult, ProjectPreset, CalcResult } from '@/types'

const CASH = 85_000
const INSTALLMENT = 115_000
const SVO_CASH = 80_000
const SVO_INSTALL = 110_000
const MONTHS = 36

export const PRESET_PRICES: Record<ProjectPreset, { label: string; pricePerSqm: number; maxMonths: number }> = {
  none: { label: 'Свой', pricePerSqm: 0, maxMonths: 60 },
  imperial: { label: 'Империал', pricePerSqm: 115_000, maxMonths: 36 },
  towers: { label: 'Towers', pricePerSqm: 105_000, maxMonths: 36 },
  'azur-prime': { label: 'AZUR Prime', pricePerSqm: 180_000, maxMonths: 24 },
  'azur-residence': { label: 'AZUR Residence', pricePerSqm: 180_000, maxMonths: 24 },
}

export function calcForward(area: number, pricePerSqm: number, downPayment: number, months: number): CalcResult {
  const totalPrice = Math.round(area * pricePerSqm)
  const dp = Math.max(0, Math.min(downPayment, totalPrice))
  const remainingBalance = totalPrice - dp
  const monthlyPayment = months > 0 ? Math.round(remainingBalance / months) : 0
  return { totalPrice, remainingBalance, monthlyPayment, requiredDownPayment: dp }
}

export function calcReverse(area: number, pricePerSqm: number, desiredMonthly: number, months: number): CalcResult {
  const totalPrice = Math.round(area * pricePerSqm)
  const requiredDownPayment = Math.max(0, totalPrice - desiredMonthly * months)
  const remainingBalance = totalPrice - requiredDownPayment
  return { totalPrice, remainingBalance, monthlyPayment: desiredMonthly, requiredDownPayment }
}

export function suggestDownPayment(area: number): number {
  return area >= 85 ? 2_500_000 : 1_000_000
}

export function calculatePrices(
  area: number,
  type: ApartmentType,
  downPayment: number
): PricingResult {
  const a = area > 0 ? area : 0
  const cashPrice = Math.round(a * CASH)
  const installmentPrice = Math.round(a * INSTALLMENT)
  const svoCashPrice = Math.round(a * SVO_CASH)
  const svoInstallmentPrice = Math.round(a * SVO_INSTALL)
  const dp = Math.max(0, downPayment)
  const monthlyInstallment = a > 0 ? Math.round((installmentPrice - dp) / MONTHS) : 0
  const svoMonthlyInstallment = a > 0 ? Math.round((svoInstallmentPrice - dp) / MONTHS) : 0

  return {
    cashPrice,
    installmentPrice,
    svoCashPrice,
    svoInstallmentPrice,
    monthlyInstallment,
    svoMonthlyInstallment,
    downPayment: dp,
    isStudio: type === 'Студия',
    hasArea: a > 0,
  }
}

export function fmt(price: number): string {
  if (price <= 0) return '—'
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
}

export function parseArea(str: string): number {
  return parseFloat(str.replace(',', '.')) || 0
}

export function parseFloors(str: string): number[] {
  return str
    .split(/[,\s]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0)
}

export function formatFloors(floors: number[]): string {
  if (floors.length === 0) return '—'
  return floors.join(' · ')
}
