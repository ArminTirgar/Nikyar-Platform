import express from "express"
import { db } from "../db.js"
import multer from "multer"
import path from "path"

const router = express.Router()

/* =========================
   📁 Multer Configuration
========================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

/* =========================
   1️⃣ POST /api/ads - ثبت آگهی جدید
========================= */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    console.log("📥 POST /api/ads BODY:", req.body)
    console.log("📸 FILES:", req.files)

    const {
      title,
      category,
      condition,
      description,
      province,
      city,
      address,
      phone,
      userId,
    } = req.body

    if (!userId || !title || !category || !condition || !province || !city || !phone) {
      return res.status(400).json({ message: "فیلدهای الزامی کامل نیستند" })
    }

    // پیدا کردن category_id
    const [[cat]] = await db.query("SELECT id FROM categories WHERE name = ?", [category])

    if (!cat) {
      return res.status(400).json({ message: "دسته‌بندی نامعتبر است" })
    }

    // درج آگهی با وضعیت pending (منتظر تایید ادمین)
    const [result] = await db.query(
      `INSERT INTO items
      (user_id, category_id, title, description, item_condition, province, city, address, phone, status, admin_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'pending')`,
      [userId, cat.id, title, description || null, condition, province, city, address || null, phone]
    )

    const itemId = result.insertId

    // ذخیره تصاویر
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imagePath = `/uploads/${req.files[i].filename}`
        const isPrimary = i === 0 // اولین عکس به عنوان عکس اصلی
        
        await db.query(
          "INSERT INTO item_images (item_id, image_url, is_primary) VALUES (?, ?, ?)",
          [itemId, imagePath, isPrimary]
        )
      }
    }

    // ارسال نوتیفیکیشن به ادمین‌ها
    const [admins] = await db.query("SELECT id FROM users WHERE role IN ('admin', 'moderator')")
    
    for (const admin of admins) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
         VALUES (?, 'new_ad', 'آگهی جدید', ?, ?, 'ad')`,
        [admin.id, `آگهی "${title}" در انتظار بررسی شماست`, itemId]
      )
    }

    console.log(`✅ آگهی ${itemId} ثبت شد (pending)`)

    res.status(201).json({
      success: true,
      message: "آگهی شما ثبت شد و پس از تایید ادمین منتشر خواهد شد",
      itemId,
    })
  } catch (err) {
    console.error("❌ خطا در ثبت آگهی:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   2️⃣ GET /api/ads - لیست آگهی‌ها (فقط تایید شده)
========================= */
router.get("/", async (req, res) => {
  try {
    const { category, province, city, search, status } = req.query

    let query = `
      SELECT 
        items.id,
        items.title,
        items.description,
        items.item_condition,
        items.province,
        items.city,
        items.status,
        items.created_at,
        categories.name AS category,
        (SELECT image_url FROM item_images WHERE item_id = items.id ORDER BY is_primary DESC LIMIT 1) AS image_url
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      WHERE items.admin_status = 'approved'
    `

    const params = []

    // فیلتر دسته‌بندی
    if (category && category !== "all") {
      query += ` AND categories.name = ?`
      params.push(category)
    }

    // فیلتر استان
    if (province) {
      query += ` AND items.province = ?`
      params.push(province)
    }

    // فیلتر شهر
    if (city) {
      query += ` AND items.city = ?`
      params.push(city)
    }

    // فیلتر وضعیت کالا
    if (status && status !== "all") {
      query += ` AND items.status = ?`
      params.push(status)
    }

    // جستجو
    if (search) {
      query += ` AND (items.title LIKE ? OR items.description LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY items.created_at DESC LIMIT 100`

    const [rows] = await db.query(query, params)
    
    console.log(`📋 ${rows.length} آگهی تایید شده یافت شد`)
    
    res.json(rows)
  } catch (err) {
    console.error("❌ خطا در دریافت آگهی‌ها:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   3️⃣ GET /api/ads/my - آگهی‌های من (همه وضعیت‌ها)
========================= */
router.get("/my", async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: "userId لازم است" })
    }

    const [rows] = await db.query(
      `SELECT 
        items.*,
        categories.name AS category,
        (SELECT image_url FROM item_images WHERE item_id = items.id ORDER BY is_primary DESC LIMIT 1) AS image_url
       FROM items
       LEFT JOIN categories ON items.category_id = categories.id
       WHERE items.user_id = ?
       ORDER BY items.created_at DESC`,
      [userId]
    )

    console.log(`📋 ${rows.length} آگهی برای کاربر ${userId}`)
    
    res.json(rows)
  } catch (err) {
    console.error("❌ خطا:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   4️⃣ GET /api/ads/:id - جزئیات آگهی (فقط تایید شده)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const [[item]] = await db.query(
      `SELECT 
        items.*,
        categories.name AS category,
        CONCAT(users.first_name, ' ', users.last_name) AS user_name,
        users.phone AS user_phone
       FROM items
       LEFT JOIN categories ON items.category_id = categories.id
       LEFT JOIN users ON items.user_id = users.id
       WHERE items.id = ? AND items.admin_status = 'approved'`,
      [id]
    )

    if (!item) {
      return res.status(404).json({ message: "آگهی پیدا نشد یا هنوز تایید نشده" })
    }

    // دریافت تصاویر
    const [images] = await db.query(
      "SELECT image_url FROM item_images WHERE item_id = ? ORDER BY is_primary DESC",
      [id]
    )

    item.images = images.map((i) => i.image_url)

    // افزایش تعداد بازدید
    await db.query("UPDATE items SET views = COALESCE(views, 0) + 1 WHERE id = ?", [id])

    res.json(item)
  } catch (err) {
    console.error("❌ خطا:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   5️⃣ DELETE /api/ads/:id - حذف آگهی
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const [[item]] = await db.query("SELECT user_id FROM items WHERE id = ?", [id])

    if (!item) {
      return res.status(404).json({ message: "آگهی پیدا نشد" })
    }

    if (item.user_id !== Number(userId)) {
      return res.status(403).json({ message: "شما مجاز به حذف این آگهی نیستید" })
    }

    // حذف تصاویر
    await db.query("DELETE FROM item_images WHERE item_id = ?", [id])

    // حذف درخواست‌ها
    await db.query("DELETE FROM requests WHERE item_id = ?", [id])

    // حذف آگهی
    await db.query("DELETE FROM items WHERE id = ?", [id])

    console.log(`🗑️ آگهی ${id} حذف شد`)

    res.json({ success: true, message: "آگهی حذف شد" })
  } catch (err) {
    console.error("❌ خطا:", err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   6️⃣ POST /api/ads/:id/request - ثبت درخواست دریافت
========================= */
router.post("/:id/request", async (req, res) => {
  try {
    const { id } = req.params
    const { userId, message } = req.body

    console.log("📥 درخواست دریافت شد:", { adId: id, userId, message })

    if (!userId || !message) {
      return res.status(400).json({ message: "اطلاعات ناقص است" })
    }

    // بررسی آگهی
    const [[item]] = await db.query(
      "SELECT id, user_id, status, admin_status FROM items WHERE id = ?",
      [id]
    )

    if (!item) {
      return res.status(404).json({ message: "آگهی پیدا نشد" })
    }

    if (item.admin_status !== "approved") {
      return res.status(400).json({ message: "این آگهی هنوز تایید نشده است" })
    }

    if (item.status !== "available") {
      return res.status(400).json({ message: "این آگهی دیگر موجود نیست" })
    }

    if (item.user_id === Number(userId)) {
      return res.status(400).json({ message: "شما نمی‌توانید برای آگهی خودتان درخواست ثبت کنید" })
    }

    // بررسی درخواست تکراری
    const [[existingRequest]] = await db.query(
      "SELECT id FROM requests WHERE item_id = ? AND requester_id = ?",
      [id, userId]
    )

    if (existingRequest) {
      return res.status(400).json({ message: "شما قبلاً برای این آگهی درخواست ثبت کرده‌اید" })
    }

    // ثبت درخواست
    const [result] = await db.query(
      `INSERT INTO requests (item_id, requester_id, message, status, shipping_status) 
       VALUES (?, ?, ?, 'pending', 'not_shipped')`,
      [id, userId, message]
    )

    console.log("✅ درخواست ثبت شد. ID:", result.insertId)

    res.status(200).json({
      success: true,
      message: "درخواست شما با موفقیت ثبت شد",
      requestId: result.insertId,
    })
  } catch (err) {
    console.error("❌ خطا:", err)
    res.status(500).json({ message: "خطا در ثبت درخواست" })
  }
})

export default router