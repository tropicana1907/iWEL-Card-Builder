'use client'

import { forwardRef } from 'react'
import type { AppState, PricingResult } from '@/types'
import { CARD_WIDTH, CARD_HEIGHT } from '@/config/card'
import { RAY_HALF_ANGLES, TYPE_DISPLAY } from '@/config/constants'
import { buildSectorPath, directionRays, DEFAULT_COMPASS } from '@/lib/geometry'
import { AdvantageIcon } from './Icons'
import type { ProjectTemplate, TemplateColors } from '@/projectTemplates/types'
import { imperialTemplate } from '@/projectTemplates/imperial'

const fmt = (p: number) => p <= 0 ? '—' : new Intl.NumberFormat('ru-RU').format(p) + ' ₽'
const parseArea = (s: string) => parseFloat(s.replace(',', '.')) || 0
const parseFloors = (s: string) => s.split(/[,\s]+/).map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n) && n > 0)
const formatFloors = (fs: number[]) => fs.length === 0 ? '—' : fs.join(' · ')

// Fonts self-hosted via next/font (see layout.tsx) — safe for html-to-image export
const FONT_DISPLAY = "var(--font-display), Georgia, 'Times New Roman', serif"
const FONT_SANS = "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// ─── Financial block ──────────────────────────────────────────────────────────
interface FinancialBlockProps {
  number?: string
  title: string
  pricePerSqm: string
  total: string
  totalLabel?: string
  downPayment?: string
  downPaymentLabel?: string
  monthly?: string
  monthsLabel?: string
  accent?: boolean
  compact?: boolean
  colors: TemplateColors
}

