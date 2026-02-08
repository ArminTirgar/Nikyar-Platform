import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import adsRoutes from "./routes/ads.js"
import requestsRoutes from "./routes/requests.js"
import path from "path"

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/ads", adsRoutes)
app.use("/api/requests", requestsRoutes)


app.use(express.json())

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001")
})
