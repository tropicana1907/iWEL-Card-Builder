'use client'

import { useState } from 'react'
import type { CalcVariant, CalcResult, ApartmentType, ProjectPreset, CalcMode } from '@/types'
import { parseArea as _parseArea, fmt, calcForward, calcReverse, suggestDownPayment, PRESET_PRICES } from '@/lib/calculator'
const parseArea = (s: string) => typeof _parseArea === 'function' ? _parseArea(s) : (parseFloat(s.replace(',', '.')) || 0)
import { APARTMENT_TYPES } from '@/config/constants'

const C = {
  navy: '#1B2D4F',
  bronze: '#B5924C',
  ivory: '#FAF8F3',
  beige: '#F0EBE3',
  greige: '#E5DDD4',
  green: '#22863a',
}

function makeVariant(id: string): CalcVariant {
  return {
    id,
    type: '2-комнатная',
    area: '',
    pricePerSqm: '',
    downPayment: '',
    months: '36',
    mode: 'forward',
    desiredMonthly: '',
    preset: 'none',
  }
}

function applyPreset(v: CalcVariant, preset: ProjectPreset): CalcVariant {
  const p = PRESET_PRICES[preset]
  const area = parseArea(v.area)
  const suggestedDp = area > 0 ? suggestDownPayment(area) : 1_000_000
  return {
    ...v,
    preset,
    pricePerSqm: preset === 'none' ? '' : String(p.pricePerSqm),
    months: String(p.maxMonths),
    downPayment: preset !== 'none' ? String(suggestedDp) : v.downPayment,
  }
}

