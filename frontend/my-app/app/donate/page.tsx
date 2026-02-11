"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Heart, 
  ArrowRight, 
  CreditCard, 
  Building2, 
  Copy, 
  CheckCircle2, 
  Upload,
  Loader2,
  FileText,
  X,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"

const IRANIAN_BANKS = [
  { id: "melli", name: "بانک ملی ایران", cardPrefix: "6037" },
  { id: "mellat", name: "بانک ملت", cardPrefix: "6104" },
  { id: "saderat", name: "بانک صادرات", cardPrefix: "6037" },
  { id: "tejarat", name: "بانک تجارت", cardPrefix: "6273" },
  { id: "sepah", name: "بانک سپه", cardPrefix: "5892" },
  { id: "keshavarzi", name: "بانک کشاورزی", cardPrefix: "6037" },
  { id: "maskan", name: "بانک مسکن", cardPrefix: "6280" },
  { id: "refah", name: "بانک رفاه", cardPrefix: "5894" },
  { id: "parsian", name: "بانک پارسیان", cardPrefix: "6221" },
  { id: "pasargad", name: "بانک پاسارگاد", cardPrefix: "5022" },
  { id: "saman", name: "بانک سامان", cardPrefix: "6219" },
  { id: "ayandeh", name: "بانک آینده", cardPrefix: "6362" },
]

const CHARITY_CARDS: Record<string, string> = {
  melli: "6037-9911-1234-5678",
  mellat: "6104-3371-2345-6789",
  saderat: "6037-6919-3456-7890",
  tejarat: "6273-5311-4567-8901",
  sepah: "5892-1011-5678-9012",
  keshavarzi: "6037-7012-6789-0123",
  maskan: "6280-2314-7890-1234",
  refah: "5894-6311-8901-2345",
  parsian: "6221-0611-9012-3456",
  pasargad: "5022-2911-0123-4567",
  saman: "6219-8611-1234-5678",
  ayandeh: "6362-1411-2345-6789",
}

export default function DonatePage() {
  const router = useRouter()
  const { user } = useUser()
  
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopyCard = () => {
    if (selectedBank && CHARITY_CARDS[selectedBank]) {
      navigator.clipboard.writeText(CHARITY_CARDS[selectedBank].replace(/-/g, ""))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم فایل نباید بیشتر از 5 مگابایت باشد")
        return
      }

      setReceiptFile(file)

      // Preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setReceiptPreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!selectedBank) {
    alert("لطفاً بانک را انتخاب کنید")
    return
  }

  if (!amount) {
    alert("لطفاً مبلغ را وارد کنید")
    return
  }

  if (!receiptFile) {
    alert("لطفاً تصویر فیش واریزی را آپلود کنید")
    return
  }

  setLoading(true)

  try {
    const formData = new FormData()
    formData.append("userId", user?.id?.toString() || "")
    formData.append("bankName", IRANIAN_BANKS.find((b) => b.id === selectedBank)?.name || "")
    formData.append("cardNumber", CHARITY_CARDS[selectedBank])
    formData.append("amount", amount)
    formData.append("donorName", name)
    formData.append("message", message)
    formData.append("receipt", receiptFile)

    const res = await fetch("http://localhost:3001/api/donations", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      // 🎉 به جای alert، به صفحه success برو
      router.push("/donate/success")
    } else {
      alert("❌ " + data.message)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("خطا در ارسال اطلاعات")
  } finally {
    setLoading(false)
  }
}

  const presetAmounts = ["50,000", "100,000", "250,000", "500,000", "1,000,000"]

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold">نیک‌یار</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              بازگشت
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warm/10 text-warm mb-4">
            <CreditCard className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">کمک مالی مستقیم</h1>
          <p className="text-muted-foreground">
            با واریز مبلغ و ارسال فیش، در کمک به نیازمندان سهیم شوید
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                اطلاعات کمک مالی
              </CardTitle>
              <CardDescription>
                لطفاً تمام فیلدها را با دقت تکمیل کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bank Selection */}
              <div className="space-y-2">
                <Label htmlFor="bank">بانک مورد نظر *</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank} required>
                  <SelectTrigger id="bank" className="h-12">
                    <SelectValue placeholder="یک بانک انتخاب کنید..." />
                  </SelectTrigger>
                  <SelectContent>
                    {IRANIAN_BANKS.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Card Number Display */}
              {selectedBank && (
                <div className="p-4 rounded-xl bg-gradient-to-l from-primary/10 to-warm/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">شماره کارت خیریه:</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCard}
                      className="gap-1 text-xs"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          کپی شد
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          کپی
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-2xl font-mono font-bold text-primary tracking-wider text-center py-2">
                    {CHARITY_CARDS[selectedBank]}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {IRANIAN_BANKS.find((b) => b.id === selectedBank)?.name}
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">مبلغ کمک (تومان) *</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="مبلغ را وارد کنید..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg"
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset)}
                      className="text-xs"
                    >
                      {preset} تومان
                    </Button>
                  ))}
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receipt">تصویر فیش واریزی *</Label>
                
                {!receiptFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="receipt"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">آپلود تصویر فیش</p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG یا PDF - حداکثر 5 مگابایت
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start gap-3">
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{receiptFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Donor Name */}
              <div className="space-y-2">
                <Label htmlFor="name">نام اهداکننده (اختیاری)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="نام شما..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">پیام شما (اختیاری)</Label>
                <Textarea
                  id="message"
                  placeholder="پیامی برای نیازمندان بنویسید..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">نکات مهم:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>مبلغ را به شماره کارت بالا واریز کنید</li>
                      <li>تصویر فیش واریزی را آپلود کنید</li>
                      <li>پس از تایید ادمین، در لیست خیرین ثبت می‌شوید</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20"
                disabled={!selectedBank || !amount || !receiptFile || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    ثبت کمک مالی
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}