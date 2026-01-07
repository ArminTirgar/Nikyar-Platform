"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Search, MapPin, Clock, ChevronLeft, Filter, Grid3X3, List, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"

interface Ad {
  id: number
  title: string
  description: string
  category: string
  location: string
  image?: string
  createdAt: string
  status: "available" | "reserved" | "donated"
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const {
    data: ads,
    error,
    isLoading,
  } = useSWR<Ad[]>("http://localhost:3001/api/ads", fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })

  const filteredAds =
    ads?.filter(
      (ad) =>
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  const getStatusBadge = (status: Ad["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">موجود</Badge>
      case "reserved":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">رزرو شده</Badge>
      case "donated":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">اهدا شده</Badge>
    }
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/" className="hover:text-primary transition-colors">
                  خانه
                </Link>
                <ChevronLeft className="h-4 w-4" />
                <span>آگهی‌ها</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                همه آگهی‌ها
              </h1>
              <p className="text-muted-foreground mt-2">کالاهایی که برای اهدا ثبت شده‌اند</p>
            </div>

            <Button asChild className="w-fit">
              <Link href="/ads/new">
                <Package className="h-4 w-4 ml-2" />
                ثبت آگهی جدید
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجو در آگهی‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-11 w-11 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-11 w-11 rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-11 w-11 rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ads Grid */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">در حال بارگذاری آگهی‌ها...</p>
          </div>
        ) : error || filteredAds.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">آگهی‌ای یافت نشد</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "نتیجه‌ای برای جستجوی شما پیدا نشد" : "هنوز آگهی‌ای ثبت نشده است"}
            </p>
            <Button asChild>
              <Link href="/ads/new">اولین آگهی را ثبت کنید</Link>
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredAds.map((ad) => (
              <Link key={ad.id} href={`/ads/${ad.id}`}>
                <Card
                  className={`group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-muted ${
                      viewMode === "list" ? "w-48 h-36" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={ad.image || "/placeholder.svg?height=200&width=300&query=donation item"}
                      alt={ad.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">{getStatusBadge(ad.status)}</div>
                  </div>
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {ad.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ad.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{ad.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{ad.createdAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
