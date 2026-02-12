"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  ChevronLeft,
  Shirt,
  Sofa,
  Smartphone,
  BookOpen,
  Baby,
  Utensils,
  Bike,
  MoreHorizontal,
  Package,
  ArrowLeft,
  MapPin,
  Clock,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"

interface Ad {
  id: number
  title: string
  description?: string
  category: string
  province: string
  city: string
  image_url?: string | null
  created_at: string
  item_condition: string
  status?: "available" | "reserved" | "donated"
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  color: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const API_BASE = "http://localhost:3001"

const normalizeImageUrl = (url?: string | null) => {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `${API_BASE}${url}`
  return `${API_BASE}/${url}`
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

const categories: Category[] = [
  {
    id: "clothing",
    name: "پوشاک",
    icon: <Shirt className="h-8 w-8" />,
    count: 45,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    id: "furniture",
    name: "لوازم منزل",
    icon: <Sofa className="h-8 w-8" />,
    count: 32,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "electronics",
    name: "لوازم الکترونیکی",
    icon: <Smartphone className="h-8 w-8" />,
    count: 18,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "books",
    name: "کتاب و لوازم‌التحریر",
    icon: <BookOpen className="h-8 w-8" />,
    count: 67,
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "kids",
    name: "لوازم کودک",
    icon: <Baby className="h-8 w-8" />,
    count: 29,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "kitchen",
    name: "لوازم آشپزخانه",
    icon: <Utensils className="h-8 w-8" />,
    count: 21,
    color: "bg-orange-500/10 text-orange-600",
  },
  { 
    id: "sports", 
    name: "ورزشی", 
    icon: <Bike className="h-8 w-8" />, 
    count: 15, 
    color: "bg-teal-500/10 text-teal-600" 
  },
  {
    id: "other",
    name: "سایر",
    icon: <MoreHorizontal className="h-8 w-8" />,
    count: 38,
    color: "bg-gray-500/10 text-gray-600",
  },
]

const categoryNames: Record<string, string> = {
  clothing: "پوشاک",
  furniture: "لوازم منزل",
  electronics: "لوازم الکترونیکی",
  books: "کتاب و لوازم‌التحریر",
  kids: "لوازم کودک",
  kitchen: "لوازم آشپزخانه",
  sports: "ورزشی",
  other: "سایر",
}

export function SearchContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const {
    data: ads,
    isLoading: adsLoading,
  } = useSWR<Ad[]>("http://localhost:3001/api/ads", fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })
  const adsArray = Array.isArray(ads) ? ads : []

  console.log("📦 Ads data:", ads) // برای debug

  // Group ads by category and get the latest one per category
  const latestByCategory = categories.reduce<Record<string, Ad>>((acc, cat) => {
  const categoryAds = adsArray.filter((ad) => ad.category === cat.id)
  if (categoryAds.length > 0) {
    acc[cat.id] = categoryAds[0]
  }
  return acc
}, {})

  const filteredCategories = categories.filter((cat) => cat.name.includes(searchQuery))

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors">
              خانه
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span>دسته‌بندی</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-6 w-6" />
            </div>
            دسته‌بندی آگهی‌ها
          </h1>
          <p className="text-muted-foreground mt-2">کالاها را بر اساس دسته‌بندی مشاهده کنید</p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 py-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="جستجو در دسته‌بندی‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-14 text-lg rounded-xl"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/ads?category=${category.id}`}>
              <Card
                className={`group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  selectedCategory === category.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${category.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.count} آگهی</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-primary flex items-center gap-1">
                      مشاهده
                      <ArrowLeft className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">دسته‌بندی یافت نشد</h3>
            <p className="text-muted-foreground">نتیجه‌ای برای "{searchQuery}" پیدا نشد</p>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-l from-primary/5 to-warm/5 border-none">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">۲۶۵</div>
                <div className="text-sm text-muted-foreground">کل آگهی‌ها</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-warm mb-1">۱۸۷</div>
                <div className="text-sm text-muted-foreground">اهدا شده</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">۸</div>
                <div className="text-sm text-muted-foreground">دسته‌بندی</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-warm mb-1">۵۴۳</div>
                <div className="text-sm text-muted-foreground">کاربر فعال</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recently Added Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            جدیدترین در هر دسته
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/ads" className="flex items-center gap-1">
              مشاهده همه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {adsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : Object.keys(latestByCategory).length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">هنوز آگهی‌ای ثبت نشده</h3>
              <p className="text-sm text-muted-foreground mb-4">
                اولین نفری باشید که آگهی ثبت می‌کند
              </p>
              <Button asChild>
                <Link href="/ads/new">ثبت آگهی</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const ad = latestByCategory[category.id]
              if (!ad) return null

              const imageUrl = normalizeImageUrl(ad.image_url)
              const location = `${ad.city}، ${ad.province}`
              const createdAt = formatDate(ad.created_at)

              console.log(`🖼️ Image URL for ${ad.title}:`, imageUrl) // برای debug

              return (
                <Link key={category.id} href={`/ads/${ad.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${category.color}`}>
                          {category.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm">{category.name}</h4>
                          <p className="text-xs text-muted-foreground">{category.count} آگهی</p>
                        </div>
                      </div>
                      <div className="relative h-32 rounded-lg overflow-hidden bg-muted mb-3">
                        <Image 
                          src={imageUrl}
                          alt={ad.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error(`❌ Failed to load image: ${imageUrl}`)
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <Badge className="absolute top-2 right-2 bg-background/80 text-foreground text-[10px] backdrop-blur-sm">
                          {categoryNames[ad.category] || ad.category}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
                        {ad.title}
                      </h4>
                      {ad.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {ad.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {createdAt}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}