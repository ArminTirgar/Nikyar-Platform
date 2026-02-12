import express from "express"
import { db } from "../db.js"

const router = express.Router()

/* =========================
   1️⃣ GET /api/requests/received/:userId
   دریافت درخواست‌های دریافتی کاربر (اهداکننده)
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
        r.delivery_method,
        r.postal_company,
        r.recipient_address,
        r.tracking_info,
        r.created_at,
        r.approved_at,
        r.shipped_at,
        r.delivered_at,
        i.id AS item_id,
        i.title AS item_title,
        i.status AS item_status,
        u.id AS requester_id,
        CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
        u.email AS requester_email,
        NULL AS requester_phone
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.requester_id = u.id
      WHERE i.user_id = ?
      ORDER BY 
        CASE r.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        r.created_at DESC`,
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
   دریافت درخواست‌های ارسالی کاربر (نیازمند)
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
        r.delivery_method,
        r.postal_company,
        r.recipient_address,
        r.tracking_info,
        r.created_at,
        r.approved_at,
        r.shipped_at,
        r.delivered_at,
        i.id AS item_id,
        i.title AS item_title,
        i.status AS item_status,
        owner.id AS owner_id,
        CONCAT(owner.first_name, ' ', owner.last_name) AS owner_name,
        owner.email AS owner_email,
        NULL AS owner_phone
      FROM requests r
      JOIN items i ON r.item_id = i.id
      JOIN users owner ON i.user_id = owner.id
      WHERE r.requester_id = ?
      ORDER BY 
        CASE r.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        r.created_at DESC`,
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
   تایید درخواست و رزرو کالا
========================= */
router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    console.log(`📥 Approving request ${id} by user ${userId}`)

    const [[request]] = await db.query(
      `SELECT r.*, i.user_id, i.status AS item_status, i.title AS item_title
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request) {
      console.log(`❌ Request ${id} not found`)
      return res.status(404).json({ message: "درخواست یافت نشد" })
    }

    if (request.user_id !== Number(userId)) {
      console.log(`❌ User ${userId} not authorized for request ${id}`)
      return res.status(403).json({ message: "شما مجاز به این عملیات نیستید" })
    }

    if (request.item_status !== "available") {
      console.log(`❌ Item ${request.item_id} is not available (${request.item_status})`)
      return res.status(400).json({ message: "این کالا دیگر موجود نیست" })
    }

    if (request.status !== "pending") {
      console.log(`❌ Request ${id} is not pending (${request.status})`)
      return res.status(400).json({ message: "این درخواست قبلاً پردازش شده است" })
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

    const [rejectedResult] = await db.query(
      `UPDATE requests 
       SET status = 'rejected' 
       WHERE item_id = ? AND id != ? AND status = 'pending'`,
      [request.item_id, id]
    )

    console.log(`✅ Request ${id} approved, item ${request.item_id} reserved`)
    console.log(`✅ ${rejectedResult.affectedRows} other requests rejected`)

    res.json({ 
      success: true, 
      message: `درخواست تایید شد. کالا "${request.item_title}" رزرو شد.`,
      rejectedCount: rejectedResult.affectedRows
    })
  } catch (err) {
    console.error("❌ خطا در تایید درخواست:", err)
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

    console.log(`📥 Rejecting request ${id} by user ${userId}`)

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

    if (request.status !== "pending") {
      return res.status(400).json({ message: "فقط درخواست‌های در انتظار را می‌توانید رد کنید" })
    }

    await db.query(
      `UPDATE requests SET status = 'rejected' WHERE id = ?`,
      [id]
    )

    console.log(`✅ Request ${id} rejected`)

    res.json({ success: true, message: "درخواست رد شد" })
  } catch (err) {
    console.error("❌ خطا در رد درخواست:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   5️⃣ PUT /api/requests/:id/ship
   ثبت ارسال کالا با انتخاب روش تحویل
========================= */
router.put("/:id/ship", async (req, res) => {
  try {
    const { id } = req.params
    const { 
      userId, 
      deliveryMethod,
      postalCompany,
      trackingInfo,
      recipientAddress
    } = req.body

    console.log(`📦 Shipping request ${id}:`, { deliveryMethod, postalCompany, trackingInfo })

    const [[request]] = await db.query(
      `SELECT r.*, i.user_id, i.title AS item_title
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

    if (request.shipping_status === "shipped") {
      return res.status(400).json({ message: "این کالا قبلاً ارسال شده است" })
    }

    await db.query(
      `UPDATE requests 
       SET shipping_status = 'shipped',
           delivery_method = ?,
           postal_company = ?,
           tracking_info = ?,
           recipient_address = ?,
           shipped_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        deliveryMethod || 'post',
        postalCompany || null,
        trackingInfo || null,
        recipientAddress || null,
        id
      ]
    )

    console.log(`✅ Request ${id} marked as shipped`)

    let message = "اطلاعات ارسال ثبت شد"
    if (deliveryMethod === "post" && postalCompany) {
      message += ` - ارسال با ${postalCompany}`
    } else if (deliveryMethod === "in_person") {
      message += " - تحویل حضوری"
    }

    res.json({ 
      success: true, 
      message,
      data: {
        deliveryMethod,
        postalCompany,
        trackingInfo
      }
    })
  } catch (err) {
    console.error("❌ خطا در ثبت ارسال:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   6️⃣ PUT /api/requests/:id/delivered
   تایید دریافت کالا توسط نیازمند
========================= */
router.put("/:id/delivered", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    console.log(`📥 Confirming delivery for request ${id} by user ${userId}`)

    const [[request]] = await db.query(
      `SELECT r.*, i.id AS item_id, i.title AS item_title
       FROM requests r 
       JOIN items i ON r.item_id = i.id 
       WHERE r.id = ?`,
      [id]
    )

    if (!request) {
      return res.status(404).json({ message: "درخواست یافت نشد" })
    }

    if (request.requester_id !== Number(userId)) {
      return res.status(403).json({ message: "فقط گیرنده می‌تواند دریافت کالا را تایید کند" })
    }

    if (request.status !== "approved") {
      return res.status(400).json({ message: "این درخواست تایید نشده است" })
    }

    if (request.shipping_status !== "shipped") {
      return res.status(400).json({ message: "کالا هنوز ارسال نشده است" })
    }

    if (request.shipping_status === "delivered") {
      return res.status(400).json({ message: "دریافت کالا قبلاً تایید شده است" })
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

    console.log(`✅ Request ${id} delivered, item ${request.item_id} marked as donated`)

    res.json({ 
      success: true, 
      message: `دریافت کالا "${request.item_title}" تایید شد و فرآیند اهدا کامل شد! 🎉`
    })
  } catch (err) {
    console.error("❌ خطا در تایید دریافت:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

export default router