"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import useSWR from "swr"

interface Ad {
  id: string
  title: string
  category: string
  status: "active" | "pending" | "donated" | "expired"
  createdAt: string
  views: number
  imageUrl?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const STATUS_MAP = {
  active: { label: "فعال", variant: "default" as const, icon: CheckCircle2 },
  pending: { label: "در انتظار", variant: "secondary" as const, icon: Clock },
  donated: { label: "اهدا شده", variant: "outline" as const, icon: Gift },
  expired: { label: "منقضی", variant: "destructive" as const, icon: XCircle },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  const { data: userAds, error } = useSWR<Ad[]>(user ? `http://localhost:3001/api/ads/user/${user.id}` : null, fetcher)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    )
  }

  if (!user) return null

  // Mock stats
  const stats = {
    totalAds: userAds?.length || 0,
    activeAds: userAds?.filter((ad) => ad.status === "active").length || 0,
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
                      const StatusIcon = statusInfo.icon
                      return (
                        <div
                          key={ad.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{ad.title}</h4>
                            <p className="text-sm text-muted-foreground">{ad.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={statusInfo.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {ad.views} بازدید
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
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
                <CardTitle>درخواست‌های دریافتی</CardTitle>
                <CardDescription>درخواست‌هایی که برای آگهی‌های شما ارسال شده</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">درخواستی وجود ندارد</h3>
                  <p className="text-muted-foreground">هنوز کسی برای آگهی‌های شما درخواستی ارسال نکرده است</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
