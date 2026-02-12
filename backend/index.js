import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import adsRoutes from "./routes/ads.js"
import requestsRoutes from "./routes/requests.js"
import donationsRoutes from './routes/donations.js'
import adminRoutes from './routes/admin.js'

const app = express()

// ✅ CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// ✅ Body parsers (فقط یکبار)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Static files
app.use('/uploads', express.static('uploads'))

// ✅ Debug middleware (اختیاری - برای debug)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`)
  next()
})

// ✅ Routes
app.use('/api/auth', authRoutes)        // 👈 این خط نبود! اضافه شد
app.use('/api/ads', adsRoutes)
app.use('/api/requests', requestsRoutes)
app.use('/api/donations', donationsRoutes)
app.use('/api/admin', adminRoutes)

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Nikyar API is running!',
    endpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/ads',
      '/api/requests',
      '/api/donations',
      '/api/admin'
    ]
  })
})

// ✅ 404 handler
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`)
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  })
})

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📍 API endpoints:`)
  console.log(`   - http://localhost:${PORT}/api/auth/login`)
  console.log(`   - http://localhost:${PORT}/api/auth/register`)
  console.log(`   - http://localhost:${PORT}/api/ads`)
  console.log(`   - http://localhost:${PORT}/api/admin`)
})

export default app