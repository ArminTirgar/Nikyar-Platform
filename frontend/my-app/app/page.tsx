import { Button } from "@/components/ui/button"
import { Heart, Package, Search, DollarSign, User, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { RecentAds } from "@/components/recent-ads"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero Section - Clean & Modern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Hero Image */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-warm/20 blur-2xl" />
              <div className="relative rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                <Image
                  src="/hands-holding-heart-charity-giving-warm-colors.jpg"
                  alt="نیک‌یار - اهدای کالا"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-warm/30 animate-pulse delay-300" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance">
              با <span className="bg-gradient-to-l from-primary to-warm bg-clip-text text-transparent">تو</span>، نیکی
              ادامه دارد
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
              کالاهای خود را مستقیماً به دست نیازمندان واقعی برسانید
            </p>

            {/* Navigation Buttons - 5 Buttons Grid */}
            <nav className="w-full max-w-2xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <Button
                  size="lg"
                  className="h-14 gap-2 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  asChild
                >
                  <Link href="/ads">
                    <Package className="h-5 w-5" />
                    نمایش آگهی‌ها
                  </Link>
                </Button>

                <Button
                  size="lg"
                  className="h-14 gap-2 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  asChild
                >
                  <Link href="/search">
                    <Search className="h-5 w-5" />
                    دسته‌بندی آگهی‌ها
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 gap-2 text-base bg-warm text-warm-foreground hover:bg-warm/90 shadow-lg shadow-warm/20 hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/donate">
                    <DollarSign className="h-5 w-5" />
                    کمک مالی مستقیم
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 text-base hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                    اطلاعات حساب کاربری
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 text-base hover:bg-primary hover:text-primary-foreground transition-all col-span-2 md:col-span-1 bg-transparent"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    پنل کاربری
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <RecentAds />

      {/* Simple Footer */}
      <footer className="border-t bg-muted/30 py-8">
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