function VariantCard({
  variant,
  index,
  canRemove,
  onChange,
  onRemove,
  onCreateOffer,
}: {
  variant: CalcVariant
  index: number
  canRemove: boolean
  onChange: (v: CalcVariant) => void
  onRemove: () => void
  onCreateOffer: (v: CalcVariant, r: CalcResult) => void
}) {
  const area = parseArea(variant.area)
  const pricePerSqm = parseFloat(variant.pricePerSqm) || 0
  const downPayment = parseFloat(variant.downPayment) || 0
  const months = parseInt(variant.months, 10) || 36
  const desiredMonthly = parseFloat(variant.desiredMonthly) || 0
  const isStudio = variant.type === 'Студия'

  const result = area > 0 && pricePerSqm > 0
    ? variant.mode === 'forward'
      ? calcForward(area, pricePerSqm, downPayment, months)
      : calcReverse(area, pricePerSqm, desiredMonthly, months)
    : null

  const areaNum = parseArea(variant.area)
  const suggestedDp = areaNum > 0 ? suggestDownPayment(areaNum) : null

  const set = (fields: Partial<CalcVariant>) => onChange({ ...variant, ...fields })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: `1.5px solid ${C.greige}`,
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '14px',
    color: C.navy,
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    color: C.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px',
    display: 'block',
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: `1.5px solid ${C.greige}`,
      padding: '20px',
      width: 'min(340px, calc(100vw - 28px))',
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 2px 12px rgba(27,45,79,0.07)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: C.navy, letterSpacing: '0.06em' }}>
          ВАРИАНТ {index + 1}
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(27,45,79,0.35)', fontSize: '18px', lineHeight: 1, padding: '0 4px',
          }}>×</button>
        )}
      </div>

      {/* Preset selector */}
      <div>
        <span style={labelStyle}>Проект</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['none', 'imperial', 'towers'] as ProjectPreset[]).map(p => (
            <button
              key={p}
              onClick={() => onChange(applyPreset(variant, p))}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: '6px',
                border: `1.5px solid ${variant.preset === p ? C.bronze : C.greige}`,
                backgroundColor: variant.preset === p ? C.bronze : 'transparent',
                color: variant.preset === p ? 'white' : C.navy,
                fontSize: '11px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.03em',
              }}
            >
              {PRESET_PRICES[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Тип квартиры */}
      <div>
        <span style={labelStyle}>Тип квартиры</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {APARTMENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => set({ type: t as ApartmentType })}
              style={{
                padding: '5px 8px', borderRadius: '5px',
                border: `1.5px solid ${variant.type === t ? C.navy : C.greige}`,
                backgroundColor: variant.type === t ? C.navy : 'transparent',
                color: variant.type === t ? 'white' : C.navy,
                fontSize: '11px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Area + Price/m² */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <span style={labelStyle}>Площадь, м²</span>
          <input
            style={inputStyle}
            type="text"
            value={variant.area}
            onChange={e => {
              const newArea = parseArea(e.target.value)
              const newDp = suggestDownPayment(newArea)
              set({
                area: e.target.value,
                downPayment: variant.downPayment || String(newDp),
              })
            }}
            placeholder="82.88"
          />
        </div>
        <div>
          <span style={labelStyle}>Цена ₽/м²</span>
          <input
            style={inputStyle}
            type="text"
            value={variant.pricePerSqm}
            onChange={e => set({ pricePerSqm: e.target.value })}
            placeholder="115 000"
          />
        </div>
      </div>

      {/* Mode toggle */}
      {!isStudio && (
        <div>
          <span style={labelStyle}>Режим расчёта</span>
          <div style={{ display: 'flex', gap: '0', borderRadius: '6px', overflow: 'hidden', border: `1.5px solid ${C.greige}` }}>
            {([
              { value: 'forward', label: '→ Платёж/мес' },
              { value: 'reverse', label: '← Нужный взнос' },
            ] as { value: CalcMode; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set({ mode: value })}
                style={{
                  flex: 1, padding: '8px 4px',
                  backgroundColor: variant.mode === value ? C.navy : 'transparent',
                  color: variant.mode === value ? 'white' : C.navy,
                  border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DP + Months (forward mode) or Desired monthly (reverse mode) */}
      {!isStudio && (
        variant.mode === 'forward' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={labelStyle}>Взнос, ₽</span>
              <input
                style={inputStyle}
                type="text"
                value={variant.downPayment}
                onChange={e => set({ downPayment: e.target.value })}
                placeholder="1 000 000"
              />
              {suggestedDp && variant.downPayment !== String(suggestedDp) && (
                <div
                  style={{ fontSize: '10px', color: C.bronze, marginTop: '3px', cursor: 'pointer' }}
                  onClick={() => set({ downPayment: String(suggestedDp) })}
                >
                  Рекомендуется: {fmt(suggestedDp)}
                </div>
              )}
            </div>
            <div>
              <span style={labelStyle}>Срок, мес</span>
              <input
                style={inputStyle}
                type="number"
                value={variant.months}
                min="1"
                max="240"
                onChange={e => set({ months: e.target.value })}
                placeholder="36"
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={labelStyle}>Платёж/мес, ₽</span>
              <input
                style={inputStyle}
                type="text"
                value={variant.desiredMonthly}
                onChange={e => set({ desiredMonthly: e.target.value })}
                placeholder="150 000"
              />
            </div>
            <div>
              <span style={labelStyle}>Срок, мес</span>
              <input
                style={inputStyle}
                type="number"
                value={variant.months}
                min="1"
                max="240"
                onChange={e => set({ months: e.target.value })}
                placeholder="36"
              />
            </div>
          </div>
        )
      )}

      {/* Results */}
      {result && (
        <div style={{
          backgroundColor: '#F4F1EB',
          borderRadius: '8px',
          padding: '14px',
          border: `1px solid ${C.greige}`,
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: C.navy, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Результат
          </div>
          <ResultRow label="Полная стоимость" value={fmt(result.totalPrice)} bold />
          {!isStudio && (
            <>
              {variant.mode === 'forward' ? (
                <>
                  <ResultRow label="Остаток" value={fmt(result.remainingBalance)} />
                  <ResultRow label="Платёж/мес" value={fmt(result.monthlyPayment)} highlight />
                </>
              ) : (
                <>
                  <ResultRow label="Нужный взнос" value={fmt(result.requiredDownPayment)} highlight />
                  <ResultRow label="Остаток по рассрочке" value={fmt(result.remainingBalance)} />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Create offer button */}
      {result && (
        <button
          onClick={() => result && onCreateOffer(variant, result)}
          style={{
            width: '100%', padding: '12px',
            backgroundColor: C.bronze, color: 'white',
            border: 'none', borderRadius: '8px',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          Создать КП →
        </button>
      )}
    </div>
  )
}

function ResultRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(27,45,79,0.65)' }}>{label}</span>
      <span style={{
        fontSize: highlight ? '16px' : bold ? '14px' : '13px',
        fontWeight: highlight || bold ? '700' : '500',
        color: highlight ? C.bronze : C.navy,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
    </div>
  )
}

interface Props {
  onCreateOffer: (variant: CalcVariant, result: CalcResult) => void
}

let nextId = 2

export default function UniversalCalculator({ onCreateOffer }: Props) {
  const [variants, setVariants] = useState<CalcVariant[]>([makeVariant('1')])

  const addVariant = () => {
    setVariants(prev => [...prev, makeVariant(String(nextId++))])
  }

  const updateVariant = (id: string, v: CalcVariant) => {
    setVariants(prev => prev.map(x => x.id === id ? v : x))
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(x => x.id !== id))
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F0EBE3',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: C.navy,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '0.15em', fontFamily: 'Georgia, serif' }}>
            IWEL
          </div>
          <div style={{ color: C.bronze, fontSize: '11px', letterSpacing: '0.3em', marginTop: '2px' }}>
            SALES CALCULATOR + OFFER BUILDER
          </div>
        </div>
      </div>

      {/* Variants area */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'auto',
        padding: 'clamp(14px, 4vw, 32px)',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
      }}>
        {variants.map((v, i) => (
          <VariantCard
            key={v.id}
            variant={v}
            index={i}
            canRemove={variants.length > 1}
            onChange={updated => updateVariant(v.id, updated)}
            onRemove={() => removeVariant(v.id)}
            onCreateOffer={onCreateOffer}
          />
        ))}

        {/* Add variant button */}
        <button
          onClick={addVariant}
          style={{
            width: '100px',
            minHeight: '200px',
            flexShrink: 0,
            border: `2px dashed ${C.greige}`,
            borderRadius: '12px',
            backgroundColor: 'transparent',
            color: C.bronze,
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            alignSelf: 'stretch',
          }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>+</span>
          <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Вариант
          </span>
        </button>
      </div>
    </div>
  )
}
