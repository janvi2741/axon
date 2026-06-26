const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// POST /api/checkin
router.post('/', async (req, res) => {
  const { user_id, goal_id, user_message, mood } = req.body
  if (!user_id || !goal_id || !user_message) {
    return res.status(400).json({ error: 'user_id, goal_id, user_message required' })
  }

  // 1. Fetch goal details
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goal_id)
    .single()

  // 2. Fetch last 7 check-in summaries for memory
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('date, status, ai_summary, mood')
    .eq('goal_id', goal_id)
    .order('date', { ascending: false })
    .limit(7)

  const memoryContext = recentCheckins && recentCheckins.length > 0
    ? recentCheckins
        .map(c => `${c.date}: ${c.status} — ${c.ai_summary || 'no summary'} (mood: ${c.mood || 'N/A'}/5)`)
        .join('\n')
    : 'No previous check-ins yet. This is the first one.'

  // 3. Build prompt
  const systemPrompt = `You are Axon, a direct and honest AI accountability agent. 
You help users build habits by checking in with them daily.
You are NOT a cheerleader. You are honest, specific, and constructive.
You remember their history and reference it when relevant.
Keep responses under 120 words. End with one specific question or challenge.

GOAL: ${goal.title}
${goal.description ? `DESCRIPTION: ${goal.description}` : ''}
STREAK: ${goal.streak_count} days

RECENT HISTORY (last 7 days):
${memoryContext}`

  // 4. Call Groq
  let aiResponse = ''
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: user_message }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
    aiResponse = completion.choices[0].message.content
  } catch (err) {
    return res.status(500).json({ error: 'Groq API error: ' + err.message })
  }

  // 5. Generate a short summary for memory
  let aiSummary = ''
  try {
    const summaryCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Summarize this check-in in ONE sentence (max 20 words): User said: "${user_message}". AI responded: "${aiResponse}"`
        }
      ],
      max_tokens: 40,
      temperature: 0.3
    })
    aiSummary = summaryCompletion.choices[0].message.content
  } catch (err) {
    aiSummary = user_message.substring(0, 80)
  }

  // 6. Save check-in to DB
  const today = new Date().toISOString().split('T')[0]
  const { data: checkin, error: dbError } = await supabase
    .from('checkins')
    .upsert({
      user_id,
      goal_id,
      date: today,
      status: 'done',
      user_message,
      ai_response: aiResponse,
      ai_summary: aiSummary,
      mood: mood || null,
      channel: 'app'
    }, { onConflict: 'goal_id,date' })
    .select()
    .single()

  if (dbError) return res.status(500).json({ error: dbError.message })

  // 7. Update streak
  await updateStreak(goal_id, goal)

  res.json({ ai_response: aiResponse, checkin })
})

async function updateStreak(goal_id, goal) {
  const { data: checkins } = await supabase
    .from('checkins')
    .select('date')
    .eq('goal_id', goal_id)
    .eq('status', 'done')
    .order('date', { ascending: false })
    .limit(30)

  if (!checkins || checkins.length === 0) return

  let streak = 0
  const today = new Date()

  for (let i = 0; i < checkins.length; i++) {
    const checkinDate = new Date(checkins[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (checkinDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++
    } else {
      break
    }
  }

  const newLongest = Math.max(streak, goal.longest_streak || 0)
  await supabase
    .from('goals')
    .update({ streak_count: streak, longest_streak: newLongest })
    .eq('id', goal_id)
}

module.exports = router