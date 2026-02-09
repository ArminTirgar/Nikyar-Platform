"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  ArrowRight,
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Gift,
  HandHeart,
  Truck,
  Check,
  X as XIcon,
  Loader2,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  MapPin,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import useSWR, { mutate } from "swr"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface Ad {
  id: string
  title: string
  category: string
  status: "available" | "reserved" | "donated"
  created_at: string
  views: number
  image_url?: string
}

type RequestStatus = "pending" | "approved" | "rejected"
type ShippingStatus = "not_shipped" | "shipped" | "delivered"
type DeliveryMethod = "post" | "in_person"

interface ReceivedRequest {
  id: number
  status: RequestStatus
  shipping_status: ShippingStatus
  delivery_method?: DeliveryMethod
  postal_company?: string
  recipient_address?: string
  tracking_info?: string
  message?: string
  created_at: string
  approved_at?: string
  shipped_at?: string
  delivered_at?: string
  item_id: number
  item_title: string
  item_status: string
  requester_id: number
  requester_name: string
  requester_email: string
  requester_phone?: string
}

interface SentRequest {
  id: number
  status: RequestStatus
  shipping_status: ShippingStatus
  delivery_method?: DeliveryMethod
  postal_company?: string
  recipient_address?: string
  tracking_info?: string
  message?: string
  created_at: string
  approved_at?: string
  shipped_at?: string
  delivered_at?: string
  item_id: number
  item_title: string
  item_status: string
  owner_id: number
  owner_name: string
  owner_email: string
  owner_phone?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const STATUS_MAP = {
  available: { label: "موجود", variant: "default" as const, icon: CheckCircle2 },
  reserved: { label: "رزرو شده", variant: "secondary" as const, icon: Clock },
  donated: { label: "اهدا شده", variant: "outline" as const, icon: Gift },
} as const

const POSTAL_COMPANIES = [
  { value: "post-pishtaz", label: "پست پیشتاز" },
  { value: "tipax", label: "تیپاکس" },
  { value: "post-sefareshi", label: "پست سفارشی" },
  { value: "snapbox", label: "اسنپ‌باکس" },
] as const

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  const [selectedRequest, setSelectedRequest] = useState<ReceivedRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  
  // فیلدهای دایالوگ ارسال
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("post")
  const [postalCompany, setPostalCompany] = useState("")
  const [trackingInfo, setTrackingInfo] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false)
  const [selectedSentRequest, setSelectedSentRequest] = useState<SentRequest | null>(null)

  const { data: userAds, error } = useSWR<Ad[]>(
    user ? `http://localhost:3001/api/ads/my?userId=${user.id}` : null,
    fetcher
  )

  const { data: receivedRequests, error: receivedError } = useSWR<ReceivedRequest[]>(
    user ? `http://localhost:3001/api/requests/received/${user.id}` : null,
    fetcher
  )

  const { data: sentRequests, error: sentError } = useSWR<SentRequest[]>(
    user ? `http://localhost:3001/api/requests/sent/${user.id}` : null,
    fetcher
  )

  // 🔍 Debug: ببینیم چه دیتایی میاد
  useEffect(() => {
    if (receivedRequests) {
      console.log("📥 Received Requests Data:", receivedRequests)
      console.log("📊 Is Array?", Array.isArray(receivedRequests))
    }
    if (receivedError) {
      console.error("❌ Received Requests Error:", receivedError)
    }
  }, [receivedRequests, receivedError])

  useEffect(() => {
    if (sentRequests) {
      console.log("📥 Sent Requests Data:", sentRequests)
      console.log("📊 Is Array?", Array.isArray(sentRequests))
    }
    if (sentError) {
      console.error("❌ Sent Requests Error:", sentError)
    }
  }, [sentRequests, sentError])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // 🔧 تایید درخواست
  const handleApprove = async (requestId: number) => {
    setActionLoading(true)
    try {
      console.log("📤 Sending approve request:", { requestId, userId: user?.id })
      
      const res = await fetch(`http://localhost:3001/api/requests/${requestId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await res.json()
      console.log("📥 Approve response:", data)

      if (res.ok) {
        alert(`✅ ${data.message}`)
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        mutate(`http://localhost:3001/api/ads/my?userId=${user?.id}`)
        setSelectedRequest(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error("❌ Error approving:", error)
      alert("خطا در تایید درخواست")
    } finally {
      setActionLoading(false)
    }
  }

  // 🔧 رد درخواست
  const handleReject = async (requestId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این درخواست را رد کنید؟")) return

    setActionLoading(true)
    try {
      console.log("📤 Sending reject request:", { requestId, userId: user?.id })
      
      const res = await fetch(`http://localhost:3001/api/requests/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await res.json()
      console.log("📥 Reject response:", data)

      if (res.ok) {
        alert(`✅ ${data.message}`)
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        setSelectedRequest(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error("❌ Error rejecting:", error)
      alert("خطا در رد درخواست")
    } finally {
      setActionLoading(false)
    }
  }

  // 🔧 ثبت ارسال کالا
  const handleShip = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const payload = {
        userId: user?.id,
        deliveryMethod,
        postalCompany: deliveryMethod === "post" ? postalCompany : null,
        trackingInfo: deliveryMethod === "post" ? trackingInfo : null,
        recipientAddress: deliveryMethod === "in_person" ? recipientAddress : null,
      }

      console.log("📤 Sending ship request:", payload)

      const res = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log("📥 Ship response:", data)

      if (res.ok) {
        alert(`✅ ${data.message}`)
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        setTrackingDialogOpen(false)
        // Reset form
        setDeliveryMethod("post")
        setPostalCompany("")
        setTrackingInfo("")
        setRecipientAddress("")
        setSelectedRequest(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error("❌ Error shipping:", error)
      alert("خطا در ثبت ارسال")
    } finally {
      setActionLoading(false)
    }
  }

  // 🔧 تایید دریافت کالا
  const handleConfirmDelivery = async () => {
    if (!selectedSentRequest) return

    setActionLoading(true)
    try {
      console.log("📤 Sending delivery confirmation:", { 
        requestId: selectedSentRequest.id, 
        userId: user?.id 
      })

      const res = await fetch(`http://localhost:3001/api/requests/${selectedSentRequest.id}/delivered`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await res.json()
      console.log("📥 Delivery confirmation response:", data)

      if (res.ok) {
        alert(`✅ ${data.message}`)
        mutate(`http://localhost:3001/api/requests/sent/${user?.id}`)
        mutate(`http://localhost:3001/api/ads/my?userId=${user?.id}`)
        setConfirmDeliveryOpen(false)
        setSelectedSentRequest(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error("❌ Error confirming delivery:", error)
      alert("خطا در تایید دریافت")
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const stats = {
    totalAds: userAds?.length || 0,
    activeAds: userAds?.filter((ad) => ad.status === "available").length || 0,
    donatedAds: userAds?.filter((ad) => ad.status === "donated").length || 0,
    totalViews: userAds?.reduce((acc, ad) => acc + (ad.views || 0), 0) || 0,
  }

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
            <Link href="/" className="gap-2">
              بازگشت
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">سلام، {user.FirstName}</h1>
          <p className="text-muted-foreground">خوش آمدید به پنل کاربری نیک‌یار</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAds}</p>
                  <p className="text-xs text-muted-foreground">کل آگهی‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeAds}</p>
                  <p className="text-xs text-muted-foreground">آگهی فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warm/10 flex items-center justify-center">
                  <HandHeart className="h-5 w-5 text-warm" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.donatedAds}</p>
                  <p className="text-xs text-muted-foreground">اهدا شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">بازدید</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-ads" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="my-ads" className="gap-2">
                <Package className="h-4 w-4" />
                آگهی‌های من
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Users className="h-4 w-4" />
                درخواست‌ها
                {receivedRequests && Array.isArray(receivedRequests) && receivedRequests.filter((r) => r.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {receivedRequests.filter((r) => r.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <Button className="gap-2" asChild>
              <Link href="/ads/new">
                <Plus className="h-4 w-4" />
                ثبت آگهی جدید
              </Link>
            </Button>
          </div>

          {/* My Ads Tab */}
          <TabsContent value="my-ads">
            <Card>
              <CardHeader>
                <CardTitle>آگهی‌های من</CardTitle>
                <CardDescription>لیست تمام آگهی‌هایی که ثبت کرده‌اید</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-8 text-destructive">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>خطا در دریافت آگهی‌ها</p>
                    <p className="text-sm mt-2">{error.message || "لطفاً دوباره تلاش کنید"}</p>
                  </div>
                ) : !userAds || userAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">هنوز آگهی ثبت نکرده‌اید</h3>
                    <p className="text-muted-foreground mb-4">اولین آگهی خود را ثبت کنید و به نیازمندان کمک کنید</p>
                    <Button asChild>
                      <Link href="/ads/new" className="gap-2">
                        <Plus className="h-4 w-4" />
                        ثبت آگهی جدید
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAds.map((ad) => {
                      const statusInfo = STATUS_MAP[ad.status]
                      const StatusIcon = statusInfo?.icon || Package
                      const imageUrl = ad.image_url 
                        ? `http://localhost:3001${ad.image_url}` 
                        : null

                      return (
                        <div
                          key={ad.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          {/* تصویر */}
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Failed to load image:", imageUrl)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* اطلاعات */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate mb-1">{ad.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{ad.category}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {statusInfo && (
                                <Badge variant={statusInfo.variant} className="gap-1">
                                  <StatusIcon className="h-3 w-3" />
                                  {statusInfo.label}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {ad.views || 0} بازدید
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(ad.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* دکمه‌های عملیات */}
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="مشاهده آگهی"
                              asChild
                            >
                              <Link href={`/ads/${ad.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="ویرایش آگهی"
                              onClick={() => router.push(`/ads/${ad.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="حذف آگهی"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                if (!confirm(`آیا مطمئن هستید که می‌خواهید "${ad.title}" را حذف کنید؟`)) {
                                  return
                                }

                                try {
                                  const res = await fetch(`http://localhost:3001/api/ads/${ad.id}`, {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ userId: user?.id }),
                                  })

                                  if (res.ok) {
                                    alert("✅ آگهی با موفقیت حذف شد")
                                    mutate(`http://localhost:3001/api/ads/my?userId=${user?.id}`)
                                  } else {
                                    const data = await res.json()
                                    alert(`❌ ${data.message || "خطا در حذف آگهی"}`)
                                  }
                                } catch (error) {
                                  console.error("Delete error:", error)
                                  alert("❌ خطا در حذف آگهی")
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>درخواست‌ها</CardTitle>
                <CardDescription>مدیریت درخواست‌های دریافتی و ارسالی</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="received" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="received" className="gap-2">
                      <Users className="h-4 w-4" />
                      دریافتی
                      {receivedRequests && Array.isArray(receivedRequests) && receivedRequests.filter((r) => r.status === "pending").length > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {receivedRequests.filter((r) => r.status === "pending").length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="gap-2">
                      <HandHeart className="h-4 w-4" />
                      ارسالی
                    </TabsTrigger>
                  </TabsList>

                  {/* Received Requests */}
                  <TabsContent value="received">
                    {receivedError ? (
                      <div className="text-center py-8 text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>خطا در دریافت درخواست‌ها</p>
                      </div>
                    ) : !receivedRequests || !Array.isArray(receivedRequests) || receivedRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">درخواستی وجود ندارد</h3>
                        <p className="text-muted-foreground">هنوز کسی برای آگهی‌های شما درخواستی ارسال نکرده است</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receivedRequests.map((req) => (
                          <Card key={req.id} className="overflow-hidden border-l-4 border-l-primary/20">
                            <CardContent className="p-4">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate mb-1 text-lg">{req.item_title}</h4>
                                  <div className="flex flex-col gap-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="h-3.5 w-3.5" />
                                      <span className="font-medium">{req.requester_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-3.5 w-3.5" />
                                      <span className="text-xs">{req.requester_email}</span>
                                    </div>
                                    {req.requester_phone && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span className="text-xs direction-ltr">{req.requester_phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                  <Badge
                                    variant={
                                      req.status === "pending"
                                        ? "secondary"
                                        : req.status === "approved"
                                          ? "default"
                                          : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {req.status === "pending" && "⏳ در انتظار تایید"}
                                    {req.status === "approved" && "✅ تایید شده"}
                                    {req.status === "rejected" && "❌ رد شده"}
                                  </Badge>

                                  {req.status === "approved" && (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                      <Truck className="h-3 w-3" />
                                      {req.shipping_status === "not_shipped" && "آماده ارسال"}
                                      {req.shipping_status === "shipped" && "ارسال شده"}
                                      {req.shipping_status === "delivered" && "تحویل داده شده"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Message */}
                              {req.message && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mb-3 border border-blue-100 dark:border-blue-900">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">پیام نیازمند:</p>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">{req.message}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Delivery Info */}
                              {req.delivery_method && (
                                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 mb-3 border border-purple-200 dark:border-purple-800">
                                  <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
                                    🚚 روش تحویل:
                                  </p>
                                  <div className="space-y-1.5">
                                    {req.delivery_method === "post" ? (
                                      <>
                                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                          <Truck className="h-3.5 w-3.5" />
                                          <span>ارسال پستی</span>
                                        </div>
                                        {req.postal_company && (
                                          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                            <Building2 className="h-3.5 w-3.5" />
                                            <span>{req.postal_company}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                        <HandHeart className="h-3.5 w-3.5" />
                                        <span>تحویل حضوری</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tracking Info */}
                              {req.tracking_info && (
                                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 mb-3 border border-green-200 dark:border-green-800">
                                  <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">کد رهگیری:</p>
                                  <p className="text-sm font-mono text-green-700 dark:text-green-300">{req.tracking_info}</p>
                                </div>
                              )}

                              {/* Recipient Address */}
                              {req.recipient_address && (
                                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 mb-3 border border-amber-200 dark:border-amber-800">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">آدرس تحویل:</p>
                                      <p className="text-sm text-amber-700 dark:text-amber-300">{req.recipient_address}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Timeline */}
                              {req.status !== "pending" && (
                                <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                  <p className="text-xs font-medium mb-2">وضعیت پیگیری:</p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                      <span>ثبت درخواست: {formatDate(req.created_at)}</span>
                                    </div>
                                    {req.approved_at && (
                                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>تایید شده: {formatDate(req.approved_at)}</span>
                                      </div>
                                    )}
                                    {req.shipped_at && (
                                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span>ارسال شده: {formatDate(req.shipped_at)}</span>
                                      </div>
                                    )}
                                    {req.delivered_at && (
                                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                                        <Gift className="h-3.5 w-3.5" />
                                        <span>تحویل داده شده: {formatDate(req.delivered_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {req.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(req.id)}
                                      disabled={actionLoading}
                                      className="gap-1.5"
                                    >
                                      {actionLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                      تایید و رزرو کالا
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(req.id)}
                                      disabled={actionLoading}
                                      className="gap-1.5"
                                    >
                                      <XIcon className="h-3.5 w-3.5" />
                                      رد درخواست
                                    </Button>
                                  </>
                                )}

                                {req.status === "approved" && req.shipping_status === "not_shipped" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedRequest(req)
                                      setTrackingDialogOpen(true)
                                    }}
                                    className="gap-1.5"
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    انتخاب روش تحویل
                                  </Button>
                                )}

                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/ads/${req.item_id}`} className="gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    مشاهده آگهی
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Sent Requests */}
                  <TabsContent value="sent">
                    {sentError ? (
                      <div className="text-center py-8 text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>خطا در دریافت درخواست‌ها</p>
                      </div>
                    ) : !sentRequests || !Array.isArray(sentRequests) || sentRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <HandHeart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">درخواستی ارسال نکرده‌اید</h3>
                        <p className="text-muted-foreground">برای دریافت کالا، درخواست خود را ثبت کنید</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentRequests.map((req) => (
                          <Card key={req.id} className="overflow-hidden border-l-4 border-l-warm/20">
                            <CardContent className="p-4">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate mb-1 text-lg">{req.item_title}</h4>
                                  <div className="flex flex-col gap-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="h-3.5 w-3.5" />
                                      <span>اهداکننده: <span className="font-medium">{req.owner_name}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-3.5 w-3.5" />
                                      <span className="text-xs">{req.owner_email}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                  <Badge
                                    variant={
                                      req.status === "pending"
                                        ? "secondary"
                                        : req.status === "approved"
                                          ? "default"
                                          : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {req.status === "pending" && "⏳ در انتظار تایید"}
                                    {req.status === "approved" && "✅ تایید شده"}
                                    {req.status === "rejected" && "❌ رد شده"}
                                  </Badge>

                                  {req.status === "approved" && (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                      <Truck className="h-3 w-3" />
                                      {req.shipping_status === "not_shipped" && "در انتظار ارسال"}
                                      {req.shipping_status === "shipped" && "ارسال شده"}
                                      {req.shipping_status === "delivered" && "دریافت شده"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Message */}
                              {req.message && (
                                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-muted-foreground mb-1">پیام شما:</p>
                                  <p className="text-sm">{req.message}</p>
                                </div>
                              )}

                              {/* Delivery Info */}
                              {req.delivery_method && (
                                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 mb-3 border border-purple-200 dark:border-purple-800">
                                  <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
                                    🚚 روش تحویل:
                                  </p>
                                  <div className="space-y-1.5">
                                    {req.delivery_method === "post" ? (
                                      <>
                                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                          <Truck className="h-3.5 w-3.5" />
                                          <span>ارسال پستی</span>
                                        </div>
                                        {req.postal_company && (
                                          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                            <Building2 className="h-3.5 w-3.5" />
                                            <span>{req.postal_company}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                        <HandHeart className="h-3.5 w-3.5" />
                                        <span>تحویل حضوری</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tracking Info */}
                              {req.tracking_info && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
                                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    کد رهگیری مرسوله:
                                  </p>
                                  <p className="text-sm font-mono text-blue-700 dark:text-blue-300">
                                    {req.tracking_info}
                                  </p>
                                </div>
                              )}

                              {/* Recipient Address */}
                              {req.recipient_address && (
                                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 mb-3 border border-amber-200 dark:border-amber-800">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">آدرس تحویل:</p>
                                      <p className="text-sm text-amber-700 dark:text-amber-300">{req.recipient_address}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Timeline */}
                              {req.status !== "pending" && (
                                <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                  <p className="text-xs font-medium mb-2">پیگیری سفارش:</p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                      <span>ثبت درخواست: {formatDate(req.created_at)}</span>
                                    </div>
                                    {req.approved_at && (
                                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>تایید شده: {formatDate(req.approved_at)}</span>
                                      </div>
                                    )}
                                    {req.shipped_at && (
                                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span>ارسال شده: {formatDate(req.shipped_at)}</span>
                                      </div>
                                    )}
                                    {req.delivered_at && (
                                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                                        <Gift className="h-3.5 w-3.5" />
                                        <span>دریافت شده: {formatDate(req.delivered_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {/* 🔧 FIX: شرط اصلاح شده */}
                                {req.status === "approved" && req.shipping_status === "shipped" && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSentRequest(req)
                                      setConfirmDeliveryOpen(true)
                                    }}
                                    className="gap-1.5"
                                  >
                                    <Gift className="h-3.5 w-3.5" />
                                    تایید دریافت کالا
                                  </Button>
                                )}

                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/ads/${req.item_id}`} className="gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    مشاهده آگهی
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog: ثبت ارسال - با فیلدهای کامل */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>ثبت اطلاعات ارسال</DialogTitle>
            <DialogDescription>روش تحویل کالا را انتخاب کنید</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* انتخاب روش تحویل */}
            <div className="space-y-3">
              <Label>روش تحویل</Label>
              <RadioGroup value={deliveryMethod} onValueChange={(val) => setDeliveryMethod(val as DeliveryMethod)}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="post" id="post" />
                  <Label htmlFor="post" className="font-normal cursor-pointer">
                    ارسال پستی
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="in_person" id="in_person" />
                  <Label htmlFor="in_person" className="font-normal cursor-pointer">
                    تحویل حضوری
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* فیلدهای ارسال پستی */}
            {/* فیلدهای ارسال پستی */}
{deliveryMethod === "post" && (
  <>
    <div className="space-y-2">
      <Label htmlFor="postal-company">شرکت پستی</Label>
      <Select value={postalCompany} onValueChange={setPostalCompany}>
        <SelectTrigger id="postal-company" className="w-full">
          <SelectValue placeholder="انتخاب شرکت پستی..." />
        </SelectTrigger>
        <SelectContent>
          {POSTAL_COMPANIES.map((company) => (
            <SelectItem key={company.value} value={company.value}>
              {company.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        شرکت پستی که از طریق آن کالا را ارسال می‌کنید
      </p>
    </div>

    {/* اگر "سایر" انتخاب شد، فیلد متنی نشان بده */}
    {postalCompany === "other" && (
      <div className="space-y-2">
        <Label htmlFor="other-company">نام شرکت پستی</Label>
        <Input
          id="other-company"
          placeholder="نام شرکت پستی را وارد کنید"
          value={postalCompany}
          onChange={(e) => setPostalCompany(e.target.value)}
        />
      </div>
    )}

    <div className="space-y-2">
      <Label htmlFor="tracking">کد رهگیری (اختیاری)</Label>
      <Input
        id="tracking"
        placeholder="مثال: 1234567890"
        value={trackingInfo}
        onChange={(e) => setTrackingInfo(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        کد رهگیری مرسوله برای پیگیری توسط گیرنده
      </p>
    </div>
  </>
)}

            {/* فیلد تحویل حضوری */}
            {deliveryMethod === "in_person" && (
              <div className="space-y-2">
                <Label htmlFor="address">آدرس تحویل (اختیاری)</Label>
                <Textarea
                  id="address"
                  placeholder="آدرس محل تحویل حضوری را وارد کنید"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                💡 این اطلاعات به دریافت‌کننده نمایش داده می‌شود
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setTrackingDialogOpen(false)
                setDeliveryMethod("post")
                setPostalCompany("")
                setTrackingInfo("")
                setRecipientAddress("")
              }}
            >
              انصراف
            </Button>
            <Button onClick={handleShip} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 ml-2" />
                  ثبت ارسال
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: تایید دریافت */}
      <Dialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تایید دریافت کالا</DialogTitle>
            <DialogDescription>آیا کالا را دریافت کرده‌اید؟</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="font-medium mb-1">توجه:</p>
                  <p>
                    با تایید دریافت، وضعیت این کالا به "اهدا شده" تغییر می‌کند و این عملیات قابل برگشت نیست.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeliveryOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleConfirmDelivery} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 ml-2" />
                  تایید دریافت
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}