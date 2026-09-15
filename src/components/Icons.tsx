interface IconProps {
  size?: number
  color?: string
}

export function IconLocation({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )
}

export function IconPark({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L7 9h3l-4 6h5v5h2v-5h5l-4-6h3z"/>
    </svg>
  )
}

export function IconWindow({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  )
}

export function IconElevator({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="1"/>
      <path d="M9 10l3-3 3 3"/>
      <path d="M9 14l3 3 3-3"/>
    </svg>
  )
}

export function IconBuilding({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <path d="M9 22V12h6v10"/>
      <rect x="7" y="6" width="2" height="2"/>
      <rect x="11" y="6" width="2" height="2"/>
      <rect x="15" y="6" width="2" height="2"/>
    </svg>
  )
}

export function IconSchool({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}

export function IconSecurity({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6z"/>
      <polyline points="9,12 11,14 15,10"/>
    </svg>
  )
}

export function IconParking({ size = 36, color = '#B5924C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
    </svg>
  )
}

const ICON_MAP: Record<string, React.FC<IconProps>> = {
  location: IconLocation,
  park: IconPark,
  window: IconWindow,
  elevator: IconElevator,
  building: IconBuilding,
  school: IconSchool,
  security: IconSecurity,
  parking: IconParking,
}

export function AdvantageIcon({ name, size = 36, color = '#B5924C' }: { name: string; size?: number; color?: string }) {
  const Comp = ICON_MAP[name]
  if (!Comp) return null
  return <Comp size={size} color={color} />
}
