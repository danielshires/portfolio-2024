import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, CopyIcon, RefreshCcwIcon } from 'lucide-react'
import { useStickToBottomContext } from 'use-stick-to-bottom'
import { Conversation as ConversationView, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from '@/components/ai-elements/prompt-input'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { linkSegments } from './chat/ReplyText'
import ChatAvatar from './ChatAvatar'
import type { AvatarMode } from '../featured/HeroAvatarScene'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
  suggestions?: string[]
  /** Seconds until the reply started arriving, shown as "Thought for Ns". */
  thought?: number
  /** The visitor stopped this reply part-way. */
  stopped?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

const GREETING =
  'Ask about the work, writing, and notes published on this site. If it is not on the site, I will say so.'

const STORAGE_KEY = 'daniel-avatar-chats'
const MAX_MESSAGE_CHARS = 1500
const MAX_CONVERSATIONS = 30
/** Starter questions on an empty chat. */
const STARTERS = ['What kind of design work do you do?', 'How was this site built?', 'What are you working on right now?']

/** Shown characters per second at least; the reveal speeds up when it falls behind the stream. */
const REVEAL_RATE = 45

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: [],
    updatedAt: Date.now(),
  }
}

function titleFrom(content: string) {
  const flat = content.replace(/\s+/g, ' ').trim()
  if (flat.length <= 42) return flat
  return `${flat.slice(0, 41)}…`
}

