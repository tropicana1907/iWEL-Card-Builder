'use client'

import { useRef, useState, useCallback } from 'react'
import { DIRECTION_ANGLES, DIRECTION_LABELS, RAY_HALF_ANGLES } from '@/config/constants'
import type { RayWidth } from '@/types'

const C = {
  navy: '#1B2D4F',
  bronze: '#B5924C',
  ivory: '#FAF8F3',
  beige: '#F0EBE3',
  greige: '#E5DDD4',
}

function buildSectorPath(cx: number, cy: number, angleDeg: number, halfAngleDeg: number, length: number): string {
  const a1 = ((angleDeg - halfAngleDeg) * Math.PI) / 180
  const a2 = ((angleDeg + halfAngleDeg) * Math.PI) / 180
  const x1 = cx + length * Math.cos(a1)
  const y1 = cy + length * Math.sin(a1)
  const x2 = cx + length * Math.cos(a2)
  const y2 = cy + length * Math.sin(a2)
  return `M${cx},${cy} L${x1},${y1} A${length},${length} 0 0,1 ${x2},${y2} Z`
}

function PlaceholderSVG({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <rect width={width} height={height} fill="#EBE5DB" />
      <ellipse cx={width/2} cy={height/2} rx="130" ry="85" fill="#C9D8A9" opacity="0.7" />
      <rect x="0" y={height - 44} width={width} height="20" fill="#D3CBC0" />
      {/* Blocks */}
      {[
        { id: 1, x: 40, y: 60, w: 70, h: 160 },
        { id: 2, x: 155, y: 60, w: 70, h: 160 },
        { id: 3, x: 450, y: 60, w: 70, h: 160 },
        { id: 4, x: 565, y: 60, w: 70, h: 160 },
        { id: 5, x: 680, y: 40, w: 95, h: 200 },
      ].map(b => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#C5BCBA" stroke="#A09090" strokeWidth="1.5" />
          <text x={b.x + b.w/2} y={b.y + b.h/2 + 5} textAnchor="middle" fontSize="11" fill="#4A4040" fontFamily="system-ui" fontWeight="600">
            Блок {b.id}
          </text>
        </g>
      ))}
      {/* Compass */}
      <g transform={`translate(30,${height/2})`}>
        <circle cx="0" cy="0" r="18" fill="rgba(27,45,79,0.1)" />
        <text x="0" y="-22" textAnchor="middle" fontSize="9" fill="#1B2D4F" fontFamily="system-ui" fontWeight="700">З</text>
        <text x="22" y="4" textAnchor="middle" fontSize="8" fill="#1B2D4F" fontFamily="system-ui">С</text>
        <text x="0" y="26" textAnchor="middle" fontSize="8" fill="#1B2D4F" fontFamily="system-ui">В</text>
        <text x="-22" y="4" textAnchor="middle" fontSize="8" fill="#1B2D4F" fontFamily="system-ui">Ю</text>
      </g>
    </svg>
  )
}

interface Props {
  anchorX: number | null
  anchorY: number | null
  views: { west: boolean; north: boolean; east: boolean; south: boolean }
  rayWidth: RayWidth
  rayOpacity: number
  customSitePlan: string | null
  onSave: (
    anchorX: number,
    anchorY: number,
    views: { west: boolean; north: boolean; east: boolean; south: boolean },
    rayWidth: RayWidth,
    rayOpacity: number
  ) => void
  onUploadSitePlan: (dataUrl: string) => void
  onClose: () => void
}

