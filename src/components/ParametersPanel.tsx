'use client'

import { useRef } from 'react'
import type { AppState, PricingResult, ApartmentType, RayWidth } from '@/types'
import { fmt, parseArea } from '@/lib/calculator'
import { APARTMENT_TYPES } from '@/config/constants'

interface Props {
  state: AppState
  pricing: PricingResult
  onChange: (updates: Partial<AppState>) => void
  onOpenSitePlanEditor: () => void
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-imperial-navy uppercase tracking-widest mb-1.5">
      {children}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-imperial-greige" />
      <span className="text-xs text-imperial-bronze font-semibold uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-imperial-greige" />
    </div>
  )
}

function PriceRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-imperial-greige last:border-0">
      <span className="text-xs text-gray-500 leading-snug">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-imperial-navy tabular-nums">{value}</span>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
    </div>
  )
}

export default function ParametersPanel({ state, pricing, onChange, onOpenSitePlanEditor }: Props) {
  const planFileRef = useRef<HTMLInputElement>(null)

  const handlePlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      onChange({ planImage: dataUrl, planLocked: false })
    }
    reader.readAsDataURL(file)
  }

  const area = parseArea(state.area)

  return (
    <aside className="w-[380px] h-screen bg-white border-r border-imperial-greige flex flex-col overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-imperial-navy px-5 py-4 flex-shrink-0">
        <div className="text-white font-serif text-xl tracking-[0.2em]">ИМПЕРИАЛ</div>
        <div className="text-imperial-bronze text-xs tracking-[0.4em] mt-1">CARD BUILDER</div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* ── КВАРТИРА ── */}
        <Divider label="Квартира" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label>Блок</Label>
            <div className="flex gap-1 flex-wrap">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => onChange({ block: n })}
                  className={`w-9 h-9 rounded text-sm font-bold border transition-colors
                    ${state.block === n
                      ? 'bg-imperial-navy text-white border-imperial-navy'
                      : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-navy'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Номер квартиры</Label>
            <input
              type="text"
              value={state.apartment}
              onChange={e => onChange({ apartment: e.target.value })}
              placeholder="Напр. 142"
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
          </div>
        </div>

        <div className="mb-3">
          <Label>Тип квартиры</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {APARTMENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => onChange({ type: t as ApartmentType })}
                className={`py-1.5 px-2 rounded text-xs font-semibold border transition-colors
                  ${state.type === t
                    ? 'bg-imperial-navy text-white border-imperial-navy'
                    : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-navy'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label>Площадь, м²</Label>
            <input
              type="text"
              value={state.area}
              onChange={e => onChange({ area: e.target.value })}
              placeholder="82.88"
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
          </div>
          <div>
            <Label>Высота потолков, м</Label>
            <input
              type="number"
              step="0.01"
              value={state.ceilingHeight}
              onChange={e => onChange({ ceilingHeight: parseFloat(e.target.value) || 3.10 })}
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
          </div>
        </div>

        <div className="mb-3">
          <Label>Этажи (через запятую)</Label>
          <input
            type="text"
            value={state.floors}
            onChange={e => onChange({ floors: e.target.value })}
            placeholder="Напр. 2, 8 или 7, 11, 12"
            className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
          />
        </div>

        <div className="mb-3">
          <Label>Положение в блоке</Label>
          <div className="flex gap-1.5">
            {([
              { v: 'start', l: 'Начало' },
              { v: 'middle', l: 'Середина' },
              { v: 'end', l: 'Конец' },
              { v: 'custom', l: 'Вручную' },
            ] as const).map(({ v, l }) => (
              <button
                key={v}
                onClick={() => onChange({ position: v })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors
                  ${state.position === v
                    ? 'bg-imperial-bronze text-white border-imperial-bronze'
                    : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-bronze'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── ЦЕНЫ ── */}
        <Divider label="Цены" />

        {area > 0 ? (
          <div className="bg-imperial-ivory rounded-md p-3 space-y-0 border border-imperial-greige mb-3">
            <PriceRow label="100% оплата" value={fmt(pricing.cashPrice)} />
            {!pricing.isStudio && (
              <PriceRow
                label="Рассрочка 36 мес"
                value={fmt(pricing.installmentPrice)}
                sub={`≈ ${fmt(pricing.monthlyInstallment)}/мес`}
              />
            )}
            <PriceRow label="СВО — 100%" value={fmt(pricing.svoCashPrice)} />
            {!pricing.isStudio && (
              <PriceRow
                label="СВО — рассрочка"
                value={fmt(pricing.svoInstallmentPrice)}
                sub={`≈ ${fmt(pricing.svoMonthlyInstallment)}/мес`}
              />
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center py-3 mb-3">
            Введите площадь для расчёта
          </div>
        )}

        {!pricing.isStudio && (
          <div className="mb-3">
            <Label>Первоначальный взнос, ₽</Label>
            <input
              type="number"
              value={state.downPayment}
              onChange={e => onChange({ downPayment: parseInt(e.target.value) || 1000000 })}
              step="100000"
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
          </div>
        )}

        {/* ── ПЛАНИРОВКА ── */}
        <Divider label="Планировка" />

        <input
          ref={planFileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePlanUpload}
        />

        {state.planImage ? (
          <div className="mb-3">
            <div className="relative border border-imperial-greige rounded overflow-hidden bg-imperial-ivory h-40 flex items-center justify-center mb-2">
              <img
                src={state.planImage}
                alt="Планировка"
                className="max-w-full max-h-full object-contain"
              />
              {state.planLocked && (
                <div className="absolute top-1 right-1 bg-imperial-bronze text-white text-xs px-1.5 py-0.5 rounded">
                  🔒 Locked
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => !state.productionLock && planFileRef.current?.click()}
                disabled={state.productionLock}
                className="flex-1 py-2 text-xs border border-imperial-greige rounded text-imperial-navy hover:border-imperial-bronze transition-colors disabled:opacity-40"
              >
                Заменить
              </button>
              <button
                onClick={() => !state.productionLock && onChange({ planLocked: !state.planLocked })}
                disabled={state.productionLock}
                className={`flex-1 py-2 text-xs rounded font-semibold transition-colors disabled:opacity-40
                  ${state.planLocked
                    ? 'bg-imperial-bronze text-white'
                    : 'border border-imperial-bronze text-imperial-bronze'
                  }`}
              >
                {state.planLocked ? '🔒 Разблокировать' : '🔒 Заблокировать'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => planFileRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-imperial-greige rounded text-imperial-bronze text-sm hover:border-imperial-bronze transition-colors mb-3 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs font-semibold tracking-wider uppercase">Загрузить планировку</span>
            <span className="text-xs text-gray-400">PNG, JPG, SVG</span>
          </button>
        )}

        {/* ── ГЕНПЛАН И ВИДЫ ── */}
        <Divider label="Генплан и виды" />

        <div className="mb-3">
          <Label>Направления обзора</Label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'viewWest', label: 'Запад (вверх)' },
              { key: 'viewNorth', label: 'Север (вправо)' },
              { key: 'viewEast', label: 'Восток (вниз)' },
              { key: 'viewSouth', label: 'Юг (влево)' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onChange({ [key]: !state[key] })}
                className={`py-2 px-3 text-xs font-semibold rounded border transition-colors text-left
                  ${state[key]
                    ? 'bg-imperial-navy text-white border-imperial-navy'
                    : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-navy'
                  }`}
              >
                {state[key] ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <Label>Ширина лучей</Label>
          <div className="flex gap-2">
            {(['NARROW', 'MEDIUM', 'WIDE'] as const).map(w => (
              <button
                key={w}
                onClick={() => onChange({ rayWidth: w })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors
                  ${state.rayWidth === w
                    ? 'bg-imperial-navy text-white border-imperial-navy'
                    : 'border-imperial-greige text-imperial-navy hover:border-imperial-navy'
                  }`}
              >
                {w === 'NARROW' ? 'Узкий' : w === 'MEDIUM' ? 'Средний' : 'Широкий'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <Label>Прозрачность лучей: {state.rayOpacity}%</Label>
          <input
            type="range"
            min="5"
            max="80"
            value={state.rayOpacity}
            onChange={e => onChange({ rayOpacity: Number(e.target.value) })}
            className="w-full cursor-pointer"
          />
        </div>

        <button
          onClick={onOpenSitePlanEditor}
          className="w-full py-3 bg-imperial-ivory border border-imperial-bronze rounded text-imperial-bronze text-sm font-semibold hover:bg-imperial-beige transition-colors mb-2 tracking-wide"
        >
          🎯 Указать точку на генплане
        </button>

        {state.anchorX !== null && (
          <div className="text-xs text-center text-green-600 mb-3">
            ✓ Точка задана: {state.anchorX.toFixed(1)}% / {state.anchorY?.toFixed(1)}%
          </div>
        )}

        {/* ── ЗАЩИТА ── */}
        <Divider label="Режим" />

        <button
          onClick={() => onChange({ productionLock: !state.productionLock })}
          className={`w-full py-2.5 rounded text-sm font-semibold border transition-colors mb-4
            ${state.productionLock
              ? 'bg-red-600 text-white border-red-600'
              : 'border-imperial-greige text-imperial-navy hover:border-imperial-navy'
            }`}
        >
          {state.productionLock ? '🔒 PRODUCTION LOCK — Снять блокировку' : '🔓 Включить Production Lock'}
        </button>
      </div>
    </aside>
  )
}
