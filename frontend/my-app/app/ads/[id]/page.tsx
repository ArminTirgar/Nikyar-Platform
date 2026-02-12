"use client"

import React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Heart,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  User,
  CheckCircle2,
  Loader2,
  Package,
  Sofa,
  Shirt,
  Laptop,
  Baby,
  BookOpen,
  Utensils,
  Dumbbell,
  MoreHorizontal,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { useUser } from "@/contexts/user-context"

interface Ad {
  id: number
  title: string
  description: string
  category: string
  condition: string
  location: string
  province: string
  city: string
  address?: string
  phone: string
  images: string[]
  createdAt: string
  status: "available" | "reserved" | "donated"
  user: {
    id: number
    name: string
    avatar?: string
    phone: string
    memberSince: string
    totalDonations: number
  }
}

interface SimilarAd {
  id: number
  title: string
  image_url?: string | null  // تغییر از image به image_url
  province: string            // اضافه شد
  city: string               // اضافه شد
  created_at: string         // تغییر از createdAt به created_at
  status: "available" | "reserved" | "donated"
  category?: string          // اضافه شد (در صورت نیاز)
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  furniture: Sofa,
  clothing: Shirt,
  electronics: Laptop,
  kids: Baby,
  books: BookOpen,
  kitchen: Utensils,
  sports: Dumbbell,
  other: MoreHorizontal,
}

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "لوازم خانگی",
  clothing: "پوشاک",
  electronics: "لوازم الکترونیکی",
  kids: "لوازم کودک",
  books: "کتاب و لوازم‌التحریر",
  kitchen: "لوازم آشپزخانه",
  sports: "ورزشی",
  other: "سایر",
}

const CONDITION_LABELS: Record<string, string> = {
  new: "نو",
  "like-new": "در حد نو",
  good: "سالم",
  fair: "قابل استفاده",
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const API_BASE = "http://localhost:3001"

const normalizeImageUrl = (url?: string) => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `${API_BASE}${url}`
  return `${API_BASE}/${url}`
}

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [showPhone, setShowPhone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  const {
    data: ad,
    error,
    isLoading,
  } = useSWR<Ad>(`http://localhost:3001/api/ads/${params.id}`, fetcher, {
    revalidateOnFocus: false,
  })

  const { data: similarAds } = useSWR<SimilarAd[]>(
    ad ? `http://localhost:3001/api/ads?category=${ad.category}&exclude=${ad.id}&limit=4` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      fallbackData: [],
    }
  )

  const nextImage = () => {
    if (ad?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length)
    }
  }

  const prevImage = () => {
    if (ad?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length)
    }
  }

  // تبدیل تاریخ به فرمت شمسی
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "امروز"
  if (diffDays === 1) return "دیروز"
  if (diffDays < 7) return `${diffDays} روز پیش`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
  return `${Math.floor(diffDays / 30)} ماه پیش`
}


const handleRequest = async () => {
  if (!user) {
    router.push("/login")
    return
  }

  // بررسی خالی نبودن پیام
  if (!requestMessage.trim()) {
    alert("لطفاً پیام خود را وارد کنید")
    return
  }

  setIsRequesting(true)
  try {
    const response = await fetch(`http://localhost:3001/api/ads/${params.id}/request`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // اگر نیاز به توکن دارید:
        // "Authorization": `Bearer ${user.token}`
      },
      body: JSON.stringify({
        userId: user.id,
        message: requestMessage,
      }),
    })

    // بررسی جزئیات response
    const data = await response.json()
    
    if (response.ok) {
      // نمایش پیام موفقیت
      alert("درخواست شما با موفقیت ارسال شد")
      
      setRequestDialogOpen(false)
      setRequestMessage("")
      
      // به‌روزرسانی داده‌ها
      // mutate(`http://localhost:3001/api/ads/${params.id}`)
    } else {
      // نمایش خطای دریافتی از سرور
      alert(data.message || "خطا در ارسال درخواست")
      console.error("Error response:", data)
    }
  } catch (error) {
    console.error("Error requesting ad:", error)
    alert("خطا در ارسال درخواست. لطفاً دوباره تلاش کنید")
  } finally {
    setIsRequesting(false)
  }
}

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: ad?.title,
        text: `${ad?.title} - پلتفرم نیک‌یار`,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyPhone = async () => {
    if (ad?.phone) {
      await navigator.clipboard.writeText(ad.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusBadge = (status: Ad["status"]) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-sm px-3 py-1">
            <CheckCircle2 className="h-4 w-4 ml-1" />
            موجود
          </Badge>
        )
      case "reserved":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-sm px-3 py-1">
            <Clock className="h-4 w-4 ml-1" />
            رزرو شده
          </Badge>
        )
      case "donated":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-sm px-3 py-1">
            <Heart className="h-4 w-4 ml-1 fill-current" />
            اهدا شده
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-6">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">آگهی یافت نشد</h2>
          <p className="text-muted-foreground mb-6">این آگهی وجود ندارد یا حذف شده است</p>
          <Button asChild>
            <Link href="/ads">مشاهده همه آگهی‌ها</Link>
          </Button>
        </div>
      </div>
    )
  }

  const CategoryIcon = CATEGORY_ICONS[ad.category] || Package

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">نیک‌یار</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? "text-primary" : ""}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5 fill-current" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ads" className="gap-2">
                بازگشت
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            خانه
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href="/ads" className="hover:text-primary transition-colors">
            آگهی‌ها
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href={`/search?category=${ad.category}`} className="hover:text-primary transition-colors">
            {CATEGORY_LABELS[ad.category]}
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[150px]">{ad.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
              <Image
  src={normalizeImageUrl(ad.images?.[currentImageIndex]) || "/placeholder.svg"}
  alt={ad?.title ? `تصویر آگهی: ${ad.title}` : "تصویر آگهی"}
  fill
  className="object-cover"
  unoptimized
