import express from "express"
import { db } from "../db.js"

const router = express.Router()

/* =========================
   MIDDLEWARE: بررسی دسترسی ادمین
========================= */
const isAdmin = async (req, res, next) => {
  const { userId } = req.body || req.query

  if (!userId) {
    return res.status(401).json({ message: "احراز هویت لازم است" })
  }

  try {
    const [[user]] = await db.query("SELECT role FROM users WHERE id = ?", [userId])

    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return res.status(403).json({ message: "دسترسی مجاز نیست" })
    }

    next()
  } catch (err) {
    console.error("❌ isAdmin error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
}

/* =========================
   📊 DASHBOARD - آمار کلی
========================= */
router.get("/stats", isAdmin, async (req, res) => {
  try {
    // آمار آگهی‌ها
    const [[adStats]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN admin_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN admin_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN admin_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'donated' THEN 1 ELSE 0 END) as donated
      FROM items
    `)

    // آمار کمک‌های مالی
    const [[donationStats]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM donations
    `)

    // آمار کاربران
    const [[userStats]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM users
    `)

    res.json({
      ads: adStats,
      donations: donationStats,
      users: userStats,
    })
  } catch (err) {
    console.error("❌ Stats Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   📢 NOTIFICATIONS - دریافت نوتیفیکیشن‌ها
========================= */
router.get("/notifications", isAdmin, async (req, res) => {
  try {
    const { userId } = req.query

    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    )

    // ✅ FIX: حذف alias اضافی "a"
    const [[unreadCount]] = await db.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    )

    res.json({
      notifications,
      unreadCount: unreadCount.count,
    })
  } catch (err) {
    console.error("❌ Notifications Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   📢 MARK NOTIFICATION AS READ
========================= */
router.put("/notifications/:id/read", isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id])

    res.json({ success: true })
  } catch (err) {
    console.error("❌ Mark read error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   📦 ADS MANAGEMENT - لیست آگهی‌ها
========================= */
router.get("/ads", isAdmin, async (req, res) => {
  try {
    const { status } = req.query

    let query = `
      SELECT 
        i.*,
        c.name AS category_name,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        (SELECT image_url FROM item_images WHERE item_id = i.id LIMIT 1) AS image_url
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
    `

    if (status) {
      query += ` WHERE i.admin_status = ?`
    }

    query += ` ORDER BY i.created_at DESC`

    const [rows] = status ? await db.query(query, [status]) : await db.query(query)

    res.json(rows)
  } catch (err) {
    console.error("❌ Get Ads Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   ✅ APPROVE AD
========================= */
router.put("/ads/:id/approve", isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { userId, adminNote } = req.body

    const [[ad]] = await db.query("SELECT * FROM items WHERE id = ?", [id])

    if (!ad) {
      return res.status(404).json({ message: "آگهی یافت نشد" })
    }

    await db.query(
      `UPDATE items 
       SET admin_status = 'approved',
           reviewed_by = ?,
           reviewed_at = CURRENT_TIMESTAMP,
           admin_note = ?
       WHERE id = ?`,
      [userId, adminNote || null, id]
    )

    // ایجاد نوتیفیکیشن برای کاربر
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES (?, 'ad_approved', 'آگهی شما تایید شد', ?, ?, 'ad')`,
      [ad.user_id, `آگهی "${ad.title}" توسط ادمین تایید و منتشر شد`, id]
    )

    res.json({ success: true, message: "آگهی تایید شد" })
  } catch (err) {
    console.error("❌ Approve Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   ❌ REJECT AD
========================= */
router.put("/ads/:id/reject", isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { userId, adminNote } = req.body

    const [[ad]] = await db.query("SELECT * FROM items WHERE id = ?", [id])

    if (!ad) {
      return res.status(404).json({ message: "آگهی یافت نشد" })
    }

    await db.query(
      `UPDATE items 
       SET admin_status = 'rejected',
           reviewed_by = ?,
           reviewed_at = CURRENT_TIMESTAMP,
           admin_note = ?
       WHERE id = ?`,
      [userId, adminNote || null, id]
    )

    // نوتیفیکیشن
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES (?, 'ad_rejected', 'آگهی شما رد شد', ?, ?, 'ad')`,
      [ad.user_id, `آگهی "${ad.title}" رد شد. ${adminNote || ""}`, id]
    )

    res.json({ success: true, message: "آگهی رد شد" })
  } catch (err) {
    console.error("❌ Reject Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   🗑️ DELETE AD
========================= */
router.delete("/ads/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await db.query("DELETE FROM items WHERE id = ?", [id])

    res.json({ success: true, message: "آگهی حذف شد" })
  } catch (err) {
    console.error("❌ Delete Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   💰 DONATIONS MANAGEMENT
========================= */
router.get("/donations", isAdmin, async (req, res) => {
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
    console.error("❌ Get Donations Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   ✅ VERIFY DONATION
========================= */
router.put("/donations/:id/verify", isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { userId, status, adminNote } = req.body

    const [[donation]] = await db.query("SELECT * FROM donations WHERE id = ?", [id])

    if (!donation) {
      return res.status(404).json({ message: "کمک مالی یافت نشد" })
    }

    await db.query(
      `UPDATE donations 
       SET status = ?,
           verified_at = CURRENT_TIMESTAMP,
           verified_by = ?,
           admin_note = ?
       WHERE id = ?`,
      [status, userId, adminNote || null, id]
    )

    // نوتیفیکیشن
    if (donation.user_id) {
      const message =
        status === "verified"
          ? `کمک مالی شما به مبلغ ${donation.amount} تومان تایید شد. سپاس از مهربانی شما!`
          : `کمک مالی شما رد شد. ${adminNote || ""}`

      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
         VALUES (?, 'donation_verified', ?, ?, ?, 'donation')`,
        [
          donation.user_id,
          status === "verified" ? "کمک مالی شما تایید شد" : "کمک مالی شما رد شد",
          message,
          id,
        ]
      )
    }

    res.json({ success: true, message: "وضعیت به‌روزرسانی شد" })
  } catch (err) {
    console.error("❌ Verify Donation Error:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

export default router