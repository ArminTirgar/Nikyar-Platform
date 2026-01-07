"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  color: string
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
  { id: "sports", name: "ورزشی", icon: <Bike className="h-8 w-8" />, count: 15, color: "bg-teal-500/10 text-teal-600" },
  {
    id: "other",
    name: "سایر",
    icon: <MoreHorizontal className="h-8 w-8" />,
    count: 38,
    color: "bg-gray-500/10 text-gray-600",
  },
]

export function SearchContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Card key={category.id} className="group hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.count} آگهی</p>
                  </div>
                </div>
                <div className="h-24 rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">آخرین آگهی</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
