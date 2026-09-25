'use client'
import { useState } from 'react'

const C = {
  navy: '#1B2D4F',
  bronze: '#B5924C',
  white: '#FFFFFF',
  beige: '#F0EBE3',
  greige: '#E5DDD4',
  red: '#C0392B',
  green: '#2E7D32',
}

const fmt = (n: number) =>
  n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function Field({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: C.bronze, letterSpacing: '0.1em', marginBottom: '4px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 10px',
            border: `1.5px solid ${C.greige}`,
            borderRadius: '6px',
            fontSize: '14px',
            color: C.navy,
            outline: 'none',
            background: C.white,
          }}
        />
        {suffix && (
          <span style={{ fontSize: '12px', color: C.navy, opacity: 0.5, whiteSpace: 'nowrap' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, accent, sub }: { label: string; value: string; accent?: boolean; sub?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: sub ? '3px 0' : '6px 0',
      borderBottom: sub ? 'none' : `1px solid ${C.greige}`,
    }}>
      <span style={{ fontSize: sub ? '11px' : '12px', color: sub ? '#888' : C.navy, opacity: sub ? 1 : 0.7 }}>{label}</span>
      <span style={{ fontSize: sub ? '12px' : '14px', fontWeight: accent ? '700' : '500', color: accent ? C.bronze : C.navy }}>
        {value}
      </span>
    </div>
  )
}

export default function PrepaymentCalculator() {
  const [total, setTotal] = useState('')
  const [dpPct, setDpPct] = useState('30')
  const [months, setMonths] = useState('24')
  const [atMonth, setAtMonth] = useState('6')
  const [extra, setExtra] = useState('')

  const totalN = parseFloat(total) || 0
  const dpPctN = parseFloat(dpPct) || 0
  const monthsN = parseInt(months) || 0
  const atMonthN = parseInt(atMonth) || 0
  const extraN = parseFloat(extra) || 0

  const dpAmount = totalN * (dpPctN / 100)
  const remaining = totalN - dpAmount
  const monthlyOrig = monthsN > 0 ? remaining / monthsN : 0

  const balanceAtN = remaining - atMonthN * monthlyOrig
  const balanceAfterExtra = balanceAtN - extraN
  const remainingMonths = monthsN - atMonthN
  const newMonthly = remainingMonths > 0 && balanceAfterExtra > 0 ? balanceAfterExtra / remainingMonths : 0
  const saving = monthlyOrig - newMonthly

  const canCalc = totalN > 0 && monthsN > 0 && atMonthN > 0 && atMonthN < monthsN && extraN > 0 && balanceAfterExtra > 0

  const fullyPaidOff = extraN >= balanceAtN && balanceAtN > 0

  return (
    <div style={{
      minHeight: '100%',
      background: C.beige,
      padding: 'clamp(16px, 4vw, 40px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{
          background: C.white,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(27,45,79,0.07)',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: C.bronze, letterSpacing: '0.14em', marginBottom: '20px', textTransform: 'uppercase' }}>
            Параметры рассрочки
          </div>

          <Field label="Стоимость квартиры" value={total} onChange={setTotal} suffix="₽" placeholder="например 11 500 000" />
          <Field label="Первоначальный взнос" value={dpPct} onChange={setDpPct} suffix="%" placeholder="30" />
          <Field label="Срок рассрочки" value={months} onChange={setMonths} suffix="мес" placeholder="24" />

          {totalN > 0 && dpPctN > 0 && monthsN > 0 && (
            <div style={{ background: C.beige, borderRadius: '8px', padding: '10px 12px', marginBottom: '4px' }}>
              <Row label="Первоначальный взнос" value={`${fmt(dpAmount)} ₽`} />
              <Row label="Остаток под рассрочку" value={`${fmt(remaining)} ₽`} />
              <Row label="Ежемесячный платёж" value={`${fmt(monthlyOrig)} ₽`} accent />
            </div>
          )}
        </div>

        <div style={{
          background: C.white,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(27,45,79,0.07)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: C.bronze, letterSpacing: '0.14em', marginBottom: '20px', textTransform: 'uppercase' }}>
            Досрочный платёж
          </div>

          <Field label="Через сколько месяцев" value={atMonth} onChange={setAtMonth} suffix="мес" placeholder="6" />
          <Field label="Сумма досрочного платежа" value={extra} onChange={setExtra} suffix="₽" placeholder="500 000" />

          {atMonthN >= monthsN && monthsN > 0 && (
            <div style={{ color: C.red, fontSize: '12px', marginBottom: '12px' }}>
              Срок платежа должен быть меньше срока рассрочки ({monthsN} мес)
            </div>
          )}

          {fullyPaidOff && (
            <div style={{
              background: '#E8F5E9',
              border: `1px solid ${C.green}`,
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: C.green }}>Рассрочка полностью погашена</div>
              <div style={{ fontSize: '12px', color: C.green, marginTop: '4px' }}>
                Сдача: {fmt(extraN - balanceAtN)} ₽
              </div>
            </div>
          )}

          {canCalc && !fullyPaidOff && (
            <div style={{ background: C.beige, borderRadius: '8px', padding: '10px 12px' }}>
              <Row label={`Остаток на ${atMonthN}-й месяц`} value={`${fmt(balanceAtN)} ₽`} />
              <Row label="После досрочного платежа" value={`${fmt(balanceAfterExtra)} ₽`} />
              <Row label={`Остаток срока`} value={`${remainingMonths} мес`} />
              <div style={{ height: '8px' }} />
              <Row label="Новый ежемесячный платёж" value={`${fmt(newMonthly)} ₽`} accent />
              {saving > 0 && (
                <Row
                  label="Снижение платежа"
                  value={`−${fmt(saving)} ₽/мес`}
                  sub
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
