import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import adsRoutes from "./routes/ads.js"
import requestsRoutes from "./routes/requests.js"
import path from "path"

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Static files
app.use('/uploads', express.static('uploads'))

// ✅ Routes
app.use('/api/ads', adsRoutes)
app.use('/api/requests', requestsRoutes)
// ... سایر rout

app.use(express.json())

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001")
})