function FinancialBlock({ number, title, pricePerSqm, total, totalLabel = 'Стоимость', downPayment, downPaymentLabel, monthly, monthsLabel, accent = false, compact = false, colors: C }: FinancialBlockProps) {
  const hasInstallment = !!downPayment
  // compact — legacy 3-block grid; regular — 1-2 large blocks
  const fz = compact
    ? { num: 24, title: 16, ppm: 19, label: 14, total: 34, subLabel: 13, subVal: 24 }
    : { num: 30, title: 20, ppm: 24, label: 16, total: 46, subLabel: 15, subVal: 30 }

  return (
    <div style={{
      minHeight: 0,
      minWidth: 0,
      backgroundColor: accent ? '#EEE9E1' : C.beige,
      borderRadius: '4px',
      padding: compact ? '14px 24px' : '22px 32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: compact ? '3px' : '6px',
      borderLeft: `3px solid ${C.bronze}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        {number && (
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: `${fz.num}px`, fontWeight: '600', color: C.bronze, letterSpacing: '0.04em' }}>
            {number}
          </span>
        )}
        <span style={{ fontSize: `${fz.title}px`, color: C.navy, letterSpacing: '0.12em', fontWeight: '700', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      {pricePerSqm && (
        <div style={{ fontSize: `${fz.ppm}px`, color: C.bronze, letterSpacing: '0.04em', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
          {pricePerSqm}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
        <div style={{ fontSize: `${fz.label}px`, color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {totalLabel}
        </div>
        <div style={{ fontSize: `${fz.total}px`, fontWeight: '800', color: C.navy, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {total}
        </div>
      </div>
      {hasInstallment && (
        <>
          <div style={{ borderTop: `1px solid ${C.greige}`, margin: compact ? '4px 0' : '7px 0' }} />
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: `${fz.subLabel}px`, color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {downPaymentLabel ?? 'Первоначальный взнос'}
              </div>
              <div style={{ fontSize: `${fz.subVal}px`, fontWeight: '700', color: C.navy, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                {downPayment}
              </div>
            </div>
            <div>
              <div style={{ fontSize: `${fz.subLabel}px`, color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {monthsLabel ?? 'Ежемесячно ≈'}
              </div>
              <div style={{ fontSize: `${fz.subVal}px`, fontWeight: '700', color: C.bronze, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                {monthly}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Universal calc blocks ─────────────────────────────────────────────────────
function UniversalFinancialSection({ state, colors }: { state: AppState; colors: TemplateColors }) {
  const calc = state.offerCalcResult
  const isStudio = state.type === 'Студия'
  const isReverse = state.offerCalcMode === 'reverse'
  const months = state.offerMonths || 36
  const terraceSurcharge = state.projectTemplate === 'imperial' && state.hasTerrace ? 5_000 : 0
  const ppm = state.offerPricePerSqm + terraceSurcharge
  const C = colors

  if (!calc) return null

  const isFull = state.offerPaymentMode === 'full'

  if (isStudio || isFull) {
    return (
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: isStudio ? '70%' : '80%', display: 'grid' }}>
          <FinancialBlock
            title="СТОИМОСТЬ"
            pricePerSqm={ppm > 0 ? `${ppm.toLocaleString('ru-RU')} ₽/м²` : ''}
            total={fmt(calc.totalPrice)}
            totalLabel={isFull ? '100% ОПЛАТА' : 'Стоимость'}
            colors={C}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '14px' }}>
      {/* Left: стоимость */}
      <FinancialBlock
        title="СТОИМОСТЬ"
        pricePerSqm={ppm > 0 ? `${ppm.toLocaleString('ru-RU')} ₽/м²` : ''}
        total={fmt(calc.totalPrice)}
        colors={C}
      />

      {/* Right: рассрочка — новый макет */}
      <div style={{
        minHeight: 0,
        minWidth: 0,
        backgroundColor: '#EEE9E1',
        borderRadius: '4px',
        padding: '20px 32px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `3px solid ${C.bronze}`,
      }}>
        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '22px', color: C.navy, letterSpacing: '0.14em', fontWeight: '800', textTransform: 'uppercase' }}>
            РАССРОЧКА
          </div>
          <div style={{ fontSize: '17px', color: C.bronze, letterSpacing: '0.08em', fontWeight: '600', marginTop: '2px' }}>
            НА {months} МЕС
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.greige}`, marginBottom: '10px' }} />

        {/* Big monthly payment — centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '15px', color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Ежемесячный платёж ≈
          </div>
          <div style={{ fontSize: '54px', fontWeight: '800', color: C.bronze, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {fmt(calc.monthlyPayment)}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.greige}`, marginTop: '10px', marginBottom: '10px' }} />

        {/* ПВ + остаток — small, side by side */}
        <div style={{ display: 'flex', gap: '28px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isReverse ? 'Необходимый взнос' : 'Первоначальный взнос'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: C.navy, fontVariantNumeric: 'tabular-nums', marginTop: '3px' }}>
              {fmt(calc.requiredDownPayment)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(27,45,79,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Остаток
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: C.navy, fontVariantNumeric: 'tabular-nums', marginTop: '3px' }}>
              {fmt(calc.remainingBalance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Imperial legacy pricing blocks (hardcoded price grid — Imperial only) ─────
function ImperialFinancialSection({ pricing, colors }: { pricing: PricingResult; colors: TemplateColors }) {
  const { isStudio } = pricing

  if (isStudio) {
    return (
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <FinancialBlock
          number="01"
          title="100% ОПЛАТА"
          pricePerSqm="85 000 ₽/м²"
          total={fmt(pricing.cashPrice)}
          colors={colors}
        />
        <FinancialBlock
          number="02"
          title="СВО — 100% ОПЛАТА"
          pricePerSqm="80 000 ₽/м²"
          total={fmt(pricing.svoCashPrice)}
          accent
          colors={colors}
        />
      </div>
    )
  }

  // Two cash blocks on top, the installment block full-width below.
  // «СВО — рассрочка» removed per owner's decision (2026-09-15).
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1.35fr', gap: '12px' }}>
      <FinancialBlock
        number="01"
        title="100% ОПЛАТА"
        pricePerSqm="85 000 ₽/м²"
        total={fmt(pricing.cashPrice)}
        compact
        colors={colors}
      />
      <FinancialBlock
        number="02"
        title="СВО — 100% ОПЛАТА"
        pricePerSqm="80 000 ₽/м²"
        total={fmt(pricing.svoCashPrice)}
        accent
        compact
        colors={colors}
      />
      <div style={{ gridColumn: '1 / -1', display: 'grid' }}>
        <FinancialBlock
          number="03"
          title="РАССРОЧКА ДО 36 МЕС"
          pricePerSqm="115 000 ₽/м²"
          total={fmt(pricing.installmentPrice - pricing.downPayment)}
          totalLabel="Остаток"
          downPayment={fmt(pricing.downPayment)}
          monthly={fmt(pricing.monthlyInstallment)}
          monthsLabel="Ежемесячный платёж ≈"
          compact
          colors={colors}
        />
      </div>
    </div>
  )
}

// ─── Compass rose (shows card viewer which way is north on this plan) ──────────
function CompassRose({ compass, colors }: { compass: { northAngle: number; eastAngle: number; southAngle: number; westAngle: number }; colors: TemplateColors }) {
  const R = 26
  const letters = [
    { l: 'С', a: compass.northAngle, main: true },
    { l: 'В', a: compass.eastAngle, main: false },
    { l: 'Ю', a: compass.southAngle, main: false },
    { l: 'З', a: compass.westAngle, main: false },
  ]
  return (
    <g>
      <circle r={R + 10} fill="rgba(250,248,243,0.85)" stroke={colors.bronze} strokeWidth="1" />
      {letters.map(({ l, a, main }) => {
        const rad = (a * Math.PI) / 180
        const x = (R - 4) * Math.cos(rad)
        const y = (R - 4) * Math.sin(rad)
        return (
          <text
            key={l}
            x={x}
            y={y + 4.5}
            textAnchor="middle"
            fontSize={main ? 15 : 12}
            fontWeight={main ? 800 : 600}
            fill={main ? colors.bronze : colors.navy}
            fontFamily={FONT_SANS}
          >
            {l}
          </text>
        )
      })}
      <circle r="2.5" fill={colors.bronze} />
    </g>
  )
}

// ─── Site plan with rays overlay ──────────────────────────────────────────────
interface SitePlanProps {
  customSitePlan: string | null
  anchorX: number | null
  anchorY: number | null
  viewWest: boolean
  viewNorth: boolean
  viewEast: boolean
  viewSouth: boolean
  rayWidth: string
  rayOpacity: number
  height: number
  compassOrientation?: { northAngle: number; eastAngle: number; southAngle: number; westAngle: number } | null
  colors: TemplateColors
}

function SitePlanSection(props: SitePlanProps) {
  const { customSitePlan, anchorX, anchorY, viewWest, viewNorth, viewEast, viewSouth,
    rayWidth, rayOpacity, height, compassOrientation, colors: C } = props

  const W = 1080
  const H = height

  const ax = anchorX !== null ? (anchorX / 100) * W : null
  const ay = anchorY !== null ? (anchorY / 100) * H : null

  const halfAngle = RAY_HALF_ANGLES[rayWidth] ?? 30
  const rayLen = Math.sqrt(W * W + H * H)
  const rayColor = `rgba(215,195,155,${rayOpacity / 100})`
  const compass = compassOrientation ?? DEFAULT_COMPASS
  const rays = directionRays(compass, { west: viewWest, north: viewNorth, east: viewEast, south: viewSouth })

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', backgroundColor: '#E8E2D8' }}>
      {customSitePlan ? (
        <img
          src={customSitePlan}
          alt="Генплан"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '14px',
          backgroundColor: '#EBE5DB',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.bronze} strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <div style={{ fontSize: '14px', letterSpacing: '0.18em', color: C.bronze, textTransform: 'uppercase' }}>
            Генплан проекта
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(181,146,76,0.6)', letterSpacing: '0.06em' }}>
            Загрузите генплан проекта
          </div>
        </div>
      )}

      {/* Subtle navy vignette over the site plan — blends it into the card */}
      {customSitePlan && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(27,45,79,0.20) 0%, rgba(27,45,79,0) 24%, rgba(27,45,79,0) 70%, rgba(27,45,79,0.26) 100%)',
        }} />
      )}

      <svg
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
      >
        {ax !== null && ay !== null && (
          <>
            {rays.filter(v => v.active).map(v => (
              <path
                key={v.key}
                d={buildSectorPath(ax, ay, v.angle, halfAngle, rayLen)}
                fill={rayColor}
                stroke="rgba(181,146,76,0.3)"
                strokeWidth="1"
              />
            ))}
            <circle cx={ax} cy={ay} r="7" fill={C.bronze} opacity="0.9" />
            <circle cx={ax} cy={ay} r="3" fill={C.white} />
          </>
        )}
        {customSitePlan && (
          <g transform={`translate(${W - 58}, ${H - 58})`}>
            <CompassRose compass={compass} colors={C} />
          </g>
        )}
      </svg>
    </div>
  )
}

