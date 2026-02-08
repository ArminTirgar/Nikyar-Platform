import express from "express"
import { db } from "../db.js"

const router = express.Router()

/* =========================
   1️⃣ GET /api/requests/received/:userId
   دریافت درخواست‌های دریافتی کاربر
========================= */
router.get("/received/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const [rows] = await db.query(
      `SELECT 
        r.id,
        r.status,
        r.message,
        r.shipping_status,
        r.tracking_info,
        r.created_at,
        r.approved_at,
        r.shipped_at,
        r.delivered_at,
        i.id AS item_id,
        i.title AS item_title,
        i.status AS item_status,
        u.id AS requester_id,
        u.FirstName AS requester_name,
        u.Email AS requester_email,
        u.Phone AS requester_phone
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.requester_id = u.id
      WHERE i.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    )

    res.json(rows)
  } catch (err) {
    console.error("خطا در دریافت درخواست‌های دریافتی:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   2️⃣ GET /api/requests/sent/:userId
   دریافت درخواست‌های ارسالی کاربر
========================= */
router.get("/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const [rows] = await db.query(
      `SELECT 
        r.id,
        r.status,
        r.message,
        r.shipping_status,
        r.tracking_info,
        r.created_at,
        r.approved_at,
        r.shipped_at,
        r.delivered_at,
        i.id AS item_id,
        i.title AS item_title,
        i.status AS item_status,
        owner.id AS owner_id,
        owner.FirstName AS owner_name,
        owner.Email AS owner_email,
        owner.Phone AS owner_phone
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users owner ON i.user_id = owner.id
      WHERE r.requester_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    )

    res.json(rows)
  } catch (err) {
    console.error("خطا در دریافت درخواست‌های ارسالی:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   3️⃣ PUT /api/requests/:id/approve
   تایید درخواست
========================= */
router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const [[request]] = await db.query(
      `SELECT r.*, i.user_id, i.status AS item_status 
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request) {
      return res.status(404).json({ message: "درخواست یافت نشد" })
    }

    if (request.user_id !== Number(userId)) {
      return res.status(403).json({ message: "شما مجاز به این عملیات نیستید" })
    }

    if (request.item_status !== "available") {
      return res.status(400).json({ message: "این کالا دیگر موجود نیست" })
    }

    await db.query(
      `UPDATE requests 
       SET status = 'approved', approved_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    )

    await db.query(
      `UPDATE items SET status = 'reserved' WHERE id = ?`,
      [request.item_id]
    )

    await db.query(
      `UPDATE requests 
       SET status = 'rejected' 
       WHERE item_id = ? AND id != ? AND status = 'pending'`,
      [request.item_id, id]
    )

    res.json({ success: true, message: "درخواست تایید شد" })
  } catch (err) {
    console.error("خطا در تایید درخواست:", err)
    res.status(500).json({ message: "خطای سرور", error: err.message })
  }
})

/* =========================
   4️⃣ PUT /api/requests/:id/reject
   رد درخواست
========================= */
router.put("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const [[request]] = await db.query(
      `SELECT r.*, i.user_id 
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request) {
      return res.status(404).json({ message: "درخواست یافت نشد" })
    }

    if (request.user_id !== Number(userId)) {
      return res.status(403).json({ message: "شما مجاز به این عملیات نیستید" })
    }

    await db.query(
      `UPDATE requests SET status = 'rejected' WHERE id = ?`,
      [id]
    )

    res.json({ success: true, message: "درخواست رد شد" })
  } catch (err) {
    console.error("خطا در رد درخواست:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   5️⃣ PUT /api/requests/:id/ship
   ثبت ارسال کالا
========================= */
router.put("/:id/ship", async (req, res) => {
  try {
    const { id } = req.params
    const { userId, trackingInfo } = req.body

    const [[request]] = await db.query(
      `SELECT r.*, i.user_id 
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request || request.user_id !== Number(userId)) {
      return res.status(403).json({ message: "عملیات غیرمجاز" })
    }

    if (request.status !== "approved") {
      return res.status(400).json({ message: "ابتدا باید درخواست را تایید کنید" })
    }

    await db.query(
      `UPDATE requests 
       SET shipping_status = 'shipped', 
           tracking_info = ?, 
           shipped_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [trackingInfo || null, id]
    )

    res.json({ success: true, message: "وضعیت ارسال به‌روزرسانی شد" })
  } catch (err) {
    console.error("خطا در ثبت ارسال:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   6️⃣ PUT /api/requests/:id/delivered
   تایید دریافت کالا
========================= */
router.put("/:id/delivered", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const [[request]] = await db.query(
      `SELECT r.*, i.id AS item_id 
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request || request.requester_id !== Number(userId)) {
      return res.status(403).json({ message: "عملیات غیرمجاز" })
    }

    await db.query(
      `UPDATE requests 
       SET shipping_status = 'delivered', 
           delivered_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    )

    await db.query(
      `UPDATE items SET status = 'donated' WHERE id = ?`,
      [request.item_id]
    )

    res.json({ success: true, message: "دریافت کالا تایید شد" })
  } catch (err) {
    console.error("خطا در تایید دریافت:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

export default router