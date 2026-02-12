import express from "express"
import { db } from "../db.js"

const router = express.Router()

router.post("/register", async (req, res) => {
  console.log("📥 REGISTER BODY:", req.body)

  const { firstName, lastName, email, password } = req.body || {}

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "همه فیلدها الزامی هستند" })
  }

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email])

    if (existing.length > 0) {
      return res.status(400).json({ message: "این ایمیل قبلاً ثبت شده" })
    }

    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, password]
    )

    console.log("✅ User registered:", result.insertId)

    // ✅ Response با first_name و last_name
    return res.status(201).json({
      id: result.insertId,
      first_name: firstName,  // ✅ تغییر
      last_name: lastName,    // ✅ تغییر
      email,
      role: "member",
    })
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err)
    return res.status(500).json({ message: "خطای داخلی سرور" })
  }
})

router.post("/login", async (req, res) => {
  console.log("📥 LOGIN REQUEST:", { email: req.body.email })

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "ایمیل و رمز عبور الزامی است" })
  }

  try {
    const [users] = await db.query(
      "SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?",
      [email]
    )

    if (users.length === 0) {
      console.log("❌ User not found:", email)
      return res.status(401).json({ message: "کاربری با این ایمیل وجود ندارد" })
    }

    const user = users[0]

    // مقایسه مستقیم password
    if (user.password !== password) {
      console.log("❌ Wrong password for:", email)
      return res.status(401).json({ message: "رمز عبور اشتباه است" })
    }

    console.log("✅ Login successful:", { id: user.id, email: user.email, role: user.role })

    // ✅ Response با first_name و last_name
    res.json({
      id: user.id,
      first_name: user.first_name,  // ✅ تغییر
      last_name: user.last_name,    // ✅ تغییر
      email: user.email,
      role: user.role,
    })
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err)
    return res.status(500).json({ message: "خطای سرور" })
  }
})

export default router