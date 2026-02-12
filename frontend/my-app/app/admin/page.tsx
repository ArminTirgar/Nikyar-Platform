"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Heart,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  Shield,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import useSWR, { mutate } from "swr"
import { NotificationBell } from "@/components/admin/notification-bell"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Stats {
  ads: {
    total: number
    pending: number
    approved: number
    rejected: number
    donated: number
  }
  donations: {
    total: number
    pending: number
    verified: number
    rejected: number
  }
  users: {
    total: number
    active: number
  }
}

interface Ad {
  id: number
  title: string
  description: string
  category_name: string
  user_name: string
  user_email: string
  admin_status: "pending" | "approved" | "rejected"
  status: "available" | "reserved" | "donated"
  created_at: string
  image_url?: string
  admin_note?: string
}

interface Donation {
  id: number
  bank_name: string
  card_number: string
  amount: string
  donor_name?: string
  message?: string
  receipt_image: string
  status: "pending" | "verified" | "rejected"
  created_at: string
  user_name?: string
  user_email?: string
  admin_note?: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "delete">("approve")
  const [adminNote, setAdminNote] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const { data: stats } = useSWR<Stats>(
    user ? `http://localhost:3001/api/admin/stats?userId=${user.id}` : null,
    fetcher
  )

  const { data: pendingAds } = useSWR<Ad[]>(
    user ? `http://localhost:3001/api/admin/ads?status=pending&userId=${user.id}` : null,
    fetcher
  )

