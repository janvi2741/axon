'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  streak_count: number
  longest_streak: number
  status: string
}

interface Profile {
  name: string
}

export default function Dashboard() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalDesc, setNewGoalDesc] = useState('')
  const [newGoalCategory, setNewGoalCategory] = useState('personal')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUserId(session.user.id)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single()
      setProfile(profileData)

      // Fetch goals
      await fetchGoals(session.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchGoals = async (uid: string) => {
    const res = await fetch(`http://localhost:4000/api/goals?user_id=${uid}`)
    const data = await res.json()
    setGoals(Array.isArray(data) ? data : [])
  }

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim() || !userId) return
    setAdding(true)
    await fetch('http://localhost:4000/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        title: newGoalTitle,
        description: newGoalDesc,
        category: newGoalCategory
      })
    })
    setNewGoalTitle('')
    setNewGoalDesc('')
    setNewGoalCategory('personal')
    setShowAddGoal(false)
    await fetchGoals(userId)
    setAdding(false)
  }

  const handleDeleteGoal = async (goalId: string) => {
    await fetch(`http://localhost:4000/api/goals/${goalId}`, { method: 'DELETE' })
    if (userId) await fetchGoals(userId)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const categoryColors: Record<string, string> = {
    personal: 'bg-indigo-600/20 text-indigo-400',
    fitness: 'bg-green-600/20 text-green-400',
    study: 'bg-yellow-600/20 text-yellow-400',
    work: 'bg-blue-600/20 text-blue-400',
    health: 'bg-red-600/20 text-red-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#888] text-sm">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a]">
        <span className="text-xl font-bold tracking-tight">Axon</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#888]">
            {profile?.name || 'Hey there'}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#888] hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Goals</h1>
            <p className="text-[#888] text-sm mt-1">
              {goals.length === 0
                ? 'Add your first goal to get started'
                : `${goals.length} active goal${goals.length > 1 ? 's' : ''}`}
            </p>
          </div>
          {goals.length < 3 && (
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add goal
            </button>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">New goal</h2>
              <input
                type="text"
                placeholder="Goal title (e.g. Study DSA daily)"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500 mb-3"
              />
              <textarea
                placeholder="Description (optional)"
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500 mb-3 resize-none"
              />
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4"
              >
                <option value="personal">Personal</option>
                <option value="fitness">Fitness</option>
                <option value="study">Study</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] py-2 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={adding || !newGoalTitle.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  {adding ? 'Adding...' : 'Add goal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-lg font-semibold mb-2">No goals yet</h2>
            <p className="text-[#888] text-sm mb-6 max-w-xs">
              Add up to 3 goals. Axon will check in with you on each one daily.
            </p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              Add your first goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[goal.category] || categoryColors.personal}`}>
                      {goal.category}
                    </span>
                    {goal.streak_count > 0 && (
                      <span className="text-xs text-orange-400 font-medium">
                        🔥 {goal.streak_count} day streak
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-1">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-[#888] text-sm">{goal.description}</p>
                  )}
                  {goal.longest_streak > 0 && (
                    <p className="text-xs text-[#555] mt-2">
                      Best streak: {goal.longest_streak} days
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Link
                    href={`/checkin?goal_id=${goal.id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                  >
                    Check in
                  </Link>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-xs text-[#555] hover:text-red-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}