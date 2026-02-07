"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Heart,
  ArrowRight,
  Upload,
  X,
  ImagePlus,
  Loader2,
  Sofa,
  Shirt,
  Laptop,
  Baby,
  BookOpen,
  Utensils,
  Dumbbell,
  MoreHorizontal,
  MapPin,
  Phone,
  Info,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@/contexts/user-context"

const CATEGORIES = [
  { id: "furniture", label: "لوازم خانگی", icon: Sofa },
  { id: "clothing", label: "پوشاک", icon: Shirt },
  { id: "electronics", label: "لوازم الکترونیکی", icon: Laptop },
  { id: "kids", label: "لوازم کودک", icon: Baby },
  { id: "books", label: "کتاب و لوازم‌التحریر", icon: BookOpen },
  { id: "kitchen", label: "لوازم آشپزخانه", icon: Utensils },
  { id: "sports", label: "ورزشی", icon: Dumbbell },
  { id: "other", label: "سایر", icon: MoreHorizontal },
]

const CONDITIONS = [
  { value: "new", label: "نو", description: "استفاده نشده و در بسته‌بندی" },
  { value: "like-new", label: "در حد نو", description: "بسیار کم‌کارکرد، بدون خط و خش" },
  { value: "good", label: "سالم", description: "استفاده شده ولی سالم و قابل استفاده" },
  { value: "fair", label: "قابل استفاده", description: "دارای آثار استفاده ولی کاربردی" },
]

const PROVINCES = [
  "تهران",
  "اصفهان",
  "فارس",
  "خراسان رضوی",
  "آذربایجان شرقی",
  "مازندران",
  "خوزستان",
  "البرز",
  "گیلان",
  "کرمان",
  "آذربایجان غربی",
  "سیستان و بلوچستان",
  "کرمانشاه",
  "گلستان",
  "هرمزگان",
  "لرستان",
  "همدان",
  "کردستان",
  "مرکزی",
  "قم",
  "اردبیل",
  "یزد",
  "زنجان",
  "بوشهر",
  "قزوین",
  "چهارمحال و بختیاری",
  "خراسان شمالی",
  "خراسان جنوبی",
  "کهگیلویه و بویراحمد",
  "سمنان",
  "ایلام",
]

export default function NewAdPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])


  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    description: "",
    province: "",
    city: "",
    address: "",
    phone: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  setImages((prev) => [...prev, ...files].slice(0, 5))
}


const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    const data = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })

    data.append("userId", String(user?.id))

    images.forEach((file) => {
      data.append("images", file)
    })

    const response = await fetch("http://localhost:3001/api/ads", {
      method: "POST",
      body: data, // ❗️ headers نذار
    })

    if (response.ok) {
      router.push("/dashboard")
    }
  } finally {
    setIsSubmitting(false)
  }
}


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold">نیک‌یار</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              بازگشت
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ثبت آگهی جدید</h1>
          <p className="text-muted-foreground">کالای خود را برای اهدا به نیازمندان ثبت کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" />
                تصاویر کالا
              </CardTitle>
              <CardDescription>حداکثر ۵ تصویر از کالای خود آپلود کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group"
                  >
                    <Image src={URL.createObjectURL(image)} alt="preview" fill />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 left-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">افزودن</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                اطلاعات کالا
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان آگهی *</Label>
                <Input
                  id="title"
                  placeholder="مثال: مبل راحتی ۷ نفره"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label>دسته‌بندی *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = formData.category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <Label>وضعیت کالا *</Label>
                <RadioGroup
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {CONDITIONS.map((cond) => (
                    <label
                      key={cond.value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.condition === cond.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={cond.value} />
                      <div>
                        <p className="font-medium">{cond.label}</p>
                        <p className="text-xs text-muted-foreground">{cond.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  placeholder="توضیحات بیشتر درباره کالا، دلیل اهدا و ..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                موقعیت مکانی
              </CardTitle>
              <CardDescription>آدرس تحویل کالا را مشخص کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">استان *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب استان" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">شهر *</Label>
                  <Input
                    id="city"
                    placeholder="نام شهر"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">آدرس دقیق (اختیاری)</Label>
                <Textarea
                  id="address"
                  placeholder="آدرس دقیق برای تحویل کالا"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                اطلاعات تماس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="text-left"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">این شماره فقط به نیازمندان تایید شده نمایش داده می‌شود</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1 h-14 text-base gap-2"
              disabled={isSubmitting || !formData.title || !formData.category || !formData.condition}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  ثبت آگهی
                  <Heart className="h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 bg-transparent"
              onClick={() => router.back()}
            >
              انصراف
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
