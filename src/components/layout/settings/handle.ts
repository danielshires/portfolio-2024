import { Dialog } from '@base-ui/react/dialog'

type SettingsDialogHandle = ReturnType<typeof Dialog.createHandle>

const globalRecord = globalThis as typeof globalThis & {
  __portfolioSettingsDialogHandle?: SettingsDialogHandle
}

export function getSettingsDialogHandle(): SettingsDialogHandle {
  if (!globalRecord.__portfolioSettingsDialogHandle) {
    globalRecord.__portfolioSettingsDialogHandle = Dialog.createHandle()
  }
  return globalRecord.__portfolioSettingsDialogHandle
}