export default function SitePlanEditor({
  anchorX: initX,
  anchorY: initY,
  views: initViews,
  rayWidth: initRayWidth,
  rayOpacity: initOpacity,
  customSitePlan,
  onSave,
  onUploadSitePlan,
  onClose,
}: Props) {
  const [anchorX, setAnchorX] = useState<number>(initX ?? 50)
  const [anchorY, setAnchorY] = useState<number>(initY ?? 50)
  const [views, setViews] = useState(initViews)
  const [rayWidth, setRayWidth] = useState<RayWidth>(initRayWidth)
  const [opacity, setOpacity] = useState(initOpacity)
  const [dragging, setDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const W = 800
  const H = 320

  const getPercent = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const pct = getPercent(e)
    if (!pct) return
    setAnchorX(pct.x)
    setAnchorY(pct.y)
    setDragging(true)
  }, [getPercent])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const pct = getPercent(e)
    if (!pct) return
    setAnchorX(pct.x)
    setAnchorY(pct.y)
  }, [dragging, getPercent])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  const ax = (anchorX / 100) * W
  const ay = (anchorY / 100) * H
  const rayLen = Math.sqrt(W * W + H * H)
  const halfAngle = RAY_HALF_ANGLES[rayWidth]

  const toggleView = (key: keyof typeof views) => {
    setViews(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSitePlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      onUploadSitePlan(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: C.ivory,
        borderRadius: '8px',
        width: '880px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: C.navy,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '8px 8px 0 0',
        }}>
          <div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '0.05em' }}>
              🎯 Редактор генплана
            </div>
            <div style={{ color: C.bronze, fontSize: '12px', marginTop: '2px' }}>
              Кликните на генплан, чтобы указать точку квартиры
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.6)', fontSize: '20px',
            cursor: 'pointer', padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Site plan interactive area */}
          <div style={{ marginBottom: '16px' }}>
            <div
              ref={containerRef}
              style={{
                width: `${W}px`,
                height: `${H}px`,
                position: 'relative',
                cursor: 'crosshair',
                userSelect: 'none',
                borderRadius: '4px',
                overflow: 'hidden',
                border: `2px solid ${C.greige}`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Background */}
              {customSitePlan ? (
                <img
                  src={customSitePlan}
                  alt="Генплан"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />
              ) : (
                <div style={{ pointerEvents: 'none' }}>
                  <PlaceholderSVG width={W} height={H} />
                </div>
              )}

              {/* SVG overlay */}
              <svg
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
              >
                {(Object.keys(views) as Array<keyof typeof views>).map(k => {
                  if (!views[k]) return null
                  const dirKey = k.toUpperCase() as keyof typeof DIRECTION_ANGLES
                  const angle = DIRECTION_ANGLES[dirKey]
                  const path = buildSectorPath(ax, ay, angle, halfAngle, rayLen)
                  return (
                    <path
                      key={k}
                      d={path}
                      fill={`rgba(215,195,155,${opacity / 100})`}
                      stroke="rgba(181,146,76,0.4)"
                      strokeWidth="1.5"
                    />
                  )
                })}
                {/* Anchor */}
                <circle cx={ax} cy={ay} r="9" fill={C.bronze} />
                <circle cx={ax} cy={ay} r="4" fill="white" />
                <circle cx={ax} cy={ay} r="1.5" fill={C.bronze} />
              </svg>
            </div>

            <div style={{
              marginTop: '6px',
              fontSize: '11px',
              color: 'rgba(27,45,79,0.6)',
              textAlign: 'right',
            }}>
              Координаты точки: {anchorX.toFixed(1)}%&nbsp;/&nbsp;{anchorY.toFixed(1)}%
            </div>
          </div>

          {/* Controls row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Views */}
            <div>
              <div style={{ fontSize: '11px', color: C.navy, fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Виды
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([
                  { key: 'west', label: 'Запад' },
                  { key: 'north', label: 'Север' },
                  { key: 'east', label: 'Восток' },
                  { key: 'south', label: 'Юг' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleView(key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: `1.5px solid ${views[key] ? C.bronze : C.greige}`,
                      backgroundColor: views[key] ? C.bronze : 'transparent',
                      color: views[key] ? 'white' : C.navy,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ray width */}
            <div>
              <div style={{ fontSize: '11px', color: C.navy, fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Ширина луча
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['NARROW', 'MEDIUM', 'WIDE'] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setRayWidth(w)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: `1.5px solid ${rayWidth === w ? C.navy : C.greige}`,
                      backgroundColor: rayWidth === w ? C.navy : 'transparent',
                      color: rayWidth === w ? 'white' : C.navy,
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {w === 'NARROW' ? 'Узкий' : w === 'MEDIUM' ? 'Средний' : 'Широкий'}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: C.navy, fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Прозрачность лучей: {opacity}%
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Upload site plan */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: C.beige,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSitePlanUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '8px 16px',
                backgroundColor: C.navy,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                letterSpacing: '0.05em',
              }}
            >
              Загрузить генплан
            </button>
            <span style={{ fontSize: '12px', color: 'rgba(27,45,79,0.6)' }}>
              {customSitePlan ? 'Генплан загружен ✓' : 'PNG, JPG, SVG — заменит плейсхолдер'}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={onClose} style={{
              padding: '10px 20px',
              border: `1.5px solid ${C.greige}`,
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: C.navy,
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Отмена
            </button>
            <button
              onClick={() => onSave(anchorX, anchorY, views, rayWidth, opacity)}
              style={{
                padding: '10px 24px',
                backgroundColor: C.bronze,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              Сохранить позицию
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