  const { data: pendingDonations } = useSWR<Donation[]>(
    user ? `http://localhost:3001/api/admin/donations?status=pending&userId=${user.id}` : null,
    fetcher
  )

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (!isLoading && user && user.role !== "admin" && user.role !== "moderator") {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleAdAction = async (ad: Ad, action: "approve" | "reject" | "delete") => {
    setSelectedAd(ad)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const handleDonationAction = async (donation: Donation, action: "approve" | "reject") => {
    setSelectedDonation(donation)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const executeAction = async () => {
    if (!user) return

    setActionLoading(true)

    try {
      let endpoint = ""
      let method = "PUT"
      let body: any = { userId: user.id, adminNote }

      if (selectedAd) {
        if (actionType === "delete") {
          endpoint = `http://localhost:3001/api/admin/ads/${selectedAd.id}?userId=${user.id}`
          method = "DELETE"
        } else {
          endpoint = `http://localhost:3001/api/admin/ads/${selectedAd.id}/${actionType}`
        }
      } else if (selectedDonation) {
        endpoint = `http://localhost:3001/api/admin/donations/${selectedDonation.id}/verify`
        body.status = actionType === "approve" ? "verified" : "rejected"
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(body) : undefined,
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ ${data.message}`)
        mutate(`http://localhost:3001/api/admin/stats?userId=${user.id}`)
        mutate(`http://localhost:3001/api/admin/ads?status=pending&userId=${user.id}`)
        mutate(`http://localhost:3001/api/admin/donations?status=pending&userId=${user.id}`)
        setActionDialogOpen(false)
        setAdminNote("")
        setSelectedAd(null)
        setSelectedDonation(null)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("خطا در انجام عملیات")
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">پنل مدیریت</h1>
              <p className="text-xs text-muted-foreground">نیک‌یار</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">بازگشت به سایت</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">آگهی‌های در انتظار</p>
                  <p className="text-3xl font-bold text-amber-600">{stats?.ads.pending || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کمک‌های مالی</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.donations.pending || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کل آگهی‌ها</p>
                  <p className="text-3xl font-bold">{stats?.ads.total || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کاربران فعال</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.users.active || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ads" className="gap-2">
              <Package className="h-4 w-4" />
              آگهی‌ها
              {(stats?.ads.pending || 0) > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {stats?.ads.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="donations" className="gap-2">
              <DollarSign className="h-4 w-4" />
              کمک‌های مالی
              {(stats?.donations.pending || 0) > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {stats?.donations.pending}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>آگهی‌های در انتظار تایید</CardTitle>
                <CardDescription>آگهی‌هایی که نیاز به بررسی دارند</CardDescription>
              </CardHeader>
              <CardContent>
                {!pendingAds || pendingAds.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">آگهی جدیدی در انتظار بررسی نیست</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAds.map((ad) => (
                      <Card key={ad.id} className="border-r-4 border-r-amber-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Image */}
                            <div className="h-20 w-20 rounded-lg bg-muted shrink-0 overflow-hidden">
                              {ad.image_url ? (
                                <img
                                  src={`http://localhost:3001${ad.image_url}`}
                                  alt={ad.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-full w-full p-4 text-muted-foreground" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{ad.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {ad.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="outline">{ad.category_name}</Badge>
                                <span className="text-muted-foreground">
                                  توسط: {ad.user_name} ({ad.user_email})
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAdAction(ad, "approve")}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                تایید
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAdAction(ad, "reject")}
                                className="gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                رد
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/ads/${ad.id}`} className="gap-1">
                                  <Eye className="h-4 w-4" />
                                  مشاهده
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>کمک‌های مالی در انتظار تایید</CardTitle>
                <CardDescription>فیش‌های واریزی که نیاز به بررسی دارند</CardDescription>
              </CardHeader>
              <CardContent>
                {!pendingDonations || pendingDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">کمک مالی جدیدی در انتظار بررسی نیست</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDonations.map((donation) => (
                      <Card key={donation.id} className="border-r-4 border-r-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Receipt Image */}
                            <div className="h-24 w-24 rounded-lg border overflow-hidden shrink-0">
                              {donation.receipt_image.endsWith(".pdf") ? (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <FileText className="h-10 w-10 text-muted-foreground" />
                                </div>
                              ) : (
  <a
    href={`http://localhost:3001${donation.receipt_image}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src={`http://localhost:3001${donation.receipt_image}`}
      alt="فیش واریزی"
      className="w-full h-full object-cover hover:opacity-80"
    />
  </a>
)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold">{donation.donor_name || "ناشناس"}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {donation.user_name || "کاربر مهمان"} (
                                    {donation.user_email || "ایمیل ندارد"})
                                  </p>
                                </div>
                                <Badge className="text-lg">{donation.amount} تومان</Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-muted-foreground">بانک:</span>{" "}
                                  {donation.bank_name}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">شماره کارت:</span>{" "}
                                  {donation.card_number}
                                </p>
                                {donation.message && (
                                  <p className="text-muted-foreground italic">"{donation.message}"</p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleDonationAction(donation, "approve")}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                تایید
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDonationAction(donation, "reject")}
                                className="gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                رد
                              </Button>
                              <Button size="sm" variant="outline" asChild>
  <a
    href={`http://localhost:3001${donation.receipt_image}`}
    target="_blank"
    rel="noopener noreferrer"
    className="gap-1"
  >
    <Eye className="h-4 w-4" />
    فیش
  </a>
</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "تایید" : actionType === "reject" ? "رد" : "حذف"}
            </DialogTitle>
            <DialogDescription>
              {selectedAd
                ? `آیا مطمئن هستید که می‌خواهید این آگهی را ${actionType === "approve" ? "تایید" : actionType === "reject" ? "رد" : "حذف"} کنید؟`
                : `آیا مطمئن هستید که می‌خواهید این کمک مالی را ${actionType === "approve" ? "تایید" : "رد"} کنید؟`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-note">یادداشت ادمین (اختیاری)</Label>
              <Textarea
                id="admin-note"
                placeholder="توضیحات یا دلیل تصمیم خود را بنویسید..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={executeAction}
              disabled={actionLoading}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  در حال انجام...
                </>
              ) : (
                <>{actionType === "approve" ? "تایید" : actionType === "reject" ? "رد" : "حذف"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}