const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
const goalsRouter = require('./routes/goals')
const checkinRouter = require('./routes/checkin')

app.use('/api/goals', goalsRouter)
app.use('/api/checkin', checkinRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Axon backend running on port ${PORT}`))