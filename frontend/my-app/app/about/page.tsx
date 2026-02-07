import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heart,
  ChevronLeft,
  Target,
  Users,
  Globe,
  Award,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Sparkles,
  HandHeart,
  TrendingUp,
  Shield,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "کاربر فعال", value: "۵,۲۰۰+", icon: Users },
  { label: "کالای اهدا شده", value: "۱۲,۸۰۰+", icon: HandHeart },
  { label: "شهر تحت پوشش", value: "۳۱", icon: Globe },
  { label: "رضایت کاربران", value: "۹۸٪", icon: Award },
]

const values = [
  {
    icon: Heart,
    title: "نیکوکاری مستقیم",
    description:
      "ما معتقدیم کمک مستقیم موثرترین شکل نیکوکاری است. بدون واسطه، بدون هزینه اضافی.",
  },
  {
    icon: Shield,
    title: "شفافیت و اعتماد",
    description:
      "تمامی فرآیندها شفاف هستند. هر اهدا ثبت و قابل پیگیری است تا اعتماد حفظ شود.",
  },
  {
    icon: Sparkles,
    title: "سادگی و دسترسی",
    description:
      "پلتفرم ما طوری طراحی شده که هر کسی بتواند به راحتی از آن استفاده کند.",
  },
  {
    icon: TrendingUp,
    title: "تاثیر پایدار",
    description:
      "هدف ما ایجاد یک فرهنگ پایدار بخشش و نیکوکاری در جامعه ایرانی است.",
  },
]

const team = [
  {
    name: "آرمین تیرگر",
    role: "بنیان‌گذار و مدیرعامل",
    initials: "آ.ت",

  },
  {
    name: "عسل دهقان",
    role: "مدیر فنی",
    initials: "ع. د",
  },
  {
    name: "منیر جعفری پناه",
    role: "مدیر توسعه",
    initials: " م. ج",
  },
]

export default function AboutPage() {
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
            <span>درباره ما</span>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
              <Heart className="h-8 w-8 fill-current" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 text-balance">
              درباره{" "}
              <span className="bg-gradient-to-l from-primary to-warm bg-clip-text text-transparent">
                نیک‌یار
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              پلتفرمی برای اتصال قلب‌ها، جایی که بخشش مستقیم اتفاق می‌افتد
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-2 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-border/60 text-center">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-3">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">داستان ما</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              نیک‌یار با یک ایده ساده شروع شد: چرا کالاهایی که دیگر نیازی به آن‌ها نداریم، نباید مستقیماً
              به دست کسانی برسد که به آن‌ها نیاز دارند؟
            </p>
            <p>
              ما در سال ۱۴۰۲ این پلتفرم را با هدف حذف واسطه‌ها از فرآیند نیکوکاری راه‌اندازی
              کردیم. در نیک‌یار، هر کسی می‌تواند کالاهای قابل استفاده خود را مستقیماً به نیازمندان واقعی اهدا کند.
            </p>
            <p>
              امروز، نیک‌یار به یک جامعه بزرگ از افراد نیکوکار تبدیل شده که هر روز با اهدای
              کالاهای خود، لبخند را به چهره هزاران نفر می‌آورند.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}

      {/* Team */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          تیم ما
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <Card key={index} className="border border-border/60 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-warm/20 text-primary mx-auto mb-4">
                  <span className="text-lg font-bold">{member.initials}</span>
                </div>
                <h3 className="font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">تماس با ما</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              سوال یا پیشنهادی دارید؟ خوشحال می‌شویم از شما بشنویم.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="border border-border/60">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">ایمیل</span>
                  <span className="text-sm text-muted-foreground" dir="ltr">
                    info@nikyar.ir
                  </span>
                </CardContent>
              </Card>
              <Card className="border border-border/60">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">تلفن</span>
                  <span className="text-sm text-muted-foreground" dir="ltr">
                    ۰۲۱-۱۲۳۴۵۶۷۸
                  </span>
                </CardContent>
              </Card>
              <Card className="border border-border/60">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">آدرس</span>
                  <span className="text-sm text-muted-foreground">
                    تهران، ایران
                  </span>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="mailto:info@nikyar.ir">
                <Mail className="h-5 w-5" />
                ارسال ایمیل
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Card className="max-w-2xl mx-auto border border-primary/20 bg-gradient-to-br from-primary/5 to-warm/5">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              به جمع نیکوکاران بپیوندید
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              با ثبت‌نام در نیک‌یار، بخشی از یک جنبش بزرگ نیکوکاری شوید.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                <Link href="/register">
                  <Heart className="h-5 w-5" />
                  ثبت‌نام رایگان
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="/how-it-works">
                  نحوه کار
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
