import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react'
import { chatbotApi } from '../services/api'

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      text: 'Hello! I am your AI Campus Care Assistant. You can ask me how to file maintenance requests, check campus repair SLAs, emergency safety guidelines, or inquire about the live status of any ticket by typing its ID (e.g., CMP-1001).',
      source: 'Campus Care AI Knowledge System'
    }
  ])

  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (queryText = null) => {
    const q = (queryText || inputQuery).trim()
    if (!q || loading) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q
    }

    setMessages((prev) => [...prev, userMsg])
    setInputQuery('')
    setLoading(true)

    try {
      const res = await chatbotApi.sendQuery(q)
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data?.answer || 'No response received.',
        source: res.data?.source || 'Campus Knowledge Base'
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'The AI Assistant is currently offline. Please ensure both Node.js backend (port 5000) and Python ML service (port 8000) are running.',
          source: 'System Offline'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer"
          title="Open AI Campus Maintenance Assistant"
        >
          <Bot className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-blue-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Campus Care AI Assistant</h3>
                <p className="text-[11px] text-blue-200">RAG Knowledge Base & Live Triage</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto p-2.5 bg-slate-50 border-b border-slate-100 no-scrollbar">
            {[
              'How to submit complaint?',
              'What is repair SLA?',
              'Emergency contacts',
              'Check CMP-1001'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.source && (
                    <p className="mt-1.5 border-t border-slate-100 pt-1 text-[10px] text-slate-400">
                      Source: {m.source}
                    </p>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white text-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Bot className="h-4 w-4 text-blue-600 animate-spin" />
                <span>Searching knowledge base and campus database...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                type="text"
                placeholder="Ask a question or enter CMP ID..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-transparent text-xs text-slate-900 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || loading}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
