import { Suspense } from "react"
import { AdsContent } from "@/components/ads-content"
import { Header } from "@/components/header"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function AdsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <Suspense fallback={<AdsLoadingSkeleton />}>
        <AdsContent />
      </Suspense>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="text-lg font-bold">پلتفرم نیک‌یار</span>
          </Link>
          <p className="text-sm text-muted-foreground">© ۱۴۰۳ پلتفرم نیک‌یار. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}

function AdsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card animate-pulse">
            <div className="aspect-[4/3] bg-muted rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
