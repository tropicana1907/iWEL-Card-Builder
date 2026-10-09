'use client'

import { useEffect, useMemo, useState } from 'react'
import data from '@/data/availability.json'
import { floorPlanFor, planPosition, aptView } from '@/config/floorPlans'

// Availability snapshot built from the Bitrix chessboards (scripts/availability).
// Only apartment number, block, floor, area and status — no buyer data.

export type AptStatus = 'free' | 'reserved' | 'sold' | 'not_for_sale'
export interface AvailabilityApt {
  block: string
  floor: number
  apt: string
  area: number
  status: AptStatus
  // Position №1–7 on floors with their own plans (matches the floorplan template «№N»)
  pos?: number
}
export type AvailabilityProject = 'imperial' | 'towers'

interface Snapshot {
  updatedAt: string
  projects: Record<string, { source: string; skipped: string[]; apartments: AvailabilityApt[] }>
}
const SNAPSHOT = data as Snapshot

const PROJECTS: { key: AvailabilityProject; label: string; blockWord: string }[] = [
  { key: 'imperial', label: 'Империал', blockWord: 'Блок' },
  { key: 'towers', label: 'Towers', blockWord: 'Корпус' },
]

const SIZE_FILTERS: { key: string; label: string; test: (a: number) => boolean }[] = [
  { key: 'all', label: 'Все', test: () => true },
  { key: 'studio', label: 'Студии', test: a => a < 30 },
  { key: 's50', label: '30–50 м²', test: a => a >= 30 && a < 50 },
  { key: 's70', label: '50–70 м²', test: a => a >= 50 && a < 70 },
  { key: 's90', label: '70–90 м²', test: a => a >= 70 && a < 90 },
  { key: 'big', label: 'от 90 м²', test: a => a >= 90 },
]

const STATUS_STYLE: Record<AptStatus, string> = {
  free: 'bg-white border-imperial-bronze text-imperial-navy hover:bg-imperial-bronze hover:text-white cursor-pointer',
  reserved: 'bg-amber-50 border-amber-300 text-amber-800 cursor-pointer',
  sold: 'bg-gray-100 border-gray-300 text-gray-500',
  not_for_sale: 'bg-gray-200 border-gray-200 text-gray-400',
}

// On the floor plan the apartments on sale wear the iWEL brand blue (iwel.ru: #5287E4)
const PLAN_STATUS_STYLE: Record<AptStatus, string> = {
  ...STATUS_STYLE,
  free: 'bg-[#5287E4] border-[#5287E4] text-white hover:bg-[#3f72cc] hover:border-[#3f72cc] cursor-pointer',
}

const VIEW_KEY = 'iwel_availability_view'
function loadView(): { project: AvailabilityProject; block: string | null; size: string; seaOnly: boolean; floor: number | null } {
  const fallback = { project: 'imperial' as AvailabilityProject, block: null, size: 'all', seaOnly: false, floor: null }
  try {
    const v = JSON.parse(localStorage.getItem(VIEW_KEY) || 'null')
    if (!v || !PROJECTS.some(p => p.key === v.project)) return fallback
    return {
      project: v.project,
      block: typeof v.block === 'string' ? v.block : null,
      size: SIZE_FILTERS.some(f => f.key === v.size) ? v.size : 'all',
      seaOnly: v.seaOnly === true,
      floor: typeof v.floor === 'number' ? v.floor : null,
    }
  } catch {
    return fallback
  }
}

const fmtArea = (a: number) => a.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
const fmtDate = (iso: string) => iso.split('-').reverse().join('.')
const aptNum = (s: string) => parseFloat(s.replace('/', '.')) || 0

