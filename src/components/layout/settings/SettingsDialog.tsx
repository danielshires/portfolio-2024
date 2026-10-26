import React, { useEffect, useId, useRef, useState } from 'react'
import { DialogContent, DialogDescription, DialogRoot, DialogTitle } from '../../ui/dialog/Dialog'
import { Switch } from '../../ui/switch/Switch'
import { getSettingsDialogHandle } from './handle'
import {
  applyA11ySettings,
  defaultA11ySettings,
  readSettings,
  resolveHighContrast,
  SETTINGS_STORAGE_KEY,
  writeSettings,
  type SiteSettings,
} from '../../../lib/settings/a11y'

type SettingSwitchProps = {
  label: string
  description: string
  checked: boolean
  onToggle?: () => void
  className?: string
  'data-theme-toggle'?: boolean
  'data-theme-switch'?: boolean
}

const SettingSwitch = React.forwardRef<HTMLElement, SettingSwitchProps>(
  function SettingSwitch({ label, description, checked, onToggle, className, ...props }, ref) {
    const labelId = useId()
    const descriptionId = useId()

    return (
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div id={labelId} className='text-base text-zinc-900 dark:text-zinc-100'>
            {label}
          </div>
          <p id={descriptionId} className='mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-400'>
            {description}
          </p>
        </div>
        <Switch
          {...props}
          ref={ref}
          checked={checked}
          onCheckedChange={onToggle ? () => onToggle() : undefined}
          className={['mt-0.5', className].filter(Boolean).join(' ')}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      </div>
    )
  }
)

const sectionLabelClass =
  'font-mono text-xs font-normal uppercase tracking-wider text-zinc-500 dark:text-zinc-400'

export default function SettingsDialog() {
  const lastTrigger = useRef<HTMLElement | null>(null)
  const firstSwitchRef = useRef<HTMLElement>(null)
  const accessibilityHeadingId = useId()
  const appearanceHeadingId = useId()
  const experimentsHeadingId = useId()
  const [settings, setSettings] = useState<SiteSettings>({
    a11y: { ...defaultA11ySettings },
    experiments: false,
  })
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const initial = readSettings()
    setSettings(initial)
    applyA11ySettings(initial)
    setDark(document.documentElement.classList.contains('dark'))

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SETTINGS_STORAGE_KEY) return
      const next = readSettings()
      setSettings(next)
      applyA11ySettings(next)
    }

    const onTheme = (event: Event) => {
      const theme = (event as CustomEvent<{ theme?: string }>).detail?.theme
      setDark(theme === 'dark')
    }

    const contrastQuery = window.matchMedia('(prefers-contrast: more)')
    const onContrast = () => {
      setSettings((current) => {
        if (current.a11y.contrast !== 'system') return current
        applyA11ySettings(current)
        return { ...current, a11y: { ...current.a11y } }
      })
    }

    window.addEventListener('storage', onStorage)
    document.addEventListener('portfolio:theme-change', onTheme)
    contrastQuery.addEventListener('change', onContrast)

    return () => {
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('portfolio:theme-change', onTheme)
      contrastQuery.removeEventListener('change', onContrast)
    }
  }, [])

  function commit(next: SiteSettings) {
    writeSettings(next)
    applyA11ySettings(next)
    setSettings(next)
  }

  const highContrast = resolveHighContrast(settings.a11y.contrast)

  return (
    <DialogRoot
      handle={getSettingsDialogHandle()}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen) return
        const trigger = details.trigger
        if (trigger instanceof HTMLElement) {
          lastTrigger.current = trigger
          if (trigger.closest('#nav-menu')) {
            document.dispatchEvent(new CustomEvent('portfolio:close-nav-menu'))
          }
        }
        setDark(document.documentElement.classList.contains('dark'))
        setSettings(readSettings())
      }}>
      <DialogContent
        id='settings-dialog'
        initialFocus={firstSwitchRef}
        finalFocus={() => {
          const trigger = lastTrigger.current
          if (trigger?.closest('#nav-menu')) return document.getElementById('nav-menu-button')
          return trigger ?? true
        }}>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Accessibility and appearance preferences saved on this device.
        </DialogDescription>

        <section className='mt-5' aria-labelledby={accessibilityHeadingId}>
          <h3 id={accessibilityHeadingId} className={sectionLabelClass}>
            Accessibility
          </h3>
          <div className='mt-4 flex flex-col gap-4'>
            <SettingSwitch
              ref={firstSwitchRef}
              label='High contrast'
              description='Stronger text, borders, and focus. Photos stay as they are.'
              checked={highContrast}
              onToggle={() =>
                commit({
                  ...settings,
                  a11y: { ...settings.a11y, contrast: highContrast ? 'default' : 'high' },
                })
              }
            />
            <SettingSwitch
              label='Reduce motion'
              description='Turns off animation and smooth scrolling. Your device setting still applies when this is off.'
              checked={settings.a11y.motion === 'reduce'}
              onToggle={() =>
                commit({
                  ...settings,
                  a11y: {
                    ...settings.a11y,
                    motion: settings.a11y.motion === 'reduce' ? 'system' : 'reduce',
                  },
                })
              }
            />
          </div>
        </section>

        <section
          className='mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800'
          aria-labelledby={appearanceHeadingId}>
          <h3 id={appearanceHeadingId} className={sectionLabelClass}>
            Appearance
          </h3>
          <div className='mt-4'>
            <SettingSwitch
              label='Dark mode'
              description='Uses a dark background and light text.'
              checked={dark}
              data-theme-toggle
              data-theme-switch
            />
          </div>
        </section>

        <section
          className='mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800'
          aria-labelledby={experimentsHeadingId}>
          <h3 id={experimentsHeadingId} className={sectionLabelClass}>
            Experiments
          </h3>
          <div className='mt-4'>
            <SettingSwitch
              label='Show experiments'
              description='Reveals unfinished pieces, including the For agents control.'
              checked={settings.experiments}
              onToggle={() => commit({ ...settings, experiments: !settings.experiments })}
            />
          </div>
        </section>
      </DialogContent>
    </DialogRoot>
  )
}
