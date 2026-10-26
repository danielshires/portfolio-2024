import type { WeatherKind } from '../../../lib/woononaWeather'

export default function WeatherGlyph({ kind }: { kind: WeatherKind }) {
  const shared = {
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-4 w-4 shrink-0 overflow-visible',
    'aria-hidden': true as const,
  }

  if (kind === 'clear') {
    return (
      <svg {...shared}>
        <circle cx='8' cy='8' r='2.75' />
        <path d='M8 1v2.15M8 12.85V15M1 8h2.15M12.85 8H15M3.05 3.05l1.5 1.5M11.45 11.45l1.5 1.5M3.05 12.95l1.5-1.5M11.45 4.55l1.5-1.5' />
      </svg>
    )
  }

  if (kind === 'partly') {
    return (
      <svg {...shared}>
        <path d='M10.2 3.1v1.1M12.55 4.35l-.8.8M13.1 7h-1.1' />
        <path d='M6.2 13.25h5.15a2.35 2.35 0 0 0 .35-4.67 2.7 2.7 0 0 0-5.2-.55 2.15 2.15 0 0 0-1.9 2.15 2.15 2.15 0 0 0 1.6 3.07Z' />
      </svg>
    )
  }

  if (kind === 'fog') {
    return (
      <svg {...shared}>
        <path d='M3 5.5h10M2.5 8h11M3.5 10.5h9' />
      </svg>
    )
  }

  if (kind === 'rain') {
    return (
      <svg {...shared}>
        <path d='M5.1 10.6h5.4a2.15 2.15 0 0 0 .3-4.27 2.45 2.45 0 0 0-4.75-.5 1.95 1.95 0 0 0-1.75 1.95 1.95 1.95 0 0 0 1.8 2.82Z' />
        <path d='M6.2 12.1v1.35M8.4 12.1v1.35M10.6 12.1v1.35' />
      </svg>
    )
  }

  if (kind === 'snow') {
    return (
      <svg {...shared}>
        <path d='M5.1 9.7h5.4a2.15 2.15 0 0 0 .3-4.27 2.45 2.45 0 0 0-4.75-.5 1.95 1.95 0 0 0-1.75 1.95 1.95 1.95 0 0 0 1.8 2.82Z' />
        <path d='M6.3 11.4v1.6M6.3 12.2h.9M7.2 11.4l-.9 1.6M9.7 11.4v1.6M9.7 12.2h.9M10.6 11.4l-.9 1.6' />
      </svg>
    )
  }

  if (kind === 'storm') {
    return (
      <svg {...shared}>
        <path d='M4.9 9.4h5.5a2.2 2.2 0 0 0 .35-4.36 2.5 2.5 0 0 0-4.85-.5 2 2 0 0 0-1.8 2 2 2 0 0 0 1.8 2.86Z' />
        <path d='M8.6 9.2 6.9 12h1.7l-1 2.5' />
      </svg>
    )
  }

  return (
    <svg {...shared}>
      <path d='M4.4 12.5h7.15a2.7 2.7 0 0 0 .4-5.37 3.15 3.15 0 0 0-6.1-.7 2.45 2.45 0 0 0-2.2 2.5 2.45 2.45 0 0 0 2.75 3.57Z' />
    </svg>
  )
}
