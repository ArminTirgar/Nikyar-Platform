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
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import useSWR, { mutate } from "swr"

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

interface ReceivedRequest {
  id: number
  status: RequestStatus
  shipping_status: ShippingStatus
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  const [selectedRequest, setSelectedRequest] = useState<ReceivedRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState("")
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // تایید درخواست
  const handleApprove = async (requestId: number) => {
    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/requests/${requestId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await res.json()

      if (res.ok) {
        alert("✅ درخواست تایید شد")
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        mutate(`http://localhost:3001/api/ads/my?userId=${user?.id}`)
        setSelectedRequest(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      alert("خطا در تایید درخواست")
    } finally {
      setActionLoading(false)
    }
  }

  // رد درخواست
  const handleReject = async (requestId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این درخواست را رد کنید؟")) return

    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/requests/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (res.ok) {
        alert("درخواست رد شد")
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        setSelectedRequest(null)
      }
    } catch (error) {
      alert("خطا در رد درخواست")
    } finally {
      setActionLoading(false)
    }
  }

  // ثبت ارسال کالا
  const handleShip = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          trackingInfo: trackingInfo || null,
        }),
      })

      if (res.ok) {
        alert("✅ وضعیت ارسال ثبت شد")
        mutate(`http://localhost:3001/api/requests/received/${user?.id}`)
        setTrackingDialogOpen(false)
        setTrackingInfo("")
        setSelectedRequest(null)
      }
    } catch (error) {
      alert("خطا در ثبت ارسال")
    } finally {
      setActionLoading(false)
    }
  }

  // تایید دریافت کالا (توسط دریافت‌کننده)
  const handleConfirmDelivery = async () => {
    if (!selectedSentRequest) return

    setActionLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/requests/${selectedSentRequest.id}/delivered`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (res.ok) {
        alert("✅ دریافت کالا تایید شد")
        mutate(`http://localhost:3001/api/requests/sent/${user?.id}`)
        setConfirmDeliveryOpen(false)
        setSelectedSentRequest(null)
      }
    } catch (error) {
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
                {receivedRequests && receivedRequests.filter((r) => r.status === "pending").length > 0 && (
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
                {error || !userAds || userAds.length === 0 ? (
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
                      return (
                        <div
                          key={ad.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {ad.image_url ? (
                              <img
                                src={`http://localhost:3001${ad.image_url}`}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{ad.title}</h4>
                            <p className="text-sm text-muted-foreground">{ad.category}</p>
                            <div className="flex items-center gap-2 mt-1">
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
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/ads/${ad.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
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
                      {receivedRequests && receivedRequests.filter((r) => r.status === "pending").length > 0 && (
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
                    ) : !receivedRequests || receivedRequests.length === 0 ? (
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
                          <Card key={req.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate mb-1">{req.item_title}</h4>
                                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-3 w-3" />
                                      <span>{req.requester_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <span className="text-xs">{req.requester_email}</span>
                                    </div>
                                    {req.requester_phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span className="text-xs">{req.requester_phone}</span>
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
                                  >
                                    {req.status === "pending" && "در انتظار"}
                                    {req.status === "approved" && "تایید شده"}
                                    {req.status === "rejected" && "رد شده"}
                                  </Badge>

                                  {req.status === "approved" && (
                                    <Badge variant="outline" className="gap-1">
                                      <Truck className="h-3 w-3" />
                                      {req.shipping_status === "not_shipped" && "ارسال نشده"}
                                      {req.shipping_status === "shipped" && "ارسال شده"}
                                      {req.shipping_status === "delivered" && "تحویل داده شده"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {req.message && (
                                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <p className="text-sm">{req.message}</p>
                                  </div>
                                </div>
                              )}

                              {req.tracking_info && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
                                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">اطلاعات ارسال:</p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">{req.tracking_info}</p>
                                </div>
                              )}

                              {/* Timeline */}
                              {req.status !== "pending" && (
                                <div className="border-t pt-3 mb-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>ایجاد: {formatDate(req.created_at)}</span>
                                  </div>
                                  {req.approved_at && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>تایید: {formatDate(req.approved_at)}</span>
                                    </div>
                                  )}
                                  {req.shipped_at && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      <Truck className="h-3 w-3" />
                                      <span>ارسال: {formatDate(req.shipped_at)}</span>
                                    </div>
                                  )}
                                  {req.delivered_at && (
                                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mt-1">
                                      <Gift className="h-3 w-3" />
                                      <span>تحویل: {formatDate(req.delivered_at)}</span>
                                    </div>
                                  )}
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
                                      className="gap-1"
                                    >
                                      {actionLoading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                      تایید
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(req.id)}
                                      disabled={actionLoading}
                                      className="gap-1"
                                    >
                                      <XIcon className="h-3 w-3" />
                                      رد
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
                                    className="gap-1"
                                  >
                                    <Truck className="h-3 w-3" />
                                    ثبت ارسال
                                  </Button>
                                )}

                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/ads/${req.item_id}`} className="gap-1">
                                    <Eye className="h-3 w-3" />
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
                    ) : !sentRequests || sentRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <HandHeart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">درخواستی ارسال نکرده‌اید</h3>
                        <p className="text-muted-foreground">برای دریافت کالا، درخواست خود را ارسال کنید</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentRequests.map((req) => (
                          <Card key={req.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate mb-1">{req.item_title}</h4>
                                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-3 w-3" />
                                      <span>اهداکننده: {req.owner_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
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
                                  >
                                    {req.status === "pending" && "در انتظار تایید"}
                                    {req.status === "approved" && "تایید شده"}
                                    {req.status === "rejected" && "رد شده"}
                                  </Badge>

                                  {req.status === "approved" && (
                                    <Badge variant="outline" className="gap-1">
                                      <Truck className="h-3 w-3" />
                                      {req.shipping_status === "not_shipped" && "در انتظار ارسال"}
                                      {req.shipping_status === "shipped" && "ارسال شده"}
                                      {req.shipping_status === "delivered" && "تحویل گرفته شده"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {req.message && (
                                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-muted-foreground mb-1">پیام شما:</p>
                                  <p className="text-sm">{req.message}</p>
                                </div>
                              )}

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

                              {/* Timeline */}
                              {req.status !== "pending" && (
                                <div className="border-t pt-3 mb-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>درخواست: {formatDate(req.created_at)}</span>
                                  </div>
                                  {req.approved_at && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>تایید: {formatDate(req.approved_at)}</span>
                                    </div>
                                  )}
                                  {req.shipped_at && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      <Truck className="h-3 w-3" />
                                      <span>ارسال: {formatDate(req.shipped_at)}</span>
                                    </div>
                                  )}
                                  {req.delivered_at && (
                                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mt-1">
                                      <Gift className="h-3 w-3" />
                                      <span>دریافت: {formatDate(req.delivered_at)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {req.status === "approved" &&
                                  req.shipping_status === "shipped" &&
                                  req.shipping_status !== "delivered" && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSentRequest(req)
                                        setConfirmDeliveryOpen(true)
                                      }}
                                      className="gap-1"
                                    >
                                      <Gift className="h-3 w-3" />
                                      تایید دریافت کالا
                                    </Button>
                                  )}

                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/ads/${req.item_id}`} className="gap-1">
                                    <Eye className="h-3 w-3" />
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

      {/* Dialog: ثبت ارسال */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ثبت اطلاعات ارسال</DialogTitle>
            <DialogDescription>کد رهگیری مرسوله را وارد کنید (اختیاری)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">کد رهگیری</Label>
              <Input
                id="tracking"
                placeholder="مثال: 1234567890"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                این اطلاعات به دریافت‌کننده نمایش داده می‌شود
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
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