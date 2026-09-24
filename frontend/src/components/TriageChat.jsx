import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  HeartPulse,
  Send,
  X,
  MessageCircle,
  Loader2,
  PhoneCall,
  AlertTriangle,
  Bot,
  User
} from 'lucide-react'

const TRIAGE_API = 'http://localhost:5000/api/triage'

const SUGGESTIONS = [
  'I am having chest pain and shortness of breath',
  'Someone cut their arm badly and it is bleeding a lot',
  'My friend hit their head and is dizzy',
  'I think I am having an allergic reaction'
]

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    "Hello, I'm your CareConnect AI Triage Assistant. Describe any symptoms, injuries, or emergency situation you or someone else is experiencing. I'll help guide you through immediate next steps.\n\nFor life-threatening emergencies, always call **112** immediately."
}

export default function TriageChat({ alwaysOpen = false } = {}) {
  const [open, setOpen] = useState(alwaysOpen)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])

  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  async function sendMessage(text) {
    const userText = text?.trim()
    if (!userText || loading) return

    const userMsg = { role: 'user', content: userText }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(TRIAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      })
      const data = await res.json()
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Triage assistant is temporarily unavailable.')
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '> ⚠️ **Triage assistant is temporarily unavailable.**\n>\n> If this is an emergency, **call 112 immediately**.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function toggle() {
    if (alwaysOpen) return
    setOpen((v) => !v)
  }

  if (!open && !alwaysOpen) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="triage-fab"
        aria-label="Open AI triage chat"
      >
        <MessageCircle size={22} />
      </button>
    )
  }

  return (
    <aside className={`triage-panel ${alwaysOpen ? 'triage-panel--embedded' : ''}`}>
      <header className="triage-header">
        <div className="triage-title">
          <div className="triage-icon-wrap">
            <HeartPulse size={18} />
          </div>
          <div>
            <h3>AI Triage Assistant</h3>
            <p>Safety-conscious emergency guidance</p>
          </div>
        </div>
        {!alwaysOpen && (
          <button
            type="button"
            className="triage-close"
            onClick={toggle}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        )}
      </header>

      <div className="triage-emergency-banner">
        <PhoneCall size={14} />
        <span>
          In an immediate medical emergency, <strong>call 112 now</strong>.
        </span>
      </div>

      <div className="triage-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`triage-msg ${m.role === 'user' ? 'user' : 'ai'}`}
          >
            <div className={`triage-avatar ${m.role}`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="triage-bubble">
              {m.role === 'ai' ? (
                <div className="triage-bubble-markdown">
                  <ReactMarkdown
                    components={{
                      blockquote({ children }) {
                        return <div className="triage-alert-callout">{children}</div>
                      },
                      h1({ children }) {
                        return <h4 className="triage-section-title">{children}</h4>
                      },
                      h2({ children }) {
                        return <h4 className="triage-section-title">{children}</h4>
                      },
                      h3({ children }) {
                        return <h4 className="triage-section-title">{children}</h4>
                      },
                      ol({ children }) {
                        return <ol className="triage-ordered-list">{children}</ol>
                      },
                      ul({ children }) {
                        return <ul className="triage-unordered-list">{children}</ul>
                      },
                      li({ children }) {
                        return <li className="triage-list-item">{children}</li>
                      },
                      p({ children }) {
                        return <p className="triage-paragraph">{children}</p>
                      },
                      strong({ children }) {
                        return <strong className="triage-strong">{children}</strong>
                      }
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="triage-paragraph">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="triage-msg ai">
            <div className="triage-avatar ai">
              <Bot size={14} />
            </div>
            <div className="triage-bubble triage-loading">
              <Loader2 size={16} className="spinner" />
              <span>Analyzing symptoms…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="triage-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className="triage-suggestion"
              onClick={() => sendMessage(s)}
              disabled={loading}
            >
              <AlertTriangle size={12} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}

      <form className="triage-input" onSubmit={onSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe symptoms or situation…"
          disabled={loading}
          aria-label="Describe symptoms"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </aside>
  )
}
