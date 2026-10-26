import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
}

const GREETING =
  'Ask about the work, writing, and notes published on this site. If it is not on the site, I will say so.'

const MAX_MESSAGE_CHARS = 1500

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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollTop = scroller.scrollHeight
  }, [messages, waiting, error])

  async function send(text: string) {
    const content = text.trim()
    if (!content || waiting) return
    if (content.length > MAX_MESSAGE_CHARS) {
      setError('Keep the message under 1,500 characters.')
      return
    }

    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setDraft('')
    setError(null)
    setWaiting(true)

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(next) }),
      })
      const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string }
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        setError(data.error || 'The avatar could not reply. Try again.')
        return
      }
      setMessages([...next, { role: 'assistant', content: data.reply.trim() }])
    } catch {
      setError('The avatar could not reply. Try again.')
    } finally {
      setWaiting(false)
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
      <form className="studio-controls" onSubmit={onSubmit}>
        <h1>Digital avatar</h1>
        <p className="studio-note">{GREETING}</p>
        <label htmlFor="avatar-message" className="studio-label">
          Message
        </label>
        <textarea
          id="avatar-message"
          name="message"
          maxLength={MAX_MESSAGE_CHARS}
          value={draft}
          disabled={waiting}
          placeholder="Ask about the work on this site"
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" disabled={waiting || !draft.trim()}>
          {waiting ? 'Thinking…' : 'Send'}
        </button>
      </form>

      <div
        ref={scrollerRef}
        className="studio-result"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={waiting}
      >
        {messages.length === 0 && <p className="studio-note">The reply shows up here.</p>}
        {messages.map((message, index) => (
          <div className="studio-message" key={`${message.role}-${index}`}>
            <p className="studio-label">{message.role === 'user' ? 'You' : 'Dan'}</p>
            <p>{message.content}</p>
          </div>
        ))}
        {error && (
          <p className="studio-message" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
