import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heart,
  UserPlus,
  PackagePlus,
  Search,
  Handshake,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Eye,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: "۱",
    icon: UserPlus,
    title: "ثبت‌نام در پلتفرم",
    description:
      "با ایجاد یک حساب کاربری رایگان، به جامعه نیک‌یار بپیوندید. فرآیند ثبت‌نام سریع و ساده است.",
    color: "bg-blue-500/10 text-blue-600",
    borderColor: "border-blue-500/20",
  },
  {
    number: "۲",
    icon: PackagePlus,
    title: "ثبت آگهی کالا",
    description:
      "کالایی که قصد اهدا دارید را با عکس و توضیحات کامل ثبت کنید. دسته‌بندی و وضعیت کالا را مشخص نمایید.",
    color: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    number: "۳",
    icon: Search,
    title: "جستجو و انتخاب",
    description:
      "نیازمندان می‌توانند در میان آگهی‌ها جستجو کنند و کالای مورد نیاز خود را پیدا کنند.",
    color: "bg-amber-500/10 text-amber-600",
    borderColor: "border-amber-500/20",
  },
  {
    number: "۴",
    icon: MessageCircle,
    title: "ارسال درخواست",
    description:
      "نیازمند با ارسال درخواست و پیام به اهداکننده، علاقه خود به دریافت کالا را اعلام می‌کند.",
    color: "bg-violet-500/10 text-violet-600",
    borderColor: "border-violet-500/20",
  },
  {
    number: "۵",
    icon: Handshake,
    title: "هماهنگی و تحویل",
    description:
      "اهداکننده و نیازمند با یکدیگر هماهنگ شده و کالا مستقیماً تحویل داده می‌شود.",
    color: "bg-emerald-500/10 text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  {
    number: "۶",
    icon: CheckCircle2,
    title: "تایید اهدا",
    description:
      "پس از تحویل موفق، وضعیت آگهی به «اهدا شده» تغییر می‌کند و کار نیک شما ثبت می‌شود.",
    color: "bg-teal-500/10 text-teal-600",
    borderColor: "border-teal-500/20",
  },
]

const features = [
  {
    icon: ShieldCheck,
    title: "امنیت و اعتماد",
    description: "تمامی کاربران احراز هویت شده و فرآیند اهدا به صورت شفاف انجام می‌شود.",
  },
  {
    icon: Clock,
    title: "سریع و ساده",
    description: "ثبت آگهی و درخواست کالا در کمتر از ۲ دقیقه انجام می‌شود.",
  },
  {
    icon: Eye,
    title: "شفافیت کامل",
    description: "تمامی مراحل از ثبت تا تحویل قابل پیگیری و مشاهده هستند.",
  },
  {
    icon: Heart,
    title: "بدون واسطه",
    description: "کالا مستقیماً از اهداکننده به نیازمند می‌رسد، بدون هیچ واسطه‌ای.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              خانه
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span>نحوه کار</span>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
              <Handshake className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 text-balance">
              نحوه کار{" "}
              <span className="bg-gradient-to-l from-primary to-warm bg-clip-text text-transparent">
                نیک‌یار
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              در چند قدم ساده، کالاهای خود را مستقیماً به دست نیازمندان برسانید
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 md:gap-8">
                  {/* Step Number Circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${step.borderColor} ${step.color} text-lg font-black`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <Card className="flex-1 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.color}`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            چرا نیک‌یار؟
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-border/60 text-center hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Card className="max-w-2xl mx-auto border border-primary/20 bg-gradient-to-br from-primary/5 to-warm/5">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              آماده‌اید کار نیک خود را شروع کنید؟
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              همین حالا اولین آگهی خود را ثبت کنید و لبخند را به چهره نیازمندان بیاورید.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                <Link href="/ads/new">
                  <PackagePlus className="h-5 w-5" />
                  ثبت آگهی جدید
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="/ads">
                  مشاهده آگهی‌ها
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="text-lg font-bold">پلتفرم نیک‌یار</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            {"© ۱۴۰۳ پلتفرم نیک\u200Cیار. تمامی حقوق محفوظ است."}
          </p>
        </div>
      </footer>
    </div>
  )
}
