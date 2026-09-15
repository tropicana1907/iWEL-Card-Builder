'use client'

import { useRef, useState, useEffect } from 'react'
import type { AppState, ProjectPreset, CompassOrientation } from '@/types'
import { fmt, parseArea as _parseArea, calcForward, suggestDownPayment } from '@/lib/calculator'
const parseArea = (s: string) => typeof _parseArea === 'function' ? _parseArea(s) : (parseFloat(s.replace(',', '.')) || 0)
import { APARTMENT_TYPES } from '@/config/constants'
import { imperialTemplate } from '@/projectTemplates/imperial'
import { towersTemplate } from '@/projectTemplates/towers'
import { saveApartment, loadApartments, loadApartmentWithPlan, loadProjectSitePlan } from '@/lib/storage'
import type { ApartmentEntry } from '@/types'

const fmtNum = (n: number) =>
  n > 0 ? n.toLocaleString('ru-RU').replace(/ /g, ' ') : ''

interface Props {
  state: AppState
  onChange: (updates: Partial<AppState>) => void
  onOpenSitePlanEditor: () => void
  onBack: () => void
  onMsg?: (msg: string) => void
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

const COMPASS_PRESETS: Record<string, CompassOrientation & { label: string }> = {
  imperial: { label: 'Империал (З=верх)', northAngle: 0, eastAngle: 90, southAngle: 180, westAngle: 270 },
  standard: { label: 'Стандарт (С=верх)', northAngle: 270, eastAngle: 0, southAngle: 90, westAngle: 180 },
}

export default function OfferBuilderPanel({ state, onChange, onOpenSitePlanEditor, onBack, onMsg }: Props) {
  const planFileRef = useRef<HTMLInputElement>(null)
  const area = parseArea(state.area)
  const locked = state.productionLock

  // Live calculation — fully standalone, no dependency on offerCalcResult from quick calculator
  const pricePerSqm = state.offerPricePerSqm || 0
  const months = state.offerMonths || 36
  const dp = state.downPayment
  const liveCalc = area > 0 && pricePerSqm > 0 ? calcForward(area, pricePerSqm, dp, months) : null

  // Local state for formatted DP input
  const [dpInputStr, setDpInputStr] = useState(() => fmtNum(state.downPayment))
  useEffect(() => {
    setDpInputStr(state.downPayment > 0 ? fmtNum(state.downPayment) : '')
  }, [state.downPayment])

  // Apartment library picker
  const [showAptPicker, setShowAptPicker] = useState(false)
  const [savedApts, setSavedApts] = useState<ApartmentEntry[]>([])

  const handleOpenAptPicker = () => {
    const all = loadApartments()
    const forProject = state.projectTemplate !== 'none' ? all.filter(a => a.projectId === state.projectTemplate) : all
    setSavedApts(forProject.length > 0 ? forProject : all)
    setShowAptPicker(true)
  }

  const handleSelectApartment = (apt: ApartmentEntry) => {
    const full = loadApartmentWithPlan(apt)
    onChange({
      block: full.block,
      apartment: full.apartment,
      area: String(full.area),
      type: full.type,
      floors: full.floors,
      ceilingHeight: full.ceilingHeight,
      planImage: full.planImage,
      anchorX: full.anchorX,
      anchorY: full.anchorY,
      viewWest: full.viewWest,
      viewNorth: full.viewNorth,
      viewEast: full.viewEast,
      viewSouth: full.viewSouth,
    })
    setShowAptPicker(false)
    onMsg?.('Квартира загружена ✓')
  }

  const handleSaveApartment = () => {
    if (!area || !state.apartment) {
      onMsg?.('Укажите номер квартиры и площадь')
      return
    }
    saveApartment({
      id: `${state.projectTemplate}-b${state.block}-${state.apartment}`,
      projectId: state.projectTemplate,
      block: state.block,
      apartment: state.apartment,
      area,
      type: state.type,
      floors: state.floors,
      ceilingHeight: state.ceilingHeight,
      planImage: state.planImage,
      anchorX: state.anchorX,
      anchorY: state.anchorY,
      viewWest: state.viewWest,
      viewNorth: state.viewNorth,
      viewEast: state.viewEast,
      viewSouth: state.viewSouth,
      lastPricePerM2: state.offerPricePerSqm || undefined,
      savedAt: Date.now(),
    })
    onMsg?.('Квартира сохранена в библиотеку ✓')
  }

  const handlePlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      onChange({ planImage: ev.target?.result as string, planLocked: false })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const syncCalc = (a: number, p: number, d: number, m: number) => {
    if (a <= 0 || p <= 0) return null
    return calcForward(a, p, d, m)
  }

  const handleDpChange = (rawValue: string) => {
    setDpInputStr(rawValue)
    const newDP = parseFloat(rawValue.replace(/[\s ]/g, '')) || 0
    if (newDP < 0 || isNaN(newDP)) return
    const calc = syncCalc(area, pricePerSqm, newDP, months)
    onChange({ downPayment: newDP, offerCalcResult: calc })
  }

  const handlePriceChange = (rawValue: string) => {
    const p = parseFloat(rawValue.replace(/[\s ]/g, '')) || 0
    const calc = syncCalc(area, p, dp, months)
    onChange({ offerPricePerSqm: p, offerCalcResult: calc })
  }

  const handleMonthsChange = (value: string) => {
    const m = parseInt(value, 10) || 36
    const calc = syncCalc(area, pricePerSqm, dp, m)
    onChange({ offerMonths: m, offerCalcResult: calc })
  }

  return (
    <aside className="w-full lg:w-[380px] lg:h-full bg-white border-r border-imperial-greige flex flex-col overflow-hidden shadow-lg flex-shrink-0">
      {/* Header */}
      <div className="bg-imperial-navy px-5 py-4 flex-shrink-0">
        <div className="text-white font-serif text-xl tracking-[0.2em]">IWEL</div>
        <div className="text-imperial-bronze text-xs tracking-[0.3em] mt-1 uppercase">Конструктор коммерческого предложения</div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* ── ПРОЕКТ ── */}
        <Divider label="Проект" />

        <div className="mb-3">
          <Label>Шаблон проекта</Label>
          <div className="flex gap-1.5">
            {([
              { v: 'imperial' as ProjectPreset, l: 'Империал' },
              { v: 'towers' as ProjectPreset, l: 'Башни' },
              { v: 'none' as ProjectPreset, l: 'Свой' },
            ]).map(({ v, l }) => (
              <button
                key={v}
                disabled={locked}
                onClick={() => {
                  if (locked) return
                  const tpl = v === 'imperial' ? imperialTemplate : v === 'towers' ? towersTemplate : null
                  const savedSitePlan = v !== 'none' ? loadProjectSitePlan(v) : null
                  onChange({
                    projectTemplate: v,
                    address: tpl?.address ?? state.address,
                    compassOrientation: tpl?.compassOrientation ?? state.compassOrientation,
                    ceilingHeight: tpl?.defaultCeilingHeight ?? state.ceilingHeight,
                    ...(savedSitePlan !== null ? { customSitePlan: savedSitePlan } : {}),
                  })
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                  ${state.projectTemplate === v
                    ? 'bg-imperial-bronze text-white border-imperial-bronze'
                    : 'border-imperial-greige text-imperial-navy hover:border-imperial-bronze'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <Label>Адрес проекта</Label>
          <input
            type="text"
            value={state.address}
            onChange={e => onChange({ address: e.target.value })}
            disabled={locked}
            placeholder="Каспийск, Каспийское шоссе, 1А"
            className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze disabled:opacity-50 disabled:bg-imperial-ivory"
          />
        </div>

        <div className="mb-3">
          <Label>Комментарий менеджера</Label>
          <textarea
            value={state.managerComment}
            onChange={e => onChange({ managerComment: e.target.value })}
            placeholder="Современный дом для больших планов..."
            rows={2}
            className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze resize-none"
          />
        </div>

        {/* ── КВАРТИРА ── */}
        <Divider label="Квартира" />

        <div className="mb-3">
          <button
            onClick={handleOpenAptPicker}
            className="w-full py-2.5 border border-imperial-bronze rounded text-xs text-imperial-bronze hover:bg-imperial-beige transition-colors font-semibold tracking-wide"
          >
            📂 ВЫБРАТЬ СОХРАНЁННУЮ КВАРТИРУ
          </button>
        </div>

        {showAptPicker && (
          <div className="mb-3 border border-imperial-greige rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-imperial-ivory border-b border-imperial-greige">
              <span className="text-xs font-semibold text-imperial-navy uppercase tracking-wide">Сохранённые квартиры</span>
              <button onClick={() => setShowAptPicker(false)} className="text-gray-400 hover:text-imperial-navy text-base leading-none">×</button>
            </div>
            {savedApts.length === 0 ? (
              <div className="py-4 text-xs text-gray-400 text-center">Нет сохранённых квартир</div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {savedApts.map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => handleSelectApartment(apt)}
                    className="w-full text-left px-3 py-2.5 border-b border-imperial-greige last:border-0 hover:bg-imperial-ivory transition-colors"
                  >
                    <div className="text-xs font-semibold text-imperial-navy">
                      Блок {apt.block} · кв. {apt.apartment} · {apt.area} м²
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {apt.type} · {apt.ceilingHeight} м
                      {apt.lastPricePerM2 ? ` · ${apt.lastPricePerM2.toLocaleString('ru-RU')} ₽/м²` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
              placeholder="142"
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
                onClick={() => onChange({ type: t })}
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
              inputMode="decimal"
              value={state.area}
              onChange={e => {
                const newArea = parseArea(e.target.value)
                const isDpDefault = dp === 0 || dp === 1_000_000 || dp === 2_500_000
                const newDp = isDpDefault ? suggestDownPayment(newArea) : dp
                const calc = newArea > 0 && pricePerSqm > 0 ? calcForward(newArea, pricePerSqm, newDp, months) : null
                onChange({ area: e.target.value, downPayment: newDp, offerCalcResult: calc })
              }}
              placeholder="82.88"
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
            {area > 0 && (
              <div className="text-xs text-imperial-bronze mt-1">{area.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} м²</div>
            )}
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
            placeholder="7, 11, 12"
            className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
          />
        </div>

        {/* ── РАСЧЁТ ── */}
        <Divider label="Расчёт" />

        {/* Price per m² — always the primary input */}
        <div className="mb-3">
          <Label>Цена за м²</Label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={pricePerSqm > 0 ? String(pricePerSqm) : ''}
              onChange={e => handlePriceChange(e.target.value)}
              placeholder="115 000"
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₽/м²</span>
          </div>
        </div>

        {/* Live results block */}
        {liveCalc && (
          <div className="bg-imperial-ivory rounded-md p-3 border border-imperial-greige mb-3 space-y-2">
            {/* Total price */}
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-500">Полная стоимость</span>
              <span className="text-sm font-bold text-imperial-navy">{fmt(liveCalc.totalPrice)}</span>
            </div>

            {state.type !== 'Студия' && (
              <>
                {/* DP input */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Первоначальный взнос</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dpInputStr}
                    onChange={e => handleDpChange(e.target.value)}
                    onBlur={() => setDpInputStr(state.downPayment > 0 ? fmtNum(state.downPayment) : '')}
                    placeholder="1 000 000"
                    className="w-full border border-imperial-greige rounded px-2 py-1.5 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
                  />
                  {area >= 85 && state.downPayment > 0 && state.downPayment < 2_500_000 && (
                    <div className="text-xs text-imperial-bronze mt-0.5">Мин. взнос 2 500 000 ₽</div>
                  )}
                  {state.downPayment > 0 && liveCalc.totalPrice > 0 && state.downPayment >= liveCalc.totalPrice && (
                    <div className="text-xs text-red-500 mt-0.5">Взнос не может превышать стоимость</div>
                  )}
                </div>

                {/* Remaining */}
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">Остаток</span>
                  <span className="text-sm text-imperial-navy">{fmt(liveCalc.remainingBalance)}</span>
                </div>

                {/* Monthly */}
                <div className="flex justify-between items-baseline border-t border-imperial-greige pt-1.5">
                  <span className="text-xs text-gray-500">Платёж/мес × {months} мес</span>
                  <span className="text-base font-bold text-imperial-bronze">{fmt(liveCalc.monthlyPayment)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Months — visible when price entered and not studio */}
        {liveCalc && state.type !== 'Студия' && (
          <div className="mb-3">
            <Label>Срок рассрочки, мес</Label>
            <input
              type="number"
              inputMode="numeric"
              value={months}
              min="1"
              max="240"
              onChange={e => handleMonthsChange(e.target.value)}
              className="w-full border border-imperial-greige rounded px-3 py-2 text-sm text-imperial-navy focus:outline-none focus:border-imperial-bronze"
            />
          </div>
        )}

        {/* ── ПЛАНИРОВКА ── */}
        <Divider label="Планировка" />

        <input
          ref={planFileRef}
          type="file"
          accept="image/*,.webp,.svg"
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
                  🔒
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
            <span className="text-xs text-gray-400">PNG, JPG, WEBP, SVG — pixel perfect</span>
          </button>
        )}

        {/* ── ГЕНПЛАН И ВИДЫ ── */}
        <Divider label="Расположение и вид" />

        {state.customSitePlan && (
          <div className="mb-3 border border-imperial-greige rounded overflow-hidden bg-imperial-ivory h-28 flex items-center justify-center relative">
            <img src={state.customSitePlan} alt="Генплан" className="max-w-full max-h-full object-contain" />
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white bg-opacity-80 px-1.5 py-0.5 rounded">
              {state.projectTemplate !== 'none' ? state.projectTemplate.toUpperCase() : 'генплан'}
            </div>
          </div>
        )}

        <button
          onClick={onOpenSitePlanEditor}
          className="w-full py-3 bg-imperial-ivory border border-imperial-bronze rounded text-imperial-bronze text-sm font-semibold hover:bg-imperial-beige transition-colors mb-2 tracking-wide"
        >
          🎯 Указать квартиру на генплане
        </button>

        {state.anchorX !== null && (
          <div className="text-xs text-center text-green-600 mb-3">
            ✓ Точка задана: {state.anchorX.toFixed(1)}% / {state.anchorY?.toFixed(1)}%
          </div>
        )}

        <div className="mb-3">
          <Label>Вид из окон</Label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'viewWest', label: 'Запад' },
              { key: 'viewNorth', label: 'Север' },
              { key: 'viewEast', label: 'Восток' },
              { key: 'viewSouth', label: 'Юг' },
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

        <div className="mb-3">
          <Label>Ориентация компаса</Label>
          <div className="flex gap-2">
            {Object.entries(COMPASS_PRESETS).map(([key, preset]) => {
              const isActive = state.compassOrientation?.northAngle === preset.northAngle
              return (
                <button
                  key={key}
                  disabled={locked}
                  onClick={() => !locked && onChange({ compassOrientation: preset })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${isActive
                      ? 'bg-imperial-navy text-white border-imperial-navy'
                      : 'border-imperial-greige text-imperial-navy hover:border-imperial-navy'
                    }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── СОХРАНЕНИЕ ── */}
        <Divider label="Сохранение" />

        <button
          onClick={handleSaveApartment}
          className="w-full py-2.5 border border-imperial-greige rounded text-xs text-imperial-navy hover:border-imperial-bronze transition-colors mb-3 font-semibold"
        >
          💾 Сохранить квартиру в библиотеку
        </button>

        {/* ── РЕЖИМ ── */}
        <button
          onClick={() => onChange({ productionLock: !state.productionLock })}
          className={`w-full py-2.5 rounded text-sm font-semibold border transition-colors mb-4
            ${state.productionLock
              ? 'bg-imperial-navy text-white border-imperial-navy'
              : 'border-imperial-greige text-imperial-navy hover:border-imperial-navy'
            }`}
        >
          {state.productionLock ? '🔒 РЕЖИМ МЕНЕДЖЕРА — Снять' : '🔓 Включить режим менеджера'}
        </button>
      </div>
    </aside>
  )
}
