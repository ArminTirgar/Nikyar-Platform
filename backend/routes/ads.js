import express from "express"
import { db } from "../db.js"
import multer from "multer"
import path from "path"

const router = express.Router()

/* =========================
   Multer config
========================= */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

/* =========================
   1️⃣ POST /api/ads
   ثبت آگهی جدید
========================= */

router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    console.log("POST /api/ads BODY:", req.body)
    console.log("POST /api/ads FILES:", req.files)

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

    /* پیدا کردن category_id */
    const [[cat]] = await db.query(
      "SELECT id FROM categories WHERE name = ?",
      [category]
    )

    if (!cat) {
      return res.status(400).json({ message: "دسته‌بندی نامعتبر است" })
    }

    /* درج آگهی */
    const [result] = await db.query(
      `INSERT INTO items
      (user_id, category_id, title, description, item_condition, province, city, address, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        cat.id,
        title,
        description || null,
        condition,
        province,
        city,
        address || null,
        phone,
      ]
    )

    const itemId = result.insertId

    /* ذخیره مسیر تصاویر */
    const imagePaths =
      req.files?.map((file) => `/uploads/${file.filename}`) || []

    for (const img of imagePaths) {
      await db.query(
        "INSERT INTO item_images (item_id, image_url) VALUES (?, ?)",
        [itemId, img]
      )
    }

    res.json({ success: true, itemId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "خطای سرور" })
  }
})

/* =========================
   2️⃣ GET /api/ads
   لیست همه آگهی‌ها
========================= */

router.get("/", async (req, res) => {
    const [rows] = await db.query(`
    SELECT 
      items.id,
      items.title,
      items.item_condition,
      items.province,
      items.city,
      items.created_at,
      categories.name AS category,
      MIN(item_images.image_url) AS image_url
    FROM items
    JOIN categories ON items.category_id = categories.id
    LEFT JOIN item_images ON item_images.item_id = items.id
    WHERE items.status = 'available'
    GROUP BY items.id
    ORDER BY items.created_at DESC
  `)

  res.json(rows)
})

/* =========================
   3️⃣ GET /api/ads/my?userId=1
   آگهی‌های کاربر
========================= */

router.get("/my", async (req, res) => {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ message: "userId لازم است" })
  }

  const [rows] = await db.query(
    "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  )

  res.json(rows)
})

/* =========================
   4️⃣ GET /api/ads/:id
   جزئیات آگهی
========================= */

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const [[item]] = await db.query(
    `SELECT 
      items.*,
      categories.name AS category
     FROM items
     JOIN categories ON items.category_id = categories.id
     WHERE items.id = ?`,
    [id]
  )

  if (!item) {
    return res.status(404).json({ message: "آگهی پیدا نشد" })
  }

  const [images] = await db.query(
    "SELECT image_url FROM item_images WHERE item_id = ?",
    [id]
  )

  item.images = images.map((i) => i.image_url)

  res.json(item)
})

/* =========================
   5️⃣ DELETE /api/ads/:id
   حذف آگهی (فقط صاحبش)
========================= */

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  const [[item]] = await db.query(
    "SELECT user_id FROM items WHERE id = ?",
    [id]
  )

  if (!item) {
    return res.status(404).json({ message: "آگهی پیدا نشد" })
  }

  if (item.user_id !== Number(userId)) {
    return res.status(403).json({ message: "اجازه حذف ندارید" })
  }

  await db.query("DELETE FROM items WHERE id = ?", [id])

  res.json({ success: true })
})

/* =========================
   6️⃣ POST /api/ads/:id/request
   ثبت درخواست دریافت کالا
========================= */

router.post("/:id/request", async (req, res) => {
  try {
    const { id } = req.params
    const { userId, message } = req.body

    console.log("📥 درخواست دریافت شد:", { adId: id, userId, message })

    if (!userId || !message) {
      return res.status(400).json({ message: "اطلاعات ناقص است" })
    }

    const [[item]] = await db.query(
      "SELECT id, user_id, status FROM items WHERE id = ?",
      [id]
    )

    if (!item) {
      return res.status(404).json({ message: "آگهی پیدا نشد" })
    }

    if (item.status !== "available") {
      return res.status(400).json({ 
        message: "این آگهی دیگر موجود نیست" 
      })
    }

    if (item.user_id === Number(userId)) {
      return res.status(400).json({ 
        message: "شما نمی‌توانید برای آگهی خودتان درخواست ثبت کنید" 
      })
    }

    const [[existingRequest]] = await db.query(
      "SELECT id FROM requests WHERE item_id = ? AND requester_id = ?",
      [id, userId]
    )

    if (existingRequest) {
      return res.status(400).json({ 
        message: "شما قبلاً برای این آگهی درخواست ثبت کرده‌اید" 
      })
    }

    const [result] = await db.query(
      `INSERT INTO requests 
       (item_id, requester_id, message, status) 
       VALUES (?, ?, ?, 'pending')`,
      [id, userId, message]
    )

    console.log("✅ درخواست با موفقیت ثبت شد. ID:", result.insertId)

    res.status(200).json({ 
      success: true, 
      message: "درخواست شما با موفقیت ثبت شد",
      requestId: result.insertId
    })

  } catch (err) {
    console.error("❌ خطا در ثبت درخواست:", err)
    res.status(500).json({ 
      message: "خطا در ثبت درخواست",
      error: err.message 
    })
  }
})

// ✅ GET /api/ads/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const [rows] = await db.query(
      `
      SELECT 
        i.id,
        i.title,
        c.name AS category,
        i.status,
        i.created_at AS createdAt,
        (SELECT image_url FROM item_images WHERE item_id = i.id LIMIT 1) AS imageUrl,
        0 AS views
      FROM items i
      JOIN categories c ON c.id = i.category_id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
      `,
      [userId]
    )

    return res.json(rows)
  } catch (err) {
    console.error("GET USER ADS ERROR:", err)
    return res.status(500).json({ message: "خطای داخلی سرور" })
  }
})


export default router

