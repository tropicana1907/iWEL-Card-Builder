'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import UniversalCalculator from '@/components/UniversalCalculator'
import OfferBuilderPanel from '@/components/OfferBuilderPanel'
import CardTemplate from '@/components/CardTemplate'
import SitePlanEditor from '@/components/SitePlanEditor'
import PricingConditions from '@/components/PricingConditions'
import PrepaymentCalculator from '@/components/PrepaymentCalculator'
import { calculatePrices, parseArea } from '@/lib/calculator'
import { exportToPNG, exportToJPG, exportToPDF, exportForWhatsApp, exportToClipboard } from '@/lib/export'
import { saveState, loadState, savePlan, findPlan, saveProjectSitePlan, loadProjectSitePlan } from '@/lib/storage'
import { getTemplate } from '@/projectTemplates'
import { CARD_WIDTH, CARD_HEIGHT } from '@/config/card'
import type { AppState, CalcVariant, CalcResult } from '@/types'
import { imperialTemplate } from '@/projectTemplates/imperial'

type AppMode = 'offer' | 'calculator' | 'conditions' | 'prepayment'

// ── Pricing reference panel (cheat-sheet visible next to card on desktop) ──────
const REF_DATA: Record<string, { title: string; tag?: string; rows: { label: string; r: string; f: string; t: string; svo?: boolean }[] }[]> = {
  imperial: [{ title: 'ИМПЕРИАЛ', tag: 'ПВ 30%', rows: [
    { label: 'Стандарт до 70 м²', r: '110', f: '90', t: '24 мес' },
    { label: 'Стандарт от 70 м²', r: '105', f: '90', t: '36 мес' },
    { label: 'СВО до 70 м²', svo: true, r: '105', f: '85', t: '24 мес' },
    { label: 'СВО от 70 м²', svo: true, r: '95', f: '85', t: '36 мес' },
  ]}],
  towers: [
    { title: 'Блоки 1–3 (до 16 эт)', tag: 'ПВ 30%', rows: [
      { label: '44 м²', r: '115', f: '110', t: '12 мес' },
      { label: '≥60 м²', r: '115', f: '110', t: '24 мес' },
      { label: '44 м² · СВО', svo: true, r: '110', f: '105', t: '12 мес' },
      { label: '≥60 м² · СВО', svo: true, r: '110', f: '105', t: '24 мес' },
    ]},
    { title: '16 этаж', rows: [
      { label: '44 м²', r: '110', f: '95', t: '12 мес' },
      { label: '70 м²', r: '110', f: '95', t: '24 мес' },
      { label: '44 м² · СВО', svo: true, r: '105', f: '90', t: '12 мес' },
      { label: '70 м² · СВО', svo: true, r: '105', f: '90', t: '24 мес' },
    ]},
    { title: 'Блок 5 (≥86 м²)', rows: [
      { label: 'Стандарт', r: '105', f: '95', t: '36 мес' },
      { label: 'СВО', svo: true, r: '95', f: '90', t: '36 мес' },
    ]},
  ],
  'azur-prime': [{ title: 'AZUR PRIME', tag: 'ПВ 30% · 24 мес', rows: [
    { label: 'Стандарт', r: '180', f: '150', t: '24 мес' },
    { label: 'СВО', svo: true, r: '175', f: '145', t: '24 мес' },
  ]}],
  'azur-residence': [{ title: 'AZUR Residence', tag: 'ПВ 30% · 24 мес', rows: [
    { label: 'Стандарт', r: '180', f: '150', t: '24 мес' },
    { label: 'СВО', svo: true, r: '175', f: '145', t: '24 мес' },
  ]}],
}