/>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">{getStatusBadge(ad.status)}</div>

                {/* Navigation Arrows */}
                {ad.images && ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Dots */}
                {ad.images && ad.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {ad.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          index === currentImageIndex ? "bg-primary w-6" : "bg-background/60 hover:bg-background"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {ad.images && ad.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {ad.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                        }`}
                      >
                        <Image src={normalizeImageUrl(image) || "/placeholder.svg"} alt={`تصویر ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">توضیحات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {ad.description || "توضیحاتی برای این آگهی ثبت نشده است."}
                </p>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">مشخصات کالا</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">دسته‌بندی</p>
                      <p className="font-medium">{CATEGORY_LABELS[ad.category]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">وضعیت کالا</p>
                      <p className="font-medium">{CONDITION_LABELS[ad.condition] || ad.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">موقعیت</p>
                      <p className="font-medium">
                        {ad.city}، {ad.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاریخ ثبت</p>
                      <p className="font-medium">{ad.createdAt}</p>
                    </div>
                  </div>
                </div>

                {ad.address && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">آدرس</p>
                    <p className="font-medium">{ad.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Title & Actions Card */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-4">{ad.title}</h1>

                <div className="flex flex-wrap gap-2 mb-6">
                  {getStatusBadge(ad.status)}
                  <Badge variant="outline" className="gap-1">
                    <CategoryIcon className="h-3 w-3" />
                    {CATEGORY_LABELS[ad.category]}
                  </Badge>
                </div>

                {ad.status === "available" ? (
                  <div className="space-y-3">
                    <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-base gap-2">
                          <MessageSquare className="h-5 w-5" />
                          درخواست دریافت کالا
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>درخواست دریافت کالا</DialogTitle>
                          <DialogDescription>
                            پیام خود را برای اهداکننده بنویسید تا بتواند درخواست شما را بررسی کند
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">پیام شما</Label>
                            <Textarea
                              id="message"
                              placeholder="دلیل نیاز خود به این کالا را بنویسید..."
                              rows={4}
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                            انصراف
                          </Button>
                          <Button onClick={handleRequest} disabled={isRequesting || !requestMessage.trim()}>
                            {isRequesting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                در حال ارسال...
                              </>
                            ) : (
                              "ارسال درخواست"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {showPhone ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-12 text-base gap-2 font-mono bg-transparent"
                          dir="ltr"
                          onClick={copyPhone}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {ad.phone}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base gap-2 bg-transparent"
                        onClick={() => (user ? setShowPhone(true) : router.push("/login"))}
                      >
                        <Phone className="h-5 w-5" />
                        نمایش شماره تماس
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-muted-foreground">
                      {ad.status === "reserved"
                        ? "این کالا رزرو شده و در انتظار تحویل است"
                        : "این کالا قبلاً اهدا شده است"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اطلاعات اهداکننده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={ad.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {ad.user?.name?.charAt(0) || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{ad.user?.name || "کاربر نیک‌یار"}</p>
                    <p className="text-sm text-muted-foreground">عضو از {ad.user?.memberSince || "۱۴۰۳"}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">تعداد اهداها</span>
                  <span className="font-medium flex items-center gap-1">
                    <Heart className="h-4 w-4 text-primary fill-primary" />
                    {ad.user?.totalDonations || 1} مورد
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Report Card */}
            <Card>
              <CardContent className="p-4">
                <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-destructive">
                      <Flag className="h-4 w-4" />
                      گزارش تخلف
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        گزارش تخلف
                      </DialogTitle>
                      <DialogDescription>
                        اگر این آگهی تخلفی دارد، لطفاً دلیل گزارش خود را بنویسید
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea placeholder="دلیل گزارش..." rows={4} />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                        انصراف
                      </Button>
                      <Button variant="destructive">ارسال گزارش</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Ads Section */}
{similarAds && similarAds.length > 0 && (
  <section className="mt-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">آگهی‌های مشابه</h2>
      <Button variant="ghost" asChild>
        <Link href={`/search?category=${ad.category}`} className="gap-1">
          مشاهده همه
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {similarAds.map((similarAd) => {
        const imageUrl = similarAd.image_url 
          ? `http://localhost:3001${similarAd.image_url}` 
          : "/placeholder.svg"
        const location = `${similarAd.city}، ${similarAd.province}`
        const createdAt = formatDate(similarAd.created_at)

        return (
          <Link key={similarAd.id} href={`/ads/${similarAd.id}`}>
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={imageUrl}
                  alt={similarAd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute top-3 right-3">
                  {similarAd.status === "available" && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">موجود</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {similarAd.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  </section>
)}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="text-lg font-bold">پلتفرم نیک‌یار</span>
          </Link>
          <p className="text-sm text-muted-foreground">تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}
