'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

interface Message {
  role: 'user' | 'ai'
  content: string
}

interface Goal {
  id: string
  title: string
  streak_count: number
  category: string
}

function CheckinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const goalId = searchParams.get('goal_id')

  const [userId, setUserId] = useState<string | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [mood, setMood] = useState<number | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)

      if (!goalId) { router.push('/dashboard'); return }

      // Fetch goal
      const res = await fetch(`http://localhost:4000/api/goals?user_id=${session.user.id}`)
      const goals = await res.json()
      const found = goals.find((g: Goal) => g.id === goalId)
      if (!found) { router.push('/dashboard'); return }
      setGoal(found)

      // Opening message from Axon
      setMessages([{
        role: 'ai',
        content: `Hey! Let's talk about "${found.title}". ${found.streak_count > 0 ? `You're on a ${found.streak_count}-day streak 🔥 — don't break it.` : `This is a fresh start.`} How did today go?`
      }])

      setPageLoading(false)
    }
    init()
  }, [router, goalId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || !userId || !goalId) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:4000/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal_id: goalId,
          user_message: userMessage,
          mood: mood
        })
      })
      const data = await res.json()

      if (data.ai_response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.ai_response }])
        setCheckedIn(true)
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Something went wrong. Try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Could not reach the server. Is the backend running?' }])
    }

    setLoading(false)
  }

  const categoryColors: Record<string, string> = {
    personal: 'text-indigo-400',
    fitness: 'text-green-400',
    study: 'text-yellow-400',
    work: 'text-blue-400',
    health: 'text-red-400',
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#888] text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a]">
        <Link href="/dashboard" className="text-[#888] hover:text-white text-sm transition">
          ← Dashboard
        </Link>
        <span className="text-xl font-bold tracking-tight">Axon</span>
        <div className="w-24" />
      </nav>

      {/* Goal header */}
      <div className="border-b border-[#2a2a2a] px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <p className={`text-xs font-medium mb-1 ${categoryColors[goal?.category || 'personal']}`}>
            {goal?.category}
          </p>
          <h2 className="font-semibold">{goal?.title}</h2>
          {goal && goal.streak_count > 0 && (
            <p className="text-xs text-orange-400 mt-1">🔥 {goal.streak_count} day streak</p>
          )}
        </div>
      </div>

      {/* Mood picker */}
      {!checkedIn && (
        <div className="border-b border-[#2a2a2a] px-8 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <span className="text-xs text-[#888]">Today's mood:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setMood(n)}
                className={`text-lg transition ${mood === n ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
              >
                {['😞', '😕', '😐', '🙂', '😄'][n - 1]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0">
                  A
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#1a1a1a] text-[#ededed] rounded-bl-sm border border-[#2a2a2a]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
                A
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {checkedIn && (
            <div className="text-center py-4">
              <p className="text-xs text-[#555] mb-3">Check-in saved ✓</p>
              <Link
                href="/dashboard"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                Back to dashboard →
              </Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#2a2a2a] px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={checkedIn ? 'Keep the conversation going...' : 'How did today go?'}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
          >
            Send
          </button>
        </div>
      </div>

    </main>
  )
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#888] text-sm">Loading...</div>
      </div>
    }>
      <CheckinContent />
    </Suspense>
  )
}