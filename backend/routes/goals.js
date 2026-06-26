const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// GET /api/goals?user_id=xxx
router.get('/', async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/goals
router.post('/', async (req, res) => {
  const { user_id, title, description, category } = req.body
  if (!user_id || !title) return res.status(400).json({ error: 'user_id and title required' })

  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id, title, description, category })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('goals')
    .update({ status: 'archived' })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router