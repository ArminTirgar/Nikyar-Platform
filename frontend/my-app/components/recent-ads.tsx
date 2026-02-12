"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"

interface Ad {
  id: number
  title: string
  category: string
  item_condition: "new" | "like-new" | "good" | "fair"
  province: string
  city: string
  created_at: string
  image_url?: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RecentAds() {
  const {
    data: adsData,
    error,
    isLoading,
  } = useSWR<Ad[]>("http://localhost:3001/api/ads", fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 2,
  })

  // 🔧 اصلاح: مطمئن میشیم که ads یک آرایه هست و فقط 3 تای اول رو میگیریم
  const recentAds = Array.isArray(adsData) ? adsData.slice(0, 3) : []

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          آگهی‌های اخیر
        </h2>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">خطا در بارگذاری آگهی‌ها</p>
          </div>
        ) : recentAds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              هیچ آگهی تایید شده‌ای هنوز منتشر نشده است.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {recentAds.map((ad) => (
              <Link href={`/ads/${ad.id}`} key={ad.id}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image 
                      src={ad.image_url ? `http://localhost:3001${ad.image_url}` : "/placeholder.svg"} 
                      alt={ad.title} 
                      fill 
                      unoptimized 
                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {ad.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {ad.province}، {ad.city}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      وضعیت:{" "}
                      {{
                        "new": "نو",
                        "like-new": "در حد نو",
                        "good": "سالم",
                        "fair": "قابل استفاده",
                      }[ad.item_condition]}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}