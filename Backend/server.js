require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