function PricingRefPanel({ project }: { project: string }) {
  const sections = REF_DATA[project] ?? REF_DATA['imperial']
  return (
    <div style={{ width: 228, background: 'white', borderRadius: 8, border: '1px solid #E5DDD4', overflow: 'hidden', fontSize: 11, boxShadow: '0 2px 16px rgba(27,45,79,0.12)' }}>
      <div style={{ background: '#1B2D4F', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#B5924C', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Шпаргалка · Условия</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>тыс ₽/м²</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 42px', background: '#F0EBE3', padding: '3px 10px', gap: 2, borderBottom: '1px solid #E5DDD4' }}>
        {['Категория', 'Р', '100%', 'Срок'].map((h, i) => (
          <span key={i} style={{ color: '#6B7A91', fontWeight: 700, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      {sections.map((sec, si) => (
        <div key={si}>
          <div style={{ background: '#1B2D4F', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 10 }}>{sec.title}</span>
            {sec.tag && <span style={{ color: '#B5924C', fontSize: 9 }}>{sec.tag}</span>}
          </div>
          {sec.rows.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 42px', padding: '5px 10px', gap: 2, background: row.svo ? '#FDF6EC' : (ri % 2 === 0 ? 'white' : '#FAF8F3'), borderTop: '1px solid #E5DDD4' }}>
              <span style={{ color: row.svo ? '#B5924C' : '#1B2D4F', fontWeight: row.svo ? 600 : 400, fontSize: 10.5 }}>{row.label}</span>
              <span style={{ color: '#1B2D4F', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.r}</span>
              <span style={{ color: '#1B2D4F', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.f}</span>
              <span style={{ color: '#6B7A91', textAlign: 'right' }}>{row.t}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ padding: '5px 10px', background: '#F0EBE3', borderTop: '1px solid #E5DDD4', fontSize: 9.5, color: '#B5924C', fontWeight: 600 }}>
        Р = Рассрочка · 100% = Полная оплата
      </div>
    </div>
  )
}

const DEFAULT_STATE: AppState = {
  block: 5,
  apartment: '',
  type: '2-комнатная',
  area: '',
  floors: '',
  ceilingHeight: 3.10,
  downPayment: 1_000_000,
  planImage: null,
  planLocked: false,
  anchorX: null,
  anchorY: null,
  viewWest: false,
  viewNorth: false,
  viewEast: false,
  viewSouth: false,
  rayWidth: 'MEDIUM',
  rayOpacity: 25,
  showSitePlanEditor: false,
  productionLock: false,
  customSitePlan: null,
  projectTemplate: 'imperial',
  address: imperialTemplate.address,
  managerComment: '',
  offerCalcResult: null,
  offerPricePerSqm: 0,
  offerMonths: 36,
  offerCalcMode: 'forward',
  offerPaymentMode: 'installment',
  hasTerrace: false,
  compassOrientation: imperialTemplate.compassOrientation,
}

function TabBar({ mode, onModeChange }: { mode: AppMode; onModeChange: (m: AppMode) => void }) {
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => onModeChange('offer')}
        className={`px-4 py-1.5 text-xs font-bold rounded tracking-wide transition-colors border
          ${mode === 'offer'
            ? 'bg-imperial-navy text-white border-imperial-navy'
            : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-bronze'
          }`}
      >
        КОНСТРУКТОР КП
      </button>
      <button
        onClick={() => onModeChange('calculator')}
        className={`px-4 py-1.5 text-xs font-bold rounded tracking-wide transition-colors border
          ${mode === 'calculator'
            ? 'bg-imperial-navy text-white border-imperial-navy'
            : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-bronze'
          }`}
      >
        БЫСТРЫЙ РАСЧЁТ
      </button>
      <button
        onClick={() => onModeChange('conditions')}
        className={`px-4 py-1.5 text-xs font-bold rounded tracking-wide transition-colors border
          ${mode === 'conditions'
            ? 'bg-imperial-bronze text-white border-imperial-bronze'
            : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-bronze'
          }`}
      >
        УСЛОВИЯ
      </button>
      <button
        onClick={() => onModeChange('prepayment')}
        className={`px-4 py-1.5 text-xs font-bold rounded tracking-wide transition-colors border
          ${mode === 'prepayment'
            ? 'bg-imperial-navy text-white border-imperial-navy'
            : 'bg-transparent text-imperial-navy border-imperial-greige hover:border-imperial-bronze'
          }`}
      >
        ПЕРЕСЧЁТ
      </button>
    </div>
  )
}

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>('offer')
  const [state, setState] = useState<AppState>(DEFAULT_STATE)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')
  const [previewScale, setPreviewScale] = useState(0.38)
  const [mobileScale, setMobileScale] = useState(0.34)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const previewAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = loadState()
    const template = (saved.projectTemplate as string) || 'imperial'
    const sitePlan = loadProjectSitePlan(template)
    setState(prev => ({ ...prev, ...saved, customSitePlan: sitePlan }))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => saveState(state), 500)
    return () => clearTimeout(timer)
  }, [state])

  useEffect(() => {
    if (state.projectTemplate !== 'none') {
      saveProjectSitePlan(state.projectTemplate, state.customSitePlan)
    }
  }, [state.customSitePlan, state.projectTemplate])

  useEffect(() => {
    const area = parseArea(state.area)
    if (!area || state.planLocked) return
    const plan = findPlan(state.block, area)
    if (plan && !state.planImage) {
      setState(prev => ({ ...prev, planImage: plan.image }))
    }
  }, [state.block, state.area, state.planLocked, state.planImage])

  useEffect(() => {
    const updateScale = () => {
      if (!previewAreaRef.current) return
      const availW = previewAreaRef.current.clientWidth - 48
      const availH = previewAreaRef.current.clientHeight - 48
      setPreviewScale(Math.min(availW / CARD_WIDTH, availH / CARD_HEIGHT, 0.48))
      // Mobile fullscreen preview: fit card width to the actual screen
      // (v1 hardcoded 0.34 — the card overflowed on narrow phones)
      setMobileScale(Math.min((window.innerWidth - 24) / CARD_WIDTH, 0.4))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const update = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const area = parseArea(state.area)
  const pricing = calculatePrices(area, state.type, state.downPayment)
  const template = getTemplate(state.projectTemplate)

  const buildFilename = () => {
    const apt = state.apartment ? `-${state.apartment}` : ''
    const areaStr = area > 0 ? `-${area.toFixed(2)}` : ''
    const proj = state.projectTemplate !== 'none' ? state.projectTemplate : 'iwel'
    return `${proj}-b${state.block}${apt}${areaStr}`
  }

  const validateForExport = (): string[] => {
    const missing: string[] = []
    if (!area) missing.push('площадь')
    // Price is required unless the Imperial legacy price grid is in use —
    // it is the only template with official hardcoded prices on the card
    const usingLegacyImperialGrid = !state.offerCalcResult && state.projectTemplate === 'imperial'
    if (!state.offerCalcResult && !usingLegacyImperialGrid) missing.push('цена за м²')
    if (!state.type) missing.push('тип квартиры')
    if (!state.planImage) missing.push('планировку квартиры')
    if (!state.floors) missing.push('этаж')
    if (!state.customSitePlan) missing.push('генплан')
    if (state.anchorX === null) missing.push('точку вида')
    const hasView = state.viewWest || state.viewNorth || state.viewEast || state.viewSouth
    if (!hasView) missing.push('направление вида')
    return missing
  }

  const doExport = async (format: 'png' | 'jpg' | 'pdf' | 'whatsapp' | 'clipboard') => {
    if (!cardRef.current || exporting) return
    if (format !== 'clipboard') {
      const missing = validateForExport()
      if (missing.length > 0) {
        setExportMsg(`Заполните: ${missing.join(' • ')}`)
        setTimeout(() => setExportMsg(''), 6000)
        return
      }
    }
    setExporting(true)
    setExportMsg('Генерация...')
    try {
      const name = buildFilename()
      if (format === 'png') await exportToPNG(cardRef.current, name)
      else if (format === 'jpg') await exportToJPG(cardRef.current, name)
      else if (format === 'pdf') await exportToPDF(cardRef.current, name)
      else if (format === 'whatsapp') await exportForWhatsApp(cardRef.current, name)
      else if (format === 'clipboard') {
        const r = await exportToClipboard(cardRef.current, name)
        setExportMsg(r === 'fallback'
          ? 'Не удалось скопировать. PNG сохранён.'
          : 'Скопировано ✓')
        return
      }
      setExportMsg('Готово ✓')
    } catch (err) {
      setExportMsg('Ошибка экспорта')
      console.error(err)
    } finally {
      setExporting(false)
      setTimeout(() => setExportMsg(''), 3000)
    }
  }

  const handleSavePlanToLibrary = () => {
    if (!state.planImage || !area) return
    const ok = savePlan({ id: `b${state.block}-${area}`, block: state.block, area, type: state.type, image: state.planImage })
    setExportMsg(ok ? 'Планировка сохранена ✓' : 'Ошибка: хранилище браузера переполнено')
    setTimeout(() => setExportMsg(''), 4000)
  }

  const handleCreateOffer = (variant: CalcVariant, calcResult: CalcResult) => {
    const ppm = parseFloat(variant.pricePerSqm) || 0
    const months = parseInt(variant.months, 10) || 36
    const suggestedTemplate = variant.preset !== 'none' ? variant.preset : 'imperial'
    const tpl = getTemplate(suggestedTemplate)
    const savedSitePlan = loadProjectSitePlan(suggestedTemplate)
    update({
      type: variant.type,
      area: variant.area,
      projectTemplate: suggestedTemplate,
      address: tpl.address,
      compassOrientation: tpl.compassOrientation,
      ceilingHeight: tpl.defaultCeilingHeight,
      offerCalcResult: calcResult,
      offerPricePerSqm: ppm,
      offerMonths: months,
      offerCalcMode: variant.mode,
      downPayment: calcResult.requiredDownPayment,
      ...(savedSitePlan ? { customSitePlan: savedSitePlan } : {}),
    })
    setMode('offer')
  }

  // ── CONDITIONS MODE ──
  if (mode === 'conditions') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5DDD4',
          padding: '10px 16px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TabBar mode={mode} onModeChange={setMode} />
        </div>
        <PricingConditions />
      </div>
    )
  }

  // ── PREPAYMENT MODE ──
  if (mode === 'prepayment') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: '-webkit-fill-available' }}>
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5DDD4',
          padding: '10px 16px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TabBar mode={mode} onModeChange={setMode} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          <PrepaymentCalculator />
        </div>
      </div>
    )
  }

  // ── CALCULATOR MODE ──
  if (mode === 'calculator') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: '-webkit-fill-available' }}>
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E5DDD4',
          padding: '10px 16px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TabBar mode={mode} onModeChange={setMode} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          <UniversalCalculator onCreateOffer={handleCreateOffer} />
        </div>
      </div>
    )
  }

  // ── OFFER BUILDER MODE (DEFAULT) ──
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile: tab bar at top */}
      <div className="lg:hidden bg-white border-b border-imperial-greige px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <TabBar mode={mode} onModeChange={setMode} />
      </div>

      {/* Main layout: form left + preview right */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden bg-imperial-beige">
        {/* Left: Offer builder panel */}
        <OfferBuilderPanel
          state={state}
          onChange={update}
          onOpenSitePlanEditor={() => update({ showSitePlanEditor: true })}
          onBack={() => setMode('calculator')}
          onMsg={(msg) => { setExportMsg(msg); setTimeout(() => setExportMsg(''), 4000) }}
        />

        {/* Right: Preview + toolbar */}
        <div className="flex-1 flex flex-col lg:overflow-hidden">
          {/* Top bar: tabs (desktop) + export buttons */}
          <div className="bg-white border-b border-imperial-greige px-4 py-3 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
            {/* Desktop tabs */}
            <div className="hidden lg:flex items-center gap-3">
              <TabBar mode={mode} onModeChange={setMode} />
              <span className="text-xs text-gray-400">{Math.round(previewScale * 100)}%</span>
            </div>

            {/* Export controls */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {exportMsg && (
                <span className={`text-xs font-semibold px-3 py-1 rounded ${
                  exportMsg.includes('Ошибка') ? 'text-red-600' : 'text-green-600'
                }`}>
                  {exportMsg}
                </span>
              )}
              {state.planImage && area > 0 && (
                <button
                  onClick={handleSavePlanToLibrary}
                  className="px-3 py-1.5 text-xs border border-imperial-greige rounded text-imperial-navy hover:border-imperial-bronze transition-colors"
                >
                  💾 В библиотеку
                </button>
              )}
              <button
                onClick={() => doExport('clipboard')}
                disabled={exporting}
                className="px-3 py-1.5 text-xs border border-imperial-greige rounded text-imperial-navy hover:border-imperial-bronze transition-colors disabled:opacity-50"
              >
                📋
              </button>
              <button
                onClick={() => doExport('whatsapp')}
                disabled={exporting}
                className="px-3 py-1.5 text-xs border border-imperial-greige rounded text-imperial-navy hover:border-imperial-bronze transition-colors disabled:opacity-50"
              >
                📱 WA
              </button>
              <button
                onClick={() => doExport('png')}
                disabled={exporting}
                className="px-4 py-1.5 bg-imperial-navy text-white text-xs font-semibold rounded hover:opacity-90 disabled:opacity-50"
              >
                PNG
              </button>
              <button
                onClick={() => doExport('jpg')}
                disabled={exporting}
                className="px-4 py-1.5 bg-imperial-navy text-white text-xs font-semibold rounded hover:opacity-90 disabled:opacity-50"
              >
                JPG
              </button>
              <button
                onClick={() => doExport('pdf')}
                disabled={exporting}
                className="px-4 py-1.5 bg-imperial-bronze text-white text-xs font-semibold rounded hover:opacity-90 disabled:opacity-50"
              >
                PDF
              </button>
            </div>
          </div>

          {/* Preview area — desktop always visible; mobile accessible via CTA button */}
          <div
            ref={previewAreaRef}
            className="h-[760px] lg:flex-1 lg:h-auto overflow-hidden lg:overflow-auto flex items-start justify-center p-6 relative"
            style={{ backgroundColor: '#D8D2C8' }}
          >
            <div style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              flexShrink: 0,
            }}>
              <CardTemplate
                ref={cardRef}
                state={state}
                pricing={pricing}
                template={template}
              />
            </div>
            <div style={{ height: `${Math.round(CARD_HEIGHT * previewScale)}px`, width: 0, flexShrink: 0 }} />
            {/* Pricing cheat-sheet panel — visible on xl+ when offer mode and project selected */}
            {mode === 'offer' && state.projectTemplate !== 'none' && (
              <div className="hidden xl:block absolute right-4 top-4">
                <PricingRefPanel project={state.projectTemplate} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: sticky CTA + fullscreen preview */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-white border-t border-imperial-greige shadow-lg">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="w-full py-3 bg-imperial-bronze text-white text-sm font-bold rounded uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          СФОРМИРОВАТЬ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ →
        </button>
      </div>

      {/* Mobile fullscreen preview */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#1B2D4F' }}>
          {/* Header */}
          <div className="bg-white flex items-center justify-between px-4 py-3 flex-shrink-0">
            <button
              onClick={() => setShowMobilePreview(false)}
              className="text-sm font-semibold text-imperial-navy flex items-center gap-1"
            >
              ← Назад
            </button>
            {exportMsg && (
              <span className={`text-xs font-semibold ${exportMsg.includes('Ошибка') ? 'text-red-600' : 'text-green-600'}`}>
                {exportMsg}
              </span>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ backgroundColor: '#D8D2C8' }}>
            <div style={{ transform: `scale(${mobileScale})`, transformOrigin: 'top center', flexShrink: 0 }}>
              <CardTemplate state={state} pricing={pricing} template={template} />
            </div>
            <div style={{ height: `${Math.round(CARD_HEIGHT * mobileScale)}px`, width: 0, flexShrink: 0 }} />
          </div>

          {/* Export actions */}
          <div className="bg-white flex-shrink-0 p-4 flex flex-col gap-2">
            <button
              onClick={() => { doExport('pdf'); }}
              disabled={exporting}
              className="w-full py-3 bg-imperial-bronze text-white text-sm font-bold rounded uppercase tracking-wider disabled:opacity-50"
            >
              СКАЧАТЬ PDF
            </button>
            <button
              onClick={() => { doExport('png'); }}
              disabled={exporting}
              className="w-full py-3 border-2 border-imperial-navy text-imperial-navy text-sm font-bold rounded uppercase tracking-wider disabled:opacity-50"
            >
              СКАЧАТЬ PNG
            </button>
            <button
              onClick={() => { doExport('whatsapp'); }}
              disabled={exporting}
              className="w-full py-2.5 border border-imperial-greige text-imperial-navy text-sm rounded tracking-wide disabled:opacity-50"
            >
              📱 Отправить в WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Site plan editor modal */}
      {state.showSitePlanEditor && (
        <SitePlanEditor
          anchorX={state.anchorX}
          anchorY={state.anchorY}
          views={{
            west: state.viewWest,
            north: state.viewNorth,
            east: state.viewEast,
            south: state.viewSouth,
          }}
          rayWidth={state.rayWidth}
          rayOpacity={state.rayOpacity}
          customSitePlan={state.customSitePlan}
          compassOrientation={state.compassOrientation}
          onSave={(anchorX, anchorY, views, rayWidth, rayOpacity) => {
            update({
              anchorX,
              anchorY,
              viewWest: views.west,
              viewNorth: views.north,
              viewEast: views.east,
              viewSouth: views.south,
              rayWidth,
              rayOpacity,
              showSitePlanEditor: false,
            })
          }}
          onUploadSitePlan={(dataUrl) => update({ customSitePlan: dataUrl })}
          onClose={() => update({ showSitePlanEditor: false })}
        />
      )}
    </div>
  )
}