// ─── Advantages section ────────────────────────────────────────────────────────
function AdvantagesSection({ advantages, height, colors: C }: {
  advantages: { id: number; icon: string; line1: string; line2: string; line3?: string }[]
  height: number
  colors: TemplateColors
}) {
  return (
    <div style={{
      height,
      backgroundColor: C.ivory,
      padding: '22px 40px 16px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '14px',
        marginBottom: '14px',
        borderBottom: `1px solid ${C.bronze}`,
        paddingBottom: '10px',
      }}>
        <span style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '26px',
          letterSpacing: '0.1em',
          color: C.navy,
          textTransform: 'uppercase',
          fontWeight: '600',
        }}>
          Ключевые преимущества
        </span>
      </div>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '10px',
      }}>
        {advantages.map(adv => (
          <div key={adv.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '8px 6px',
            backgroundColor: C.beige,
            borderRadius: '4px',
          }}>
            <AdvantageIcon name={adv.icon} size={40} color={C.bronze} />
            <div style={{ marginTop: '10px', fontSize: '20px', color: C.navy, lineHeight: '1.28', letterSpacing: '0.01em', fontWeight: '500' }}>
              {adv.line1}<br />
              {adv.line2}
              {adv.line3 && <><br />{adv.line3}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main card ─────────────────────────────────────────────────────────────────
interface Props {
  state: AppState
  pricing: PricingResult
  template?: ProjectTemplate
}

const CardTemplate = forwardRef<HTMLDivElement, Props>(({ state, pricing, template }, ref) => {
  const tpl = template ?? imperialTemplate
  const C = tpl.colors
  const area = parseArea(state.area)
  const floors = parseFloors(state.floors)
  const typeName = TYPE_DISPLAY[state.type] ?? state.type.toUpperCase()
  // Universal calc result wins; the hardcoded legacy price grid belongs to
  // Imperial only (v1 bug: Башни without entered price showed Imperial prices)
  const useUniversalCalc = state.offerCalcResult !== null
  const showLegacyGrid = !useUniversalCalc && tpl.id === 'imperial'

  // Pixel-exact heights that sum to CARD_HEIGHT (2000)
  const H_HEADER    = 160
  const H_TITLE     = 76
  const H_INFO      = 60
  const H_MAIN      = 814   // floorplan (70% width) on top + financial below
  const H_SITEPLAN  = 400   // keep 2.7:1 — must match the editor aspect ratio
  const H_ADVANTAGES = 440
  const H_FOOTER    = 110
  // total = 2060 ✓ (CARD_HEIGHT)
  const H_FLOORPLAN = 440
  const FLOORPLAN_W = 756   // 70% of 1080 — owner's spec

  const displayAddress = state.address || tpl.address

  return (
    <div
      ref={ref}
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        backgroundColor: C.ivory,
        fontFamily: FONT_SANS,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        width: '1080px',
        height: `${H_HEADER}px`,
        backgroundColor: C.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        flexShrink: 0,
        borderBottom: `2px solid ${C.bronze}`,
      }}>
        <div>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '54px',
            color: C.white,
            letterSpacing: '0.24em',
            fontWeight: '500',
          }}>
            {tpl.name}
          </div>
          <div style={{
            fontSize: '14px',
            color: C.bronze,
            letterSpacing: '0.42em',
            marginTop: '8px',
            fontWeight: '600',
          }}>
            {tpl.slogan.split('').join(' ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {displayAddress && (
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
              {displayAddress}
            </div>
          )}
          {state.managerComment && (
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '24px',
              fontStyle: 'italic',
              color: C.white,
              marginTop: '10px',
              lineHeight: '1.4',
              maxWidth: '440px',
              textAlign: 'right',
            }}>
              {state.managerComment}
            </div>
          )}
        </div>
      </div>

      {/* ── APARTMENT TYPE ── */}
      <div style={{
        height: `${H_TITLE}px`,
        backgroundColor: C.ivory,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${C.greige}`,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '42px',
          color: C.navy,
          letterSpacing: '0.12em',
          fontWeight: '500',
        }}>
          {typeName}
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div style={{
        height: `${H_INFO}px`,
        backgroundColor: C.beige,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {([
          state.block ? `Блок ${state.block}` : null,
          state.apartment ? `Кв. ${state.apartment}` : null,
          floors.length > 0 ? `Этажи ${formatFloors(floors)}` : null,
          area > 0 ? `${area.toFixed(2)} м²` : null,
          state.ceilingHeight > 0 ? `Потолки ${state.ceilingHeight.toFixed(2)} м` : null,
        ] as (string | null)[]).filter(Boolean).map((item, i, arr) => (
          <span key={i} style={{ fontSize: '25px', color: C.navy, letterSpacing: '0.03em', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
            {item}
            {i < arr.length - 1 && (
              <span style={{ color: C.bronze, margin: '0 20px', fontWeight: '400' }}>|</span>
            )}
          </span>
        ))}
      </div>

      {/* ── MAIN: floorplan (70% width) on top, financial below ── */}
      <div style={{ height: `${H_MAIN}px`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        {/* Floorplan — 70% of the card width, object-fit: contain, never crop */}
        <div style={{
          height: `${H_FLOORPLAN}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0 6px',
          flexShrink: 0,
        }}>
          <div style={{
            width: `${FLOORPLAN_W}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {state.planImage ? (
              <img
                src={state.planImage}
                alt="Планировка"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${C.greige}`,
                borderRadius: '4px',
                color: C.bronze,
                gap: '12px',
              }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={C.bronze} strokeWidth="1">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
                <div style={{ fontSize: '16px', letterSpacing: '0.15em', color: C.bronze }}>ПЛАНИРОВКА</div>
                <div style={{ fontSize: '13px', color: 'rgba(181,146,76,0.6)', letterSpacing: '0.06em' }}>Загрузите планировку квартиры</div>
              </div>
            )}
          </div>
        </div>

        {/* Financial blocks */}
        <div style={{
          flex: 1,
          minHeight: 0,
          padding: '12px 40px 20px',
          overflow: 'hidden',
        }}>
          {useUniversalCalc && <UniversalFinancialSection state={state} colors={C} />}
          {showLegacyGrid && <ImperialFinancialSection pricing={pricing} colors={C} />}
          {!useUniversalCalc && !showLegacyGrid && (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px dashed ${C.greige}`,
              borderRadius: '4px',
              color: 'rgba(181,146,76,0.7)',
              fontSize: '16px',
              letterSpacing: '0.08em',
              textAlign: 'center',
              padding: '20px',
            }}>
              Укажите цену за м² —<br />расчёт появится автоматически
            </div>
          )}
        </div>
      </div>

      {/* ── SITE PLAN ── */}
      <SitePlanSection
        customSitePlan={state.customSitePlan}
        anchorX={state.anchorX}
        anchorY={state.anchorY}
        viewWest={state.viewWest}
        viewNorth={state.viewNorth}
        viewEast={state.viewEast}
        viewSouth={state.viewSouth}
        rayWidth={state.rayWidth}
        rayOpacity={state.rayOpacity}
        height={H_SITEPLAN}
        compassOrientation={state.compassOrientation}
        colors={C}
      />

      {/* ── ADVANTAGES ── */}
      <AdvantagesSection advantages={tpl.advantages} height={H_ADVANTAGES} colors={C} />

      {/* ── FOOTER ── */}
      <div style={{
        height: `${H_FOOTER}px`,
        backgroundColor: C.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        flexShrink: 0,
        borderTop: `2px solid ${C.bronze}`,
      }}>
        <div style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: '1.5',
          maxWidth: '600px',
        }}>
          {tpl.disclaimer.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '32px',
            color: C.white,
            letterSpacing: '0.2em',
            fontWeight: '500',
          }}>
            {tpl.shortName}
          </div>
          <div style={{
            fontSize: '12px',
            color: C.bronze,
            letterSpacing: '0.32em',
            marginTop: '5px',
            fontWeight: '600',
          }}>
            {tpl.slogan}
          </div>
        </div>
      </div>
    </div>
  )
})

CardTemplate.displayName = 'CardTemplate'
export default CardTemplate