export default function AvailabilityView({ onPick }: {
  onPick: (project: AvailabilityProject, apt: AvailabilityApt) => void
}) {
  // Remember the last view — the tab unmounts on every switch (owner: «вернулась — а там уже Империал»)
  const [saved] = useState(loadView)
  const [project, setProject] = useState<AvailabilityProject>(saved.project)
  const [block, setBlock] = useState<string | null>(saved.block)
  const [size, setSize] = useState(saved.size)
  const [seaOnly, setSeaOnly] = useState(saved.seaOnly)
  const [planFloor, setPlanFloor] = useState<number | null>(saved.floor)
  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, JSON.stringify({ project, block, size, seaOnly, floor: planFloor })) } catch {}
  }, [project, block, size, seaOnly, planFloor])

  const proj = SNAPSHOT.projects[project]
  const meta = PROJECTS.find(p => p.key === project)!
  const blocks = useMemo(
    () => Array.from(new Set((proj?.apartments ?? []).map(a => a.block))).sort((a, b) => aptNum(a) - aptNum(b)),
    [proj],
  )
  const activeBlock = block !== null && blocks.includes(block) ? block : blocks[0]
  const plan = activeBlock ? floorPlanFor(project, activeBlock) : null
  const isSea = (a: AvailabilityApt) => aptView(project, a.block, a.apt).some(v => v.sea)
  // The 🌊 mark is shown only on apartments still on sale — sold sea views would upset a client
  const showSea = (a: AvailabilityApt) => (a.status === 'free' || a.status === 'reserved') && isSea(a)
  const sizeOnly = SIZE_FILTERS.find(f => f.key === size)!.test
  const hasSea = !!plan && !!activeBlock && Object.values(plan.sides[activeBlock] ?? {}).some(sd => sd.sea)
  const sizeTest = (area: number, a?: AvailabilityApt) => sizeOnly(area) && (!hasSea || !seaOnly || !a || isSea(a))
  const viewText = (a: AvailabilityApt) => aptView(project, a.block, a.apt).map(v => v.label).join(' + ')

  const inBlock = (proj?.apartments ?? []).filter(a => a.block === activeBlock)
  const floors = Array.from(new Set(inBlock.map(a => a.floor))).sort((a, b) => b - a)
  const freeCount = (list: AvailabilityApt[]) => list.filter(a => a.status === 'free' && sizeTest(a.area, a)).length
  // Floor shown on the plan: the one picked, else the highest floor with a free apartment
  const shownFloor = plan
    ? (planFloor !== null && floors.includes(planFloor) ? planFloor
      : floors.find(f => inBlock.some(a => a.floor === f && a.status === 'free')) ?? floors[0])
    : null

  return (
    <div className="min-h-full bg-imperial-beige px-4 py-5 lg:px-10 lg:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h1 className="font-display text-2xl text-imperial-navy tracking-wide">Наличие квартир</h1>
          <div className="text-xs text-gray-500">
            Данные на {fmtDate(SNAPSHOT.updatedAt)}{proj ? ` · ${proj.source}` : ''}
          </div>
        </div>

        {/* Project */}
        <div className="flex gap-2 mb-3">
          {PROJECTS.map(p => (
            <button
              key={p.key}
              onClick={() => { setProject(p.key); setBlock(null) }}
              className={`px-4 py-2 rounded text-sm font-semibold border transition-colors
                ${project === p.key ? 'bg-imperial-navy text-white border-imperial-navy' : 'bg-white text-imperial-navy border-imperial-greige hover:border-imperial-bronze'}`}
            >
              {p.label}
              <span className={`ml-2 text-xs ${project === p.key ? 'text-white/70' : 'text-imperial-bronze'}`}>
                {freeCount(SNAPSHOT.projects[p.key]?.apartments ?? [])}
              </span>
            </button>
          ))}
        </div>

        {/* Blocks */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {blocks.map(b => {
            const n = freeCount((proj?.apartments ?? []).filter(a => a.block === b))
            return (
              <button
                key={b}
                onClick={() => setBlock(b)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors
                  ${activeBlock === b ? 'bg-imperial-bronze border-imperial-bronze text-white' : 'bg-white border-imperial-greige text-imperial-navy hover:border-imperial-bronze'}`}
              >
                {meta.blockWord} {b} · {n}
              </button>
            )
          })}
        </div>

        {/* Size filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SIZE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setSize(f.key)}
              className={`px-2.5 py-1 rounded border text-xs transition-colors
                ${size === f.key ? 'bg-imperial-navy text-white border-imperial-navy' : 'bg-white text-imperial-navy border-imperial-greige hover:border-imperial-navy'}`}
            >
              {f.label}
            </button>
          ))}
          {plan && activeBlock && Object.values(plan.sides[activeBlock] ?? {}).some(sd => sd.sea) && (
            <button
              onClick={() => setSeaOnly(v => !v)}
              className={`px-2.5 py-1 rounded border text-xs transition-colors
                ${seaOnly ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-700 border-sky-300 hover:border-sky-600'}`}
            >
              🌊 Вид на море
            </button>
          )}
        </div>

        <div className="text-sm text-imperial-navy mb-3">
          Свободно в {meta.blockWord.toLowerCase()}е {activeBlock}: <b>{freeCount(inBlock)}</b>
          <span className="text-gray-500"> из {inBlock.length}</span>
          <span className="text-gray-500 hidden sm:inline"> · нажмите на свободную квартиру, чтобы сделать КП</span>
        </div>

        {/* Floor plan of the picked floor */}
        {plan && shownFloor !== null && (
          <div className="bg-white rounded-lg border border-imperial-greige p-2 sm:p-3 mb-3">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-imperial-navy">План {shownFloor} этажа · {meta.blockWord.toLowerCase()} {activeBlock}</div>
              <div className="text-[11px] text-gray-500">нажмите на этаж в шахматке, чтобы сменить</div>
            </div>
            {(() => {
              const sides = plan.sides[activeBlock!]
              const sideCls = (s: { sea?: boolean }) => `text-[10px] sm:text-xs font-semibold tracking-wide ${s.sea ? 'text-sky-700' : 'text-gray-500'}`
              const onFloor = inBlock.filter(a => a.floor === shownFloor)
              return (
                <div className="grid grid-cols-[18px_1fr_18px] sm:grid-cols-[24px_1fr_24px] grid-rows-[auto_1fr_auto] gap-1 items-center">
                  <div />
                  <div className={`text-center ${sideCls(sides.top)}`}>{sides.top.sea ? '🌊 ' : '↑ '}{sides.top.label}</div>
                  <div />
                  <div className={`[writing-mode:vertical-rl] rotate-180 text-center ${sideCls(sides.left)}`}>{sides.left.sea ? '🌊 ' : ''}{sides.left.label}</div>
                  <div className="relative w-full" style={{ aspectRatio: String(plan.aspect) }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={plan.image} alt={`План этажа, ${meta.blockWord.toLowerCase()} ${activeBlock}`} className="absolute inset-0 w-full h-full object-contain rounded" />
                    {onFloor.map(a => {
                      const p = planPosition(plan, a.apt)
                      if (!p) return null
                      const clickable = a.status === 'free' || a.status === 'reserved'
                      const dim = a.status === 'free' && !sizeTest(a.area, a)
                      return (
                        <button
                          key={a.apt}
                          disabled={!clickable}
                          onClick={() => clickable && onPick(project, a)}
                          title={`Кв. ${a.apt} · ${fmtArea(a.area)} м² · окна: ${viewText(a)}`}
                          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w ?? plan.badge.w}%`, height: `${plan.badge.h}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-md border-2 leading-tight text-center shadow-md
                            ${PLAN_STATUS_STYLE[a.status]} ${dim ? 'opacity-40' : ''}`}
                        >
                          <div className="text-[9px] sm:text-[11px] font-bold whitespace-nowrap">
                            <span className="hidden sm:inline">{showSea(a) ? '🌊' : ''}№</span>{a.apt}
                          </div>
                          <div className="hidden sm:block text-[10px] whitespace-nowrap">{fmtArea(a.area)} м²</div>
                        </button>
                      )
                    })}
                  </div>
                  <div className={`[writing-mode:vertical-rl] text-center ${sideCls(sides.right)}`}>{sides.right.sea ? '🌊 ' : ''}{sides.right.label}</div>
                  <div />
                  <div className={`text-center ${sideCls(sides.bottom)}`}>↓ {sides.bottom.label}</div>
                  <div />
                </div>
              )
            })()}
          </div>
        )}

        {/* Floors */}
        <div className="bg-white rounded-lg border border-imperial-greige p-2 sm:p-3 overflow-x-auto">
          <div className="min-w-max space-y-1">
            {floors.map(fl => {
              const apts = inBlock.filter(a => a.floor === fl).sort((a, b) => aptNum(a.apt) - aptNum(b.apt))
              return (
                <div key={fl} className="flex items-stretch gap-1">
                  {plan ? (
                    <button
                      onClick={() => setPlanFloor(fl)}
                      title="Показать план этажа"
                      className={`w-10 shrink-0 text-[11px] flex items-center justify-end pr-1 rounded underline decoration-dotted
                        ${fl === shownFloor ? 'text-imperial-bronze font-bold' : 'text-gray-500 hover:text-imperial-navy'}`}
                    >
                      {fl} эт
                    </button>
                  ) : (
                    <div className="w-10 shrink-0 text-[11px] text-gray-500 flex items-center justify-end pr-1">{fl} эт</div>
                  )}
                  {apts.map(a => {
                    const dim = a.status === 'free' && !sizeTest(a.area, a)
                    const clickable = a.status === 'free' || a.status === 'reserved'
                    const view = viewText(a)
                    return (
                      <button
                        key={a.apt + '-' + a.floor}
                        disabled={!clickable}
                        onClick={() => clickable && onPick(project, a)}
                        title={`Кв. ${a.apt} · ${fmtArea(a.area)} м² · ${fl} этаж${view ? ` · окна: ${view}` : ''}`}
                        className={`w-[58px] sm:w-[68px] shrink-0 rounded border px-1 py-1 text-left leading-tight transition-colors
                          ${STATUS_STYLE[a.status]} ${dim ? 'opacity-30' : ''}`}
                      >
                        <div className="text-[11px] font-semibold">№{a.apt}{plan && showSea(a) ? ' 🌊' : ''}</div>
                        <div className="text-[10px]">{fmtArea(a.area)} м²</div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-imperial-bronze bg-white" />Свободна</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-amber-300 bg-amber-50" />Бронь</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />Продана</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" />Не продаётся</span>
          {hasSea && <span className="flex items-center gap-1">🌊 Окна на море</span>}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Статус взят из шахматки в Битриксе на дату выше. Перед бронью уточните у отдела продаж.
        </p>
      </div>
    </div>
  )
}
