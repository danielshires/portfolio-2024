import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Bubble, BubbleContent, BubbleGroup } from './chat/Bubble'
import { Message, MessageContent, MessageHeader } from './chat/Message'
import { ReplyText } from './chat/ReplyText'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
  suggestions?: string[]
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
          ...(message.role === 'assistant' ? { suggestions: suggestionsOf(message.suggestions) } : {}),
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

function groupMessages(messages: ChatMessage[]) {
  const groups: Array<{ role: ChatRole; messages: ChatMessage[] }> = []
  for (const message of messages) {
    const group = groups[groups.length - 1]
    if (group?.role === message.role) group.messages.push(message)
    else groups.push({ role: message.role, messages: [message] })
  }
  return groups
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

export default function AvatarChat() {
  const initial = useRef(createConversation())
  const [conversations, setConversations] = useState<Conversation[]>([initial.current])
  const [activeId, setActiveId] = useState(initial.current.id)
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; text: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const pendingRef = useRef(false)

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]
  const waitingHere = pendingId === active?.id
  const listed = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)

  useEffect(() => {
    const stored = readStore()
    if (stored) {
      setConversations(stored.conversations)
      setActiveId(stored.activeId)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId, conversations }))
  }, [hydrated, activeId, conversations])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollTop = scroller.scrollHeight
  }, [active?.id, active?.messages, waitingHere, error])

  useEffect(() => {
    const field = composerRef.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${Math.min(field.scrollHeight, 160)}px`
  }, [draft])

  function openChat(id: string) {
    setActiveId(id)
    setDraft('')
    setError(null)
    setSidebarOpen(false)
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

  async function send(text: string) {
    const content = text.trim()
    const conversationId = active?.id
    if (!content || !conversationId || pendingRef.current) return
    if (content.length > MAX_MESSAGE_CHARS) {
      setError({ id: conversationId, text: 'Keep the message under 1,500 characters.' })
      return
    }

    pendingRef.current = true
    setPendingId(conversationId)
    setDraft('')
    setError(null)
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

    try {
      const history = [
        ...(conversations.find((conversation) => conversation.id === conversationId)?.messages ?? []),
        { role: 'user' as const, content },
      ]
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(history) }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        reply?: string
        suggestions?: unknown
        error?: string
      }
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        setError({ id: conversationId, text: data.error || 'The avatar could not reply. Try again.' })
        return
      }
      const reply = data.reply.trim()
      const suggestions = suggestionsOf(data.suggestions)?.filter(
        (item) => item.toLowerCase() !== content.toLowerCase(),
      )
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation
          return {
            ...conversation,
            messages: [...conversation.messages, { role: 'assistant', content: reply, suggestions }],
            updatedAt: Date.now(),
          }
        })
      )
    } catch {
      setError({ id: conversationId, text: 'The avatar could not reply. Try again.' })
    } finally {
      pendingRef.current = false
      setPendingId(null)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void send(draft)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(draft)
    }
  }

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
        className={`studio-controls${sidebarOpen ? ' studio-controls-open' : ''}`}
        aria-label="Conversations"
      >
        <div className="studio-controls-header">
          <h1>Digital avatar</h1>
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
        <button type="button" className="studio-new" onClick={newChat} disabled={pendingId !== null}>
          New chat
        </button>
        <ul className="studio-history">
          {listed.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                aria-current={conversation.id === active?.id ? 'true' : undefined}
                onClick={() => openChat(conversation.id)}
              >
                {conversation.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="studio-stage">
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
        <div
          ref={scrollerRef}
          className="studio-result"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={waitingHere}
        >
          {active && active.messages.length === 0 && !waitingHere && error?.id !== active.id && (
            <p className="studio-empty">{GREETING}</p>
          )}
          {active && (active.messages.length > 0 || waitingHere || error?.id === active.id) && (
          <div className="studio-thread">
            {active &&
              groupMessages(active.messages).map((group, groupIndex) => {
                const align = group.role === 'user' ? 'end' : 'start'
                const variant = group.role === 'user' ? 'default' : 'secondary'
                return (
                  <BubbleGroup key={`${group.role}-${groupIndex}`}>
                    {group.messages.map((message, index) => (
                      <Message align={align} key={`${group.role}-${groupIndex}-${index}`}>
                        <MessageContent>
                          {index === 0 && (
                            <MessageHeader>{group.role === 'user' ? 'You' : 'Dan'}</MessageHeader>
                          )}
                          <Bubble variant={variant} align={align}>
                            <BubbleContent>
                              {group.role === 'assistant' ? (
                                <ReplyText text={message.content} />
                              ) : (
                                message.content
                              )}
                            </BubbleContent>
                          </Bubble>
                          {group.role === 'assistant' &&
                            !waitingHere &&
                            message.suggestions &&
                            message.suggestions.length > 0 &&
                            message === active.messages[active.messages.length - 1] && (
                              <div className="studio-suggestions" role="group" aria-label="Suggested questions">
                                {message.suggestions.map((question) => (
                                  <button
                                    key={question}
                                    type="button"
                                    disabled={pendingId !== null}
                                    onClick={() => void send(question)}
                                  >
                                    {question}
                                  </button>
                                ))}
                              </div>
                            )}
                        </MessageContent>
                      </Message>
                    ))}
                  </BubbleGroup>
                )
              })}
            {waitingHere && (
              <Message align="start">
                <MessageContent>
                  <MessageHeader>Dan</MessageHeader>
                  <Bubble variant="muted" align="start">
                    <BubbleContent>
                      <span role="status">Thinking…</span>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            )}
            {error?.id === active?.id && (
              <Message align="start">
                <MessageContent>
                  <Bubble variant="destructive" align="start">
                    <BubbleContent role="alert">{error.text}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            )}
          </div>
          )}
        </div>

        <form className="studio-composer" onSubmit={onSubmit}>
          <label className="studio-sr" htmlFor="avatar-message">
            Message
          </label>
          <div className="studio-composer-bar">
            <textarea
              ref={composerRef}
              id="avatar-message"
              name="message"
              rows={1}
              maxLength={MAX_MESSAGE_CHARS}
              value={draft}
              disabled={pendingId !== null}
              placeholder="Ask about the work on this site"
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" disabled={pendingId !== null || !draft.trim()}>
              {waitingHere ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
