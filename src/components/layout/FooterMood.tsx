import WeatherGlyph from '../ui/icons/WeatherGlyph'
import { heroIdentityLabelClass } from '../ui/text/styles'
import { describeWeather, LOCATION_LABEL } from '../../lib/woononaWeather'
import { useWoononaWeather } from '../../lib/useWoononaWeather'

/** Footer place line, set in the same mono label and weather mark as the homepage hero. */
export default function FooterMood() {
  const weather = useWoononaWeather()
  const conditions = weather ? describeWeather(weather.code) : null
  const temperature = weather ? `${Math.round(weather.temperature)}°` : null

  const summary = [
    'Built in Woonona, Australia.',
    conditions && temperature ? `${temperature} and ${conditions.label.toLowerCase()}.` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      role='group'
      aria-label={summary}
      className={`${heroIdentityLabelClass} inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1 sm:justify-end`}>
      <span aria-hidden='true'>Built in {LOCATION_LABEL}</span>
      {conditions && temperature && (
        <span
          className='inline-flex items-center gap-1'
          aria-hidden='true'
          title={`${temperature} ${conditions.label}`}>
          <WeatherGlyph kind={conditions.kind} />
          <span>{temperature}</span>
        </span>
      )}
    </span>
  )
}
