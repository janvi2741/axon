'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a]">
        <span className="text-xl font-bold tracking-tight">Axon</span>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm text-[#888] hover:text-white transition">
            Sign in
          </Link>
          <Link
            href="/auth"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="inline-block text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 px-3 py-1 rounded-full mb-6">
          AI accountability — that actually remembers you
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
          Build habits with an AI that{' '}
          <span className="text-indigo-400">calls you out</span>
        </h1>
        <p className="mt-6 text-lg text-[#888] max-w-xl leading-relaxed">
          Axon checks in with you daily, remembers your history, and gives you
          honest feedback — not generic motivation.
        </p>
        <div className="flex items-center gap-4 mt-10">
          <Link
            href="/auth"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium transition text-sm"
          >
            Start for free
          </Link>
          <Link
            href="#how"
            className="text-sm text-[#888] hover:text-white transition"
          >
            See how it works →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">How Axon works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Set your goals',
              desc: 'Tell Axon what you want to build — study habits, fitness, side projects. Be specific.',
            },
            {
              step: '02',
              title: 'Check in daily',
              desc: 'Axon reaches out every day. Reply in the app, via email, or WhatsApp. Takes 2 minutes.',
            },
            {
              step: '03',
              title: 'Get real feedback',
              desc: 'Axon remembers your last 7 days and gives honest, specific feedback — not pep talks.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="text-indigo-400 text-sm font-mono mb-3">{item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-[#888] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-[#111] border-y border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Why Axon is different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI memory across check-ins',
                desc: 'Most AI tools forget you the moment you close the tab. Axon remembers your last 7 days and references them in every conversation.',
              },
              {
                title: 'Honest, not cheerful',
                desc: 'Missed 3 days? Axon won\'t say "You\'ve got this!" It\'ll ask what\'s actually in the way.',
              },
              {
                title: 'Check in your way',
                desc: 'App, email, or WhatsApp. Axon meets you where you are — no excuses to skip.',
              },
              {
                title: 'Comeback mode',
                desc: 'One missed day doesn\'t kill your streak. Axon helps you recover without the shame spiral.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6"
              >
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h2 className="text-4xl font-bold mb-4">Ready to stop letting yourself down?</h2>
        <p className="text-[#888] mb-8 max-w-md">
          Free to start. No credit card. Just you and an AI that actually holds you accountable.
        </p>
        <Link
          href="/auth"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-3 rounded-lg font-medium transition"
        >
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] px-8 py-6 text-center text-[#888] text-sm">
        © 2026 Axon. Built for people who mean it.
      </footer>

    </main>
  )
}