'use client'

const C = {
  navy:   '#1B2D4F',
  bronze: '#B5924C',
  ivory:  '#FAF8F3',
  beige:  '#F0EBE3',
  greige: '#E5DDD4',
  svoFill:'#FDF6EC',
  svoBorder: '#D4AA6A',
  muted:  '#6B7A91',
  white:  '#FFFFFF',
}

type Row = {
  label: string
  sub?: string
  isSvo?: boolean
  installment: string
  full: string
  term: string
  divider?: string
}

type SectionData = {
  title: string
  tag?: string
  rows: Row[]
  note?: string
}

type ProjectData = {
  project: string
  sections: SectionData[]
}

const TOWERS: ProjectData = {
  project: 'TOWERS',
  sections: [
    {
      title: 'Блоки 1, 2, 3 — до 16 этажа',
      tag: 'Первый взнос 30%',
      rows: [
        { divider: '44 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '115 000', full: '110 000', term: '12 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '110 000', full: '105 000', term: '12 мес' },
        { divider: 'от 60 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '115 000', full: '110 000', term: '24 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '110 000', full: '105 000', term: '24 мес' },
      ],
    },
    {
      title: '16 этаж',
      tag: 'Первый взнос 30%',
      rows: [
        { divider: '44 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '110 000', full: '95 000', term: '12 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '105 000', full: '90 000', term: '12 мес' },
        { divider: '70 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '110 000', full: '95 000', term: '24 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '105 000', full: '90 000', term: '24 мес' },
      ],
    },
    {
      title: 'Блок 5 — от 86 м²',
      tag: 'Акция · Первый взнос 30%',
      rows: [
        { label: 'СТАНДАРТ', sub: 'Акция для всех', installment: '105 000', full: '95 000', term: '36 мес' },
        { label: 'СВО', sub: 'Отдельные условия', isSvo: true, installment: '95 000', full: '90 000', term: '36 мес' },
      ],
      note: 'По блоку 5 цены СВО фиксированные, не применяется стандартная скидка −5 000 ₽/м²',
    },
  ],
}

const AZUR_PRIME: ProjectData = {
  project: 'AZUR PRIME',
  sections: [
    {
      title: 'Студии',
      tag: 'Первый взнос 30%',
      rows: [
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '180 000', full: '150 000', term: '24 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '175 000', full: '145 000', term: '24 мес' },
      ],
    },
  ],
}

const AZUR_RESIDENCE: ProjectData = {
  project: 'AZUR Residence',
  sections: [
    {
      title: 'Студии',
      tag: 'Первый взнос 30%',
      rows: [
        { label: 'СТАНДАРТ', sub: 'Все клиенты', installment: '180 000', full: '150 000', term: '24 мес' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '175 000', full: '145 000', term: '24 мес' },
      ],
    },
  ],
}

const IMPERIAL: ProjectData = {
  project: 'ИМПЕРИАЛ',
  sections: [
    {
      title: 'Все квартиры',
      tag: 'Первый взнос 30%',
      rows: [
        { divider: 'Стандарт — до 70 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'До 70 м²', installment: '110 000', full: '90 000', term: '24 мес' },
        { divider: 'Стандарт — от 70 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СТАНДАРТ', sub: 'От 70 м²', installment: '105 000', full: '90 000', term: '36 мес' },
        { divider: 'СВО — до 70 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СВО', sub: 'Скидка −5 000 ₽/м²', isSvo: true, installment: '105 000', full: '85 000', term: '24 мес' },
        { divider: 'СВО — от 70 м²', label: '', installment: '', full: '', term: '' },
        { label: 'СВО', sub: 'Отдельные условия', isSvo: true, installment: '95 000', full: '85 000', term: '36 мес' },
      ],
    },
  ],
}

function Badge({ label, isSvo }: { label: string; isSvo?: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 3,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      backgroundColor: isSvo ? C.svoBorder : C.navy,
      color: C.white,
      flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function PriceCell({ value, highlight }: { value: string; highlight?: boolean }) {
  return (
    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
      <span style={{
        fontWeight: 700,
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums',
        color: highlight ? C.bronze : C.navy,
      }}>
        {value} ₽/м²
      </span>
    </td>
  )
}

function Section({ data }: { data: SectionData }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 8,
      border: `1px solid ${C.greige}`,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: C.navy,
        flexWrap: 'wrap',
        gap: 6,
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: C.white, letterSpacing: '0.03em' }}>
          {data.title}
        </span>
        {data.tag && (
          <span style={{
            fontSize: 11,
            color: C.bronze,
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}>
            {data.tag}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.beige }}>
              <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Категория</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Рассрочка</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>100% оплата</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Срок</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => {
              if (row.divider) {
                return (
                  <tr key={i} style={{ background: C.beige }}>
                    <td colSpan={4} style={{
                      padding: '5px 16px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.muted,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      borderTop: i > 0 ? `1px solid ${C.greige}` : undefined,
                    }}>
                      {row.divider}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={i} style={{
                  background: row.isSvo ? C.svoFill : C.white,
                  borderTop: `1px solid ${C.greige}`,
                }}>
                  <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge label={row.label} isSvo={row.isSvo} />
                      {row.sub && (
                        <span style={{ fontSize: 12, color: C.muted }}>{row.sub}</span>
                      )}
                    </div>
                  </td>
                  <PriceCell value={row.installment} />
                  <PriceCell value={row.full} />
                  <td style={{ padding: '10px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.navy,
                      background: C.beige,
                      border: `1px solid ${C.greige}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {row.term}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data.note && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '10px 16px',
          background: C.beige,
          borderTop: `1px solid ${C.greige}`,
          fontSize: 11,
          color: C.muted,
        }}>
          <span>ℹ</span>
          <span>{data.note}</span>
        </div>
      )}
    </div>
  )
}

function ProjectBlock({ data }: { data: ProjectData }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `2px solid ${C.navy}`,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: C.bronze,
          textTransform: 'uppercase',
        }}>
          IWEL · Условия продаж
        </span>
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          color: C.navy,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {data.project}
        </span>
      </div>
      {data.sections.map((s, i) => <Section key={i} data={s} />)}
    </div>
  )
}

export default function PricingConditions() {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: C.ivory,
      padding: '20px 16px 40px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <ProjectBlock data={TOWERS} />
        <ProjectBlock data={IMPERIAL} />
        <ProjectBlock data={AZUR_PRIME} />
        <ProjectBlock data={AZUR_RESIDENCE} />
        <p style={{
          textAlign: 'right',
          fontSize: 11,
          color: C.muted,
          letterSpacing: '0.03em',
          marginTop: 8,
        }}>
          TOWERS · ИМПЕРИАЛ · Актуально на сентябрь 2026
        </p>
      </div>
    </div>
  )
}
