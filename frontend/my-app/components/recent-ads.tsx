"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"

interface Ad {
  AdID: number
  Title: string
  Price: number
  PhotoPath?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RecentAds() {
  const {
    data: recentAds,
    error,
    isLoading,
  } = useSWR<Ad[]>("http://localhost:3001/api/ads/recent", fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 2,
  })

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">آگهی‌های اخیر</h2>

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
        ) : error || !recentAds || recentAds.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">هیچ آگهی‌ای هنوز منتشر نشده است.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {recentAds.map((ad) => (
              <Link href={`/ads/${ad.AdID}`} key={ad.AdID}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={ad.PhotoPath || "/placeholder.svg?height=200&width=300&query=donation item product"}
                      alt={ad.Title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{ad.Title}</h3>
                    <p className="text-sm text-muted-foreground">قیمت: {ad.Price?.toLocaleString("fa-IR")} تومان</p>
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
