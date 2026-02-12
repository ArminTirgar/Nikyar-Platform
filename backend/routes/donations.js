import express from "express"
import { db } from "../db.js"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// تنظیمات آپلود فایل
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/receipts"))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("فقط فایل‌های تصویری (JPG, PNG) یا PDF مجاز هستند"))
    }
  },
})

/* =========================
   1️⃣ POST /api/donations
   ثبت کمک مالی جدید
========================= */
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const { userId, bankName, cardNumber, amount, donorName, message } = req.body

    console.log("📥 Donation data:", req.body)
    console.log("📎 Receipt file:", req.file)

    if (!bankName || !cardNumber || !amount) {
      return res.status(400).json({ message: "اطلاعات ناقص است" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "لطفاً تصویر فیش واریزی را آپلود کنید" })
    }

    const receiptPath = "/uploads/receipts/" + req.file.filename

    const [result] = await db.query(
      `INSERT INTO donations 
        (user_id, bank_name, card_number, amount, donor_name, message, receipt_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, bankName, cardNumber, amount, donorName || null, message || null, receiptPath]
    )
    const [admins] = await db.query(
  "SELECT id FROM users WHERE role IN ('admin', 'moderator')"
)

for (const admin of admins) {
  await db.query(
    `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
     VALUES (?, 'new_ad', 'آگهی جدید', ?, ?, 'ad')`,
    [admin.id, `آگهی "${title}" در انتظار بررسی شماست`, result.insertId]
  )
}

    console.log("✅ Donation saved with ID:", result.insertId)

    res.status(201).json({
      success: true,
      message: "کمک مالی شما با موفقیت ثبت شد و در انتظار تایید است",
      donationId: result.insertId,
    })
  } catch (err) {
    console.error("❌ Error saving donation:", err)
    res.status(500).json({ message: "خطای سرور", error: err.message })
  }
})

/* =========================
   2️⃣ GET /api/donations
   دریافت لیست کمک‌های مالی (برای ادمین)
========================= */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query

    let query = `
      SELECT 
        d.*,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
    `

    if (status) {
      query += ` WHERE d.status = ?`
    }

    query += ` ORDER BY d.created_at DESC`

    const [rows] = status ? await db.query(query, [status]) : await db.query(query)

    res.json(rows)
  } catch (err) {
    console.error("❌ Error fetching donations:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   3️⃣ GET /api/donations/user/:userId
   دریافت کمک‌های مالی یک کاربر
========================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const [rows] = await db.query(
      `SELECT * FROM donations 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    )

    res.json(rows)
  } catch (err) {
    console.error("❌ Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   4️⃣ PUT /api/donations/:id/verify
   تایید کمک مالی توسط ادمین
========================= */
router.put("/:id/verify", async (req, res) => {
  try {
    const { id } = req.params
    const { adminId, status, adminNote } = req.body

    await db.query(
      `UPDATE donations 
       SET status = ?, 
           verified_at = CURRENT_TIMESTAMP, 
           verified_by = ?,
           admin_note = ?
       WHERE id = ?`,
      [status, adminId, adminNote || null, id]
    )

    res.json({ success: true, message: "وضعیت به‌روزرسانی شد" })
  } catch (err) {
    console.error("❌ Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

export default router