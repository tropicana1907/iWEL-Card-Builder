'use client'

import { forwardRef } from 'react'
import type { AppState, PricingResult } from '@/types'
import { DIRECTION_ANGLES, RAY_HALF_ANGLES, TYPE_DISPLAY } from '@/config/constants'
import { AdvantageIcon } from './Icons'
import type { ProjectTemplate } from '@/projectTemplates/types'
import { imperialTemplate } from '@/projectTemplates/imperial'

// Inlined to avoid module initialization race with calculator.ts
const fmt = (p: number) => p <= 0 ? '—' : new Intl.NumberFormat('ru-RU').format(p) + ' ₽'
const parseArea = (s: string) => parseFloat(s.replace(',', '.')) || 0
const parseFloors = (s: string) => s.split(/[,\s]+/).map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n) && n > 0)
const formatFloors = (fs: number[]) => fs.length === 0 ? '—' : fs.join(' · ')

// ─── colours (inline for html-to-image) ──────────────────────────────────────
const C = {
  navy: '#1B2D4F',
  bronze: '#B5924C',
  ivory: '#FAF8F3',
  beige: '#F0EBE3',
  greige: '#E5DDD4',
  white: '#FFFFFF',
}

// ─── Ray geometry ─────────────────────────────────────────────────────────────
function buildSectorPath(
  cx: number, cy: number,
  angleDeg: number, halfAngleDeg: number,
  length: number
): string {
  const a1 = ((angleDeg - halfAngleDeg) * Math.PI) / 180
  const a2 = ((angleDeg + halfAngleDeg) * Math.PI) / 180
  const x1 = cx + length * Math.cos(a1)
  const y1 = cy + length * Math.sin(a1)
  const x2 = cx + length * Math.cos(a2)
  const y2 = cy + length * Math.sin(a2)
  const large = halfAngleDeg * 2 > 180 ? 1 : 0
  return `M${cx},${cy} L${x1},${y1} A${length},${length} 0 ${large},1 ${x2},${y2} Z`
}

// ─── Financial block (Imperial style) ─────────────────────────────────────────
interface FinancialBlockProps {
  number: string
  title: string
  pricePerSqm: string
  total: string
  totalLabel?: string
  downPayment?: string
  downPaymentLabel?: string
  monthly?: string
  monthsLabel?: string
  accent?: boolean
  height: number
}

