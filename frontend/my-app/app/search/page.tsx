import { Suspense } from "react"
import { SearchContent } from "@/components/search-content"
import { Header } from "@/components/header"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <Suspense fallback={<SearchLoadingSkeleton />}>
        <SearchContent />
      </Suspense>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-8">
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

function SearchLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card animate-pulse p-6">
            <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4" />
            <div className="h-5 bg-muted rounded w-2/3 mx-auto mb-2" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