function suggestionsOf(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const seen = new Set<string>()
  const suggestions = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => {
      const key = item.toLowerCase()
      if (item.length < 8 || item.length > 120 || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
  return suggestions.length ? suggestions : undefined
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as ChatMessage
  return (
    (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string'
  )
}

function readStore(): { activeId: string; conversations: Conversation[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      activeId?: unknown
      conversations?: unknown
    }
    if (!Array.isArray(parsed.conversations)) return null
    const conversations = parsed.conversations
      .filter((item): item is Conversation => {
        if (!item || typeof item !== 'object') return false
        const conversation = item as Conversation
        return (
          typeof conversation.id === 'string' &&
          typeof conversation.title === 'string' &&
          Array.isArray(conversation.messages) &&
          conversation.messages.every(isMessage)
        )
      })
      .slice(0, MAX_CONVERSATIONS)
      .map((conversation) => ({
        ...conversation,
        updatedAt: typeof conversation.updatedAt === 'number' ? conversation.updatedAt : 0,
        messages: conversation.messages.map((message) => ({
          role: message.role,
          content: message.content,
          ...(message.role === 'assistant'
            ? {
                suggestions: suggestionsOf(message.suggestions),
                ...(typeof message.thought === 'number' ? { thought: message.thought } : {}),
                ...(message.stopped === true ? { stopped: true } : {}),
              }
            : {}),
        })),
      }))
    if (!conversations.length) return null
    const activeId =
      typeof parsed.activeId === 'string' && conversations.some((item) => item.id === parsed.activeId)
        ? parsed.activeId
        : conversations[0].id
    return { activeId, conversations }
  } catch {
    return null
  }
}

function toApiMessages(messages: ChatMessage[]): ChatMessage[] {
  const cleaned: ChatMessage[] = []
  for (const message of messages) {
    const previous = cleaned[cleaned.length - 1]
    if (previous?.role === 'user' && message.role === 'user') {
      cleaned[cleaned.length - 1] = message
    } else {
      cleaned.push(message)
    }
  }
  return cleaned.slice(-8)
}

const RAIL_KEY = 'daniel-avatar-sidebar'

/** Day headings for the chat list, newest first. */
function groupByDay(conversations: Conversation[]) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const day = 24 * 60 * 60 * 1000
  const label = (time: number) =>
    time >= startOfToday.getTime()
      ? 'Today'
      : time >= startOfToday.getTime() - day
        ? 'Yesterday'
        : time >= startOfToday.getTime() - 7 * day
          ? 'Previous 7 days'
          : 'Older'
  const groups: Array<{ label: string; conversations: Conversation[] }> = []
  for (const conversation of conversations) {
    const name = label(conversation.updatedAt)
    const group = groups[groups.length - 1]
    if (group?.label === name) group.conversations.push(conversation)
    else groups.push({ label: name, conversations: [conversation] })
  }
  return groups
}

/** A line from the latest reply, so chats that start with the same question still differ. */
function snippetOf(conversation: Conversation) {
  const reply = [...conversation.messages].reverse().find((message) => message.role === 'assistant')
  if (!reply) return conversation.messages.length ? 'Waiting for a reply' : 'No messages yet'
  const plain = linkSegments(reply.content)
    .map((segment) => (segment.type === 'text' ? segment.value : segment.label))
    .join('')
    // Markdown emphasis and code marks, which the list shows as plain text.
    .replace(/[*_`#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 64 ? `${plain.slice(0, 63)}…` : plain
}

/**
 * Replies link bare site paths and emails as well as markdown links; spell those out as
 * markdown so the renderer links them too.
 */
function toMarkdown(text: string) {
  return linkSegments(text)
    .map((segment) => (segment.type === 'text' ? segment.value : `[${segment.label.replace(/[[\]]/g, '')}](${segment.href})`))
    .join('')
}

/** The site pages a reply linked to, deduplicated, in order. */
function sourcesOf(text: string) {
  const seen = new Set<string>()
  const sources: Array<{ label: string; href: string }> = []
  for (const segment of linkSegments(text)) {
    if (segment.type !== 'link' || !segment.href.startsWith('/') || seen.has(segment.href)) continue
    seen.add(segment.href)
    sources.push({ label: segment.label, href: segment.href })
  }
  return sources
}

/** "Used N pages", opening to the site pages a reply linked to. */
function ReplySources({ text }: { text: string }) {
  const sources = sourcesOf(text)
  if (!sources.length) return null
  return (
    <Sources className="mb-0 text-muted-foreground">
      <SourcesTrigger count={sources.length} className="hover:text-foreground">
        <p className="font-medium">
          Used {sources.length} {sources.length === 1 ? 'page' : 'pages'}
        </p>
        <ChevronDownIcon className="size-4" />
      </SourcesTrigger>
      <SourcesContent>
        {sources.map((source) => (
          <Source key={source.href} href={source.href} title={source.label} className="text-foreground" />
        ))}
      </SourcesContent>
    </Sources>
  )
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked: nothing to do.
    }
  }
  return (
    <MessageAction tooltip={copied ? 'Copied' : 'Copy'} label={copied ? 'Copied' : 'Copy reply'} onClick={copy}>
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </MessageAction>
  )
}

/** Scrolls to the newest message when `followKey` changes (the visitor sent one), even if scrolled up. */
function FollowOnSend({ followKey }: { followKey: string }) {
  const { scrollToBottom } = useStickToBottomContext()
  useEffect(() => {
    scrollToBottom()
  }, [followKey, scrollToBottom])
  return null
}

/**
 * Shows streamed text smoothly: chunks arrive unevenly, so the shown length catches up at a
 * steady pace (faster when behind). The markdown renderer copes with half-arrived links.
 */
function StreamedReply({ text, streaming, onShown }: { text: string; streaming: boolean; onShown?: () => void }) {
  const [shown, setShown] = useState(streaming ? 0 : text.length)
  const target = useRef(text.length)
  target.current = text.length
  const shownRef = useRef(shown)
  const notify = useRef(onShown)
  notify.current = onShown

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(Number.MAX_SAFE_INTEGER)
      return
    }
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const behind = target.current - shownRef.current
      if (behind > 0) {
        shownRef.current = Math.min(target.current, shownRef.current + Math.max(REVEAL_RATE, behind * 3) * dt)
        setShown(Math.floor(shownRef.current))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const complete = !streaming && shown >= text.length
  useEffect(() => {
    if (complete) notify.current?.()
  }, [complete])

  return (
    <MessageResponse linkSafety={{ enabled: false }}>
      {toMarkdown(complete ? text : text.slice(0, shown))}
    </MessageResponse>
  )
}

export default function AvatarChat() {
  const initial = useRef(createConversation())
  const [conversations, setConversations] = useState<Conversation[]>([initial.current])
  const [activeId, setActiveId] = useState(initial.current.id)
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; text: string; retry: string; stopped?: boolean } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  /** The reply streaming in (its conversation and position), until it's fully shown. */
  const [streaming, setStreaming] = useState<{ id: string; index: number; done: boolean } | null>(null)
  const [narrow, setNarrow] = useState(false)
  /** Desktop only: the chat list folded down to a slim rail (remembered). */
  const [rail, setRail] = useState(false)
  /** The last deleted chat, kept briefly so it can be undone. */
  const [deleted, setDeleted] = useState<{ conversation: Conversation; wasActive: boolean } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const pendingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]
  const waitingHere = pendingId === active?.id
  const listed = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
  const empty = !!active && active.messages.length === 0 && !waitingHere && error?.id !== active.id
  const streamHere = streaming && streaming.id === active?.id ? streaming : null

  // What the avatar is doing, from the state of the conversation.
  const mode: AvatarMode = streamHere
    ? 'talking'
    : waitingHere
      ? 'thinking'
      : error?.id === active?.id && !error.stopped
        ? 'worried'
        : draft.trim()
          ? 'listening'
          : 'idle'

  useEffect(() => {
    const stored = readStore()
    if (stored) {
      setConversations(stored.conversations)
      setActiveId(stored.activeId)
    }
    setHydrated(true)
    try {
      setRail(localStorage.getItem(RAIL_KEY) === 'rail')
    } catch {
      // Storage blocked: start expanded.
    }
    const media = window.matchMedia('(max-width: 768px)')
    setNarrow(media.matches)
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId, conversations }))
  }, [hydrated, activeId, conversations])

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  // Back to the message box once a reply finishes (it's disabled while one is on its way).
  useEffect(() => {
    if (hydrated && pendingId === null) composerRef.current?.focus()
  }, [hydrated, pendingId])

  // Esc stops a reply; ⌘K / Ctrl+K starts a new chat.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && pendingRef.current) {
        event.preventDefault()
        stop()
      } else if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        newChat()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function toggleRail() {
    setRail((current) => {
      try {
        localStorage.setItem(RAIL_KEY, current ? 'open' : 'rail')
      } catch {
        // Not remembered; fine.
      }
      return !current
    })
  }

  function stop() {
    abortRef.current?.abort()
  }

  function deleteChat(id: string) {
    const conversation = conversations.find((item) => item.id === id)
    if (!conversation || pendingId === id) return
    const wasActive = id === activeId
    const remaining = conversations.filter((item) => item.id !== id)
    if (wasActive) {
      // Open the most recent chat left, or a fresh one if that was the last.
      const next = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? createConversation()
      if (!remaining.length) remaining.push(next)
      setActiveId(next.id)
      setDraft('')
      setError(null)
      setStreaming(null)
    }
    setConversations(remaining)
    window.clearTimeout(undoTimer.current)
    setDeleted({ conversation, wasActive })
    undoTimer.current = window.setTimeout(() => setDeleted(null), 6000)
  }

  function undoDelete() {
    if (!deleted) return
    const { conversation, wasActive } = deleted
    setConversations((prev) => {
      // Drop the empty chat that stood in for it, if deleting it left none.
      const rest = prev.filter((item) => item.messages.length > 0 || (item.id === activeId && !wasActive))
      return [conversation, ...rest].slice(0, MAX_CONVERSATIONS)
    })
    if (wasActive) setActiveId(conversation.id)
    window.clearTimeout(undoTimer.current)
    setDeleted(null)
  }

  function openChat(id: string) {
    setActiveId(id)
    setDraft('')
    setError(null)
    setSidebarOpen(false)
    composerRef.current?.focus()
  }

  function newChat() {
    if (pendingRef.current) return
    const current = conversations.find((conversation) => conversation.id === activeId)
    if (current && current.messages.length === 0) {
      setDraft('')
      setError(null)
      setSidebarOpen(false)
      composerRef.current?.focus()
      return
    }
    const created = createConversation()
    setConversations((prev) => [created, ...prev].slice(0, MAX_CONVERSATIONS))
    setActiveId(created.id)
    setDraft('')
    setError(null)
    setSidebarOpen(false)
    composerRef.current?.focus()
  }

  /** Writes the streamed reply so far into the conversation (adding it on the first chunk). */
  function writeReply(conversationId: string, index: number, patch: Partial<ChatMessage>) {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== conversationId) return conversation
        const messages = [...conversation.messages]
        const current = messages[index]
        messages[index] = current?.role === 'assistant' ? { ...current, ...patch } : { role: 'assistant', content: '', ...patch }
        return { ...conversation, messages, updatedAt: Date.now() }
      })
    )
  }

  /** Sends `text`; a retry re-asks the last question without adding it to the thread again. */
  async function send(text: string, retry = false) {
    const content = text.trim()
    const conversationId = active?.id
    if (!content || !conversationId || pendingRef.current) return
    if (content.length > MAX_MESSAGE_CHARS) {
      setError({ id: conversationId, text: 'Keep the message under 1,500 characters.', retry: '' })
      return
    }

    const earlier = conversations.find((conversation) => conversation.id === conversationId)?.messages ?? []
    const history = retry ? earlier : [...earlier, { role: 'user' as const, content }]
    const replyIndex = history.length

    pendingRef.current = true
    setPendingId(conversationId)
    setStreaming(null)
    if (!retry) setDraft('')
    setError(null)
    if (!retry) {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation
          const titled = conversation.messages.some((message) => message.role === 'user')
          return {
            ...conversation,
            title: titled ? conversation.title : titleFrom(content),
            messages: [...conversation.messages, { role: 'user', content }],
            updatedAt: Date.now(),
          }
        })
      )
    }

    const controller = new AbortController()
    abortRef.current = controller
    const started = performance.now()
    let reply = ''
    const fail = (message: string, stopped = false) => {
      if (reply && stopped) {
        // Keep what arrived of a stopped reply, marked as stopped.
        writeReply(conversationId, replyIndex, { content: reply, stopped: true })
        setStreaming((current) => current && { ...current, done: true })
        return
      }
      if (reply) {
        // A reply that broke part-way is dropped, so Retry starts it again cleanly.
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, messages: conversation.messages.slice(0, replyIndex) }
              : conversation
          )
        )
      }
      setStreaming(null)
      setError({ id: conversationId, text: message, retry: content, stopped })
    }

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(history) }),
        signal: controller.signal,
      })
      const type = response.headers.get('content-type') ?? ''
      if (!response.ok || !response.body || !type.includes('ndjson')) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        fail(data.error || 'The avatar could not reply. Try again.')
        return
      }

      // Newline-delimited events: `delta` text, then `done` (with suggestions) or `error`.
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finished = false
      while (!finished) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline = buffer.indexOf('\n')
        while (newline >= 0) {
          const line = buffer.slice(0, newline).trim()
          buffer = buffer.slice(newline + 1)
          newline = buffer.indexOf('\n')
          if (!line) continue
          const event = JSON.parse(line) as
            | { type: 'delta'; text: string }
            | { type: 'done'; reply: string; suggestions?: unknown }
            | { type: 'error'; error: string }
          if (event.type === 'delta') {
            if (!reply) setStreaming({ id: conversationId, index: replyIndex, done: false })
            reply += event.text
            writeReply(conversationId, replyIndex, {
              content: reply,
              ...(reply === event.text ? { thought: (performance.now() - started) / 1000 } : {}),
            })
          } else if (event.type === 'done') {
            const streamed = reply.length > 0
            reply = event.reply.trim()
            const suggestions = suggestionsOf(event.suggestions)?.filter(
              (item) => item.toLowerCase() !== content.toLowerCase(),
            )
            writeReply(conversationId, replyIndex, {
              content: reply,
              suggestions,
              // Arrived in one piece (no deltas): its wait was the whole request.
              ...(streamed ? {} : { thought: (performance.now() - started) / 1000 }),
            })
            setStreaming({ id: conversationId, index: replyIndex, done: true })
            finished = true
          } else {
            fail(event.error || 'The avatar could not reply. Try again.')
            finished = true
          }
        }
      }
      if (!finished) fail('The avatar could not reply. Try again.')
    } catch (caught) {
      const stopped = (caught as Error)?.name === 'AbortError'
      fail(stopped ? 'Stopped.' : 'The avatar could not reply. Try again.', stopped)
    } finally {
      abortRef.current = null
      pendingRef.current = false
      setPendingId(null)
    }
  }

  const userTurns = active?.messages.filter((message) => message.role === 'user').length ?? 0
  const avatarSize = empty ? (narrow ? 120 : 160) : narrow ? 72 : 96
  const status =
    mode === 'thinking' ? 'Thinking…' : mode === 'talking' ? 'Replying…' : mode === 'listening' ? 'Listening…' : 'Ask me anything on the site'
  const collapsed = rail && !narrow

  return (
    <div className="studio">
      {sidebarOpen && (
        <div
          className="studio-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`studio-controls${sidebarOpen ? ' studio-controls-open' : ''}${collapsed ? ' studio-controls-rail' : ''}`}
        aria-label="Conversations"
      >
        <div className="studio-controls-header">
          {!collapsed && <h1>Digital avatar</h1>}
          <button
            type="button"
            className="studio-rail-toggle"
            onClick={toggleRail}
            aria-label={collapsed ? 'Show chat list' : 'Hide chat list'}
            aria-expanded={!collapsed}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
            </svg>
          </button>
          <button
            type="button"
            className="studio-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="studio-new"
          onClick={newChat}
          disabled={pendingId !== null}
          aria-label={collapsed ? 'New chat' : undefined}
          title="New chat (⌘K)"
        >
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          ) : (
            <>
              New chat <kbd>⌘K</kbd>
            </>
          )}
        </button>
        {!collapsed && (
          <nav className="studio-history" aria-label="Chat history">
            {groupByDay(listed).map((group) => (
              <section key={group.label} className="studio-history-group">
                <h2>{group.label}</h2>
                <ul>
                  {group.conversations.map((conversation) => (
                    <li key={conversation.id} className="studio-history-item">
                      <button
                        type="button"
                        className="studio-history-open"
                        aria-current={conversation.id === active?.id ? 'true' : undefined}
                        onClick={() => openChat(conversation.id)}
                      >
                        <span className="studio-history-title">{conversation.title}</span>
                        <span className="studio-history-snippet">{snippetOf(conversation)}</span>
                      </button>
                      <button
                        type="button"
                        className="studio-history-delete"
                        aria-label={`Delete chat: ${conversation.title}`}
                        disabled={pendingId === conversation.id}
                        onClick={() => deleteChat(conversation.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        )}
      </aside>

      <section className="studio-stage" data-empty={empty ? 'true' : undefined}>
        {!sidebarOpen && (
          <button
            type="button"
            className="studio-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversation history"
            aria-expanded={sidebarOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <header className="studio-avatar" data-slot="chat-header">
          <ChatAvatar size={avatarSize} mode={mode} />
          <div className="studio-avatar-text">
            <p className="studio-avatar-name">Dan</p>
            <p className="studio-avatar-status" aria-live="polite">
              {status}
            </p>
          </div>
          {empty && <p className="studio-empty">{GREETING}</p>}
          {empty && (
            <Suggestions aria-label="Starter questions" className="w-full flex-wrap justify-center">
              {STARTERS.map((question) => (
                <Suggestion key={question} suggestion={question} onClick={(picked) => void send(picked)} disabled={pendingId !== null} />
              ))}
            </Suggestions>
          )}
        </header>

        {/* Busy while a reply streams in, so screen readers announce it once, complete. */}
        {!empty && (
          <ConversationView aria-busy={waitingHere || !!streamHere} aria-live="polite" aria-relevant="additions">
            <FollowOnSend followKey={`${active?.id}:${userTurns}`} />
            <ConversationContent className="mx-auto w-full max-w-2xl gap-6 px-8 py-4 max-md:px-3">
              {active?.messages.map((message, position) => {
                const isLast = position === active.messages.length - 1
                const live = streamHere?.index === position
                if (message.role === 'user') {
                  return (
                    <Message from="user" key={position}>
                      <MessageContent className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.content}</MessageContent>
                    </Message>
                  )
                }
                return (
                  <Message from="assistant" key={position}>
                    {message.thought !== undefined && (
                      <Reasoning className="mb-0" defaultOpen={false} duration={Math.max(1, Math.round(message.thought))}>
                        <ReasoningTrigger />
                        <ReasoningContent>Checked the pages on this site for an answer, then wrote a reply grounded in them.</ReasoningContent>
                      </Reasoning>
                    )}
                    <MessageContent className="leading-relaxed [overflow-wrap:anywhere]">
                      <StreamedReply
                        text={message.content}
                        streaming={live && !streamHere.done}
                        onShown={live ? () => setStreaming((current) => (current?.index === position ? null : current)) : undefined}
                      />
                    </MessageContent>
                    {!live && (
                      <MessageActions className="flex-wrap items-start gap-x-3">
                        {message.stopped && <span className="message-note">Stopped</span>}
                        <ReplySources text={message.content} />
                        <CopyAction text={message.content} />
                      </MessageActions>
                    )}
                    {isLast && !waitingHere && !live && message.suggestions && (
                      <Suggestions aria-label="Suggested questions" className="w-full flex-wrap">
                        {message.suggestions.map((question) => (
                          <Suggestion key={question} suggestion={question} onClick={(picked) => void send(picked)} disabled={pendingId !== null} />
                        ))}
                      </Suggestions>
                    )}
                  </Message>
                )
              })}
              {waitingHere && !streamHere && (
                <Message from="assistant">
                  <Reasoning className="mb-0" defaultOpen={false} isStreaming>
                    <ReasoningTrigger />
                    <ReasoningContent>Checking the pages on this site for an answer.</ReasoningContent>
                  </Reasoning>
                </Message>
              )}
              {error?.id === active?.id && (
                <Message from="assistant">
                  <MessageContent
                    role={error.stopped ? 'status' : 'alert'}
                    className={error.stopped ? 'text-muted-foreground' : 'rounded-lg px-4 py-3 ring-1 ring-border'}>
                    {error.text}
                  </MessageContent>
                  {error.retry && (
                    <MessageActions>
                      <MessageAction tooltip="Retry" label="Retry" onClick={() => void send(error.retry, true)}>
                        <RefreshCcwIcon className="size-3.5" />
                      </MessageAction>
                    </MessageActions>
                  )}
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Jump to latest" />
          </ConversationView>
        )}

        {deleted && (
          <div className="studio-toast" role="status">
            <span>Chat deleted</span>
            <button type="button" onClick={undoDelete}>
              Undo
            </button>
          </div>
        )}

        <div className="studio-composer">
          <PromptInput className="mx-auto max-w-2xl" onSubmit={() => void send(draft)}>
            <label className="sr-only" htmlFor="avatar-message">
              Message
            </label>
            <PromptInputTextarea
              id="avatar-message"
              ref={composerRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={pendingId !== null}
              placeholder="Ask about the work on this site"
              maxLength={MAX_MESSAGE_CHARS}
              autoComplete="off"
              className="min-h-12"
            />
            <PromptInputFooter>
              <PromptInputTools>
                {draft.length > MAX_MESSAGE_CHARS * 0.8 && (
                  <span className="px-2 text-muted-foreground text-xs" aria-live="polite">
                    {draft.length.toLocaleString()} / {MAX_MESSAGE_CHARS.toLocaleString()}
                  </span>
                )}
              </PromptInputTools>
              {pendingId !== null ? (
                // The stop square for the whole wait (not a spinner), so it reads as a button.
                <PromptInputSubmit status="streaming" type="button" onClick={stop} aria-label="Stop the reply (Esc)" title="Stop (Esc)" />
              ) : (
                <PromptInputSubmit disabled={!draft.trim()} aria-label="Send" />
              )}
            </PromptInputFooter>
          </PromptInput>
        </div>
      </section>
    </div>
  )
}
