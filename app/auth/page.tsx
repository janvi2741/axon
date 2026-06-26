'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleEmailAuth = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(error.message)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Axon</h1>
          <p className="text-[#888] text-sm mt-1">
            {mode === 'login' ? 'Welcome back' : 'Start holding yourself accountable'}
          </p>
        </div>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-8">
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className={`flex-1 py-2 text-sm rounded-md transition font-medium ${
                  mode === m ? 'bg-indigo-600 text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div><button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg py-3 text-sm transition mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2a2a2a]"/>
            <span className="text-[#888] text-xs">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]"/>
          </div>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500 mb-3"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500 mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-[#888] focus:outline-none focus:border-indigo-500 mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
        <p className="text-center text-[#888] text-xs mt-6">
          By signing up you agree to be held accountable. No excuses.
        </p>
      </div>
    </main>
  )
}