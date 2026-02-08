import express from "express"
import { db } from "../db.js"

const router = express.Router()

router.post("/register", async (req, res) => {
  console.log("REGISTER BODY:", req.body)

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

    return res.status(201).json({
      id: result.insertId,
      firstName,
      lastName,
      email,
      role: "member",
    })
  } catch (err) {
    console.error("REGISTER ERROR:", err)
    return res.status(500).json({ message: "خطای داخلی سرور" })
  }
})


router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "ایمیل و رمز عبور الزامی است" })
  }

  // پیدا کردن کاربر
  const [users] = await db.query(
    "SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?",
    [email]
  )

  if (users.length === 0) {
    return res.status(401).json({ message: "کاربری با این ایمیل وجود ندارد" })
  }

  const user = users[0]

  // چون پروژه ساده است → مقایسه مستقیم
  if (user.password !== password) {
    return res.status(401).json({ message: "رمز عبور اشتباه است" })
  }

  // لاگین موفق
  res.json({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
  })
})


export default router
