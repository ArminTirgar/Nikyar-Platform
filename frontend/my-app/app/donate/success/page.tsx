"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Home, CheckCircle, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function DonationSuccessPage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // انیمیشن confetti
    const duration = 3000
    const end = Date.now() + duration

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval)
        return
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
      })

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
      })
    }, 50)

    // نمایش محتوا با تاخیر
    setTimeout(() => setShowContent(true), 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-warm/5 flex items-center justify-center p-4" dir="rtl">
      <div className={`w-full max-w-2xl transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        {/* Success Icon Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-20 animate-ping" />
            
            {/* Middle Ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-40 animate-pulse" />
            
            {/* Inner Circle */}
            <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <CheckCircle className="h-16 w-16 text-white animate-bounce" strokeWidth={2.5} />
            </div>

            {/* Sparkles */}
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-400 animate-pulse delay-150" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 via-primary to-warm" />
          
          <CardContent className="p-8 md:p-12 text-center">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-l from-primary to-warm bg-clip-text text-transparent">
              کمک شما با موفقیت ثبت شد! 🎉
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              از اینکه با کمک مالی خود، امید و شادی را به زندگی نیازمندان هدیه می‌دهید، از صمیم قلب سپاسگزاریم.
            </p>

            {/* Status Box */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400 fill-current animate-pulse" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    مراحل بعدی
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>فیش واریزی شما دریافت شد</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>در انتظار بررسی و تایید توسط تیم ما</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>پس از تایید، در لیست خیرین ثبت خواهید شد</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-l from-warm/10 to-primary/10 border-r-4 border-primary rounded-lg p-6 mb-8">
              <p className="text-muted-foreground italic leading-relaxed">
                "هیچ کار خیری کوچک نیست. اعمال محبت‌آمیز که به صورت مکرر انجام می‌شوند، دنیا را تغییر می‌دهند."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 shadow-lg">
                <Link href="/dashboard">
                  <Home className="h-5 w-5" />
                  رفتن به پنل کاربری
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="/">
                  بازگشت به صفحه اصلی
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground mt-8">
              می‌توانید وضعیت کمک خود را از پنل کاربری پیگیری کنید
            </p>
          </CardContent>
        </Card>

        {/* Extra Thank You Message */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            هدیه شما، تغییری بزرگ در زندگی دیگران ایجاد می‌کند
          </p>
          <div className="flex items-center justify-center gap-1 text-warm">
            <Heart className="h-4 w-4 fill-current animate-pulse" />
            <Heart className="h-4 w-4 fill-current animate-pulse delay-75" />
            <Heart className="h-4 w-4 fill-current animate-pulse delay-150" />
          </div>
        </div>
      </div>
    </div>
  )
}