function FinancialBlock({ number, title, pricePerSqm, total, totalLabel = 'Стоимость', downPayment, downPaymentLabel, monthly, monthsLabel, accent = false, height }: FinancialBlockProps) {
  const bg = accent ? '#EEE9E1' : C.beige
  const hasInstallment = !!downPayment

  return (
    <div style={{
      height,
      backgroundColor: bg,
      borderRadius: '3px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '3px',
      borderLeft: `3px solid ${C.bronze}`,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: C.bronze, letterSpacing: '0.05em' }}>
          {number}
        </span>
        <span style={{ fontSize: '11px', color: C.navy, letterSpacing: '0.12em', fontWeight: '600', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: '13px', color: C.bronze, letterSpacing: '0.05em', marginTop: '2px' }}>
        {pricePerSqm}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '3px' }}>
        <div style={{ fontSize: '10px', color: 'rgba(27,45,79,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {totalLabel}
        </div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: C.navy, letterSpacing: '0.02em' }}>
          {total}
        </div>
      </div>
      {hasInstallment && (
        <>
          <div style={{ borderTop: `1px solid ${C.greige}`, margin: '3px 0' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '9px', color: 'rgba(27,45,79,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {downPaymentLabel ?? 'Первоначальный взнос'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.navy }}>
                {downPayment}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'rgba(27,45,79,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {monthsLabel ?? 'Ежемесячно ≈'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.navy }}>
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
function UniversalFinancialSection({ state, mainHeight }: { state: AppState; mainHeight: number }) {
  const calc = state.offerCalcResult
  const isStudio = state.type === 'Студия'
  const isReverse = state.offerCalcMode === 'reverse'
  const months = state.offerMonths || 36
  const ppm = state.offerPricePerSqm

  if (!calc) return null

  if (isStudio) {
    return (
      <FinancialBlock
        number="01"
        title="СТОИМОСТЬ"
        pricePerSqm={ppm > 0 ? `${ppm.toLocaleString('ru-RU')} ₽/м²` : ''}
        total={fmt(calc.totalPrice)}
        height={mainHeight - 40}
      />
    )
  }

  const h = Math.floor((mainHeight - 40 - 12) / 2)

  return (
    <>
      <FinancialBlock
        number="01"
        title="ПОЛНАЯ СТОИМОСТЬ"
        pricePerSqm={ppm > 0 ? `${ppm.toLocaleString('ru-RU')} ₽/м²` : ''}
        total={fmt(calc.totalPrice)}
        height={h}
      />
      <FinancialBlock
        number="02"
        title={`РАССРОЧКА ${months} МЕС`}
        pricePerSqm={isReverse ? 'рассчитан необходимый взнос' : ''}
        total={fmt(calc.remainingBalance)}
        totalLabel="Остаток"
        downPayment={fmt(isReverse ? calc.requiredDownPayment : calc.requiredDownPayment)}
        downPaymentLabel={isReverse ? 'Необходимый взнос' : 'Первоначальный взнос'}
        monthly={fmt(calc.monthlyPayment)}
        monthsLabel="Ежемесячный платёж ≈"
        accent
        height={h + 12}
      />
    </>
  )
}

// ─── Imperial pricing blocks ───────────────────────────────────────────────────
function ImperialFinancialSection({ pricing, mainHeight }: { pricing: PricingResult; mainHeight: number }) {
  const { isStudio } = pricing

  if (isStudio) {
    return (
      <>
        <FinancialBlock
          number="01"
          title="100% ОПЛАТА"
          pricePerSqm="85 000 ₽/м²"
          total={fmt(pricing.cashPrice)}
          height={Math.floor((mainHeight - 40 - 12) / 2)}
        />
        <FinancialBlock
          number="02"
          title="СВО — 100% ОПЛАТА"
          pricePerSqm="80 000 ₽/м²"
          total={fmt(pricing.svoCashPrice)}
          accent
          height={Math.floor((mainHeight - 40 - 12) / 2)}
        />
      </>
    )
  }

  return (
    <>
      <FinancialBlock
        number="01"
        title="100% ОПЛАТА"
        pricePerSqm="85 000 ₽/м²"
        total={fmt(pricing.cashPrice)}
        height={Math.floor((mainHeight - 40 - 48) / 4)}
      />
      <FinancialBlock
        number="02"
        title="РАССРОЧКА ДО 36 МЕС"
        pricePerSqm="115 000 ₽/м²"
        total={fmt(pricing.installmentPrice - pricing.downPayment)}
        totalLabel="Остаток"
        downPayment={fmt(pricing.downPayment)}
        monthly={fmt(pricing.monthlyInstallment)}
        monthsLabel="Ежемесячный платёж ≈"
        height={Math.floor((mainHeight - 40 - 48) / 4) + 36}
      />
      <FinancialBlock
        number="03"
        title="СВО — 100% ОПЛАТА"
        pricePerSqm="80 000 ₽/м²"
        total={fmt(pricing.svoCashPrice)}
        accent
        height={Math.floor((mainHeight - 40 - 48) / 4)}
      />
      <FinancialBlock
        number="04"
        title="СВО — РАССРОЧКА ДО 36 МЕС"
        pricePerSqm="110 000 ₽/м²"
        total={fmt(pricing.svoInstallmentPrice - pricing.downPayment)}
        totalLabel="Остаток"
        downPayment={fmt(pricing.downPayment)}
        monthly={fmt(pricing.svoMonthlyInstallment)}
        monthsLabel="Ежемесячный платёж ≈"
        accent
        height={Math.floor((mainHeight - 40 - 48) / 4) + 36}
      />
    </>
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
}

function SitePlanSection(props: SitePlanProps) {
  const { customSitePlan, anchorX, anchorY, viewWest, viewNorth, viewEast, viewSouth,
    rayWidth, rayOpacity, height, compassOrientation } = props

  const W = 1080
  const H = height

  const ax = anchorX !== null ? (anchorX / 100) * W : null
  const ay = anchorY !== null ? (anchorY / 100) * H : null

  const halfAngle = RAY_HALF_ANGLES[rayWidth] ?? 30
  const rayLen = Math.sqrt(W * W + H * H)
  const rayColor = `rgba(215,195,155,${rayOpacity / 100})`

  // Use custom compass orientation if provided, else Imperial default
  const compass = compassOrientation ?? {
    northAngle: DIRECTION_ANGLES.NORTH,
    eastAngle: DIRECTION_ANGLES.EAST,
    southAngle: DIRECTION_ANGLES.SOUTH,
    westAngle: DIRECTION_ANGLES.WEST,
  }

  const views = [
    { key: 'west', angle: compass.westAngle, active: viewWest },
    { key: 'north', angle: compass.northAngle, active: viewNorth },
    { key: 'east', angle: compass.eastAngle, active: viewEast },
    { key: 'south', angle: compass.southAngle, active: viewSouth },
  ]

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

      {ax !== null && ay !== null && (
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
        >
          {views.filter(v => v.active).map(v => {
            const path = buildSectorPath(ax, ay, v.angle, halfAngle, rayLen)
            return (
              <path
                key={v.key}
                d={path}
                fill={rayColor}
                stroke="rgba(181,146,76,0.3)"
                strokeWidth="1"
              />
            )
          })}
          <circle cx={ax} cy={ay} r="7" fill={C.bronze} opacity="0.9" />
          <circle cx={ax} cy={ay} r="3" fill={C.white} />
        </svg>
      )}
    </div>
  )
}

// ─── Advantages section ────────────────────────────────────────────────────────
function AdvantagesSection({ advantages, height }: {
  advantages: { id: number; icon: string; line1: string; line2: string; line3?: string }[]
  height: number
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
        fontSize: '13px',
        letterSpacing: '0.22em',
        color: C.navy,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: '14px',
        borderBottom: `1px solid ${C.bronze}`,
        paddingBottom: '10px',
      }}>
        Ключевые преимущества
      </div>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '8px',
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
            borderRadius: '3px',
          }}>
            <AdvantageIcon name={adv.icon} size={28} color={C.bronze} />
            <div style={{ marginTop: '6px', fontSize: '11px', color: C.navy, lineHeight: '1.35', letterSpacing: '0.02em' }}>
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
  const area = parseArea(state.area)
  const floors = parseFloors(state.floors)
  const typeName = TYPE_DISPLAY[state.type] ?? state.type.toUpperCase()
  const useUniversalCalc = state.offerCalcResult !== null

  // Pixel-exact heights that sum to 1920
  const H_HEADER    = 190
  const H_TITLE     = 68
  const H_INFO      = 48
  const H_MAIN      = 700
  const H_SITEPLAN  = 400
  const H_ADVANTAGES = 374
  const H_FOOTER    = 140
  // total = 1920 ✓

  const displayAddress = state.address || tpl.address

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: C.ivory,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      }}>
        <div>
          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '48px',
            color: C.white,
            letterSpacing: '0.28em',
            fontWeight: '400',
          }}>
            {tpl.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: C.bronze,
            letterSpacing: '0.45em',
            marginTop: '6px',
          }}>
            {tpl.slogan.split('').join(' ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {displayAddress && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
              {displayAddress}
            </div>
          )}
          {state.managerComment && (
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              color: C.white,
              marginTop: '10px',
              lineHeight: '1.5',
              maxWidth: '340px',
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
          fontFamily: 'Georgia, serif',
          fontSize: '26px',
          color: C.navy,
          letterSpacing: '0.18em',
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
          floors.length > 0 ? `Этажи ${formatFloors(floors)}` : null,
          area > 0 ? `${area.toFixed(2)} м²` : null,
          state.ceilingHeight > 0 ? `Потолки ${state.ceilingHeight.toFixed(2)} м` : null,
        ] as (string | null)[]).filter(Boolean).map((item, i, arr) => (
          <span key={i} style={{ fontSize: '15px', color: C.navy, letterSpacing: '0.04em' }}>
            {item}
            {i < arr.length - 1 && (
              <span style={{ color: C.bronze, margin: '0 20px' }}>|</span>
            )}
          </span>
        ))}
      </div>

      {/* ── MAIN: floorplan + financial ── */}
      <div style={{ height: `${H_MAIN}px`, display: 'flex', flexShrink: 0 }}>
        {/* Floorplan — pixel perfect, object-fit: contain, never crop */}
        <div style={{
          width: '512px',
          height: `${H_MAIN}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          borderRight: `1px solid ${C.greige}`,
          flexShrink: 0,
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
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={C.bronze} strokeWidth="1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              <div style={{ fontSize: '13px', letterSpacing: '0.15em', color: C.bronze }}>ПЛАНИРОВКА</div>
              <div style={{ fontSize: '11px', color: 'rgba(181,146,76,0.6)', letterSpacing: '0.06em' }}>Загрузите планировку квартиры</div>
            </div>
          )}
        </div>

        {/* Financial blocks */}
        <div style={{
          width: '568px',
          height: `${H_MAIN}px`,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexShrink: 0,
        }}>
          {useUniversalCalc
            ? <UniversalFinancialSection state={state} mainHeight={H_MAIN} />
            : <ImperialFinancialSection pricing={pricing} mainHeight={H_MAIN} />
          }
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
      />

      {/* ── ADVANTAGES ── */}
      <AdvantagesSection advantages={tpl.advantages} height={H_ADVANTAGES} />

      {/* ── FOOTER ── */}
      <div style={{
        height: `${H_FOOTER}px`,
        backgroundColor: C.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: '1.6',
          maxWidth: '520px',
        }}>
          {tpl.disclaimer.split('\n').map((line, i) => (
            <span key={i}>{line}{i < tpl.disclaimer.split('\n').length - 1 && <br />}</span>
          ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: C.white,
            letterSpacing: '0.22em',
          }}>
            {tpl.shortName}
          </div>
          <div style={{
            fontSize: '10px',
            color: C.bronze,
            letterSpacing: '0.35em',
            marginTop: '4px',
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
