/**
 * The avatar's click cycle, shared by the button (HeroAvatar3D) and the 3D scene. It imports
 * nothing from three.js, so the button stays light while the scene loads lazily.
 */
export type Persona = 'work' | 'fitness' | 'music'

export type AvatarReaction = 'wave' | 'closer' | 'think' | 'gym' | 'wink' | 'nod' | 'beat' | 'psst' | 'chat'

/** One loop: Work Dan, then Fitness Dan (click 4) and Music Dan (click 7), back to work on the chat. */
export const REACTIONS: AvatarReaction[] = ['wave', 'closer', 'think', 'gym', 'wink', 'nod', 'beat', 'psst', 'chat']

/** Reactions that change outfit (with a spin, if he isn't already wearing it). */
export const OUTFIT_CHANGES: Partial<Record<AvatarReaction, Persona>> = { gym: 'fitness', beat: 'music', chat: 'work' }

export interface CycleState {
  /** Clicks so far; the next reaction is REACTIONS[clicks % REACTIONS.length]. */
  clicks: number
  persona: Persona
}

/** Also read by the inline script in Hero.astro. */
const STORAGE_KEY = 'avatar-cycle'
const PERSONAS: Persona[] = ['work', 'fitness', 'music']

/** Stills of each outfit, shown while the 3D loads. Work's comes from the page as `poster`. */
export const POSTERS: Record<Exclude<Persona, 'work'>, string> = {
  fitness: '/images/dan-avatar-fitness.webp',
  music: '/images/dan-avatar-music.webp',
}

/**
 * Marks the outfit on <html> so CSS shows the matching still. <html> survives Swup's page swaps,
 * so coming back home shows the right still from the first frame. Hero.astro also sets it
 * before first paint on a full page load.
 */
export function markPersona(persona: Persona) {
  document.documentElement.dataset.avatarPersona = persona
}

/** Where the visitor left off this session, so the cycle resumes after they navigate away. */
export function loadCycle(): CycleState {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<CycleState> | null
    if (saved && Number.isInteger(saved.clicks) && PERSONAS.includes(saved.persona as Persona)) {
      return { clicks: saved.clicks as number, persona: saved.persona as Persona }
    }
  } catch {
    // Storage blocked or unreadable: start from the beginning.
  }
  return { clicks: 0, persona: 'work' }
}

export function saveCycle(state: CycleState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Not saved; the cycle simply restarts next time.
  }
}
