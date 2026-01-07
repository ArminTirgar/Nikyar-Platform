"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ArrowRight, CreditCard, Building2, Copy, CheckCircle2 } from "lucide-react"
import Link from "next/link"

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

// شماره کارت نمونه برای هر بانک (فقط نمایشی)
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
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopyCard = () => {
    if (selectedBank && CHARITY_CARDS[selectedBank]) {
      navigator.clipboard.writeText(CHARITY_CARDS[selectedBank].replace(/-/g, ""))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
            با انتخاب بانک مورد نظر، شماره کارت خیریه را دریافت و کمک خود را واریز کنید
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              انتخاب بانک و مبلغ
            </CardTitle>
            <CardDescription>بانک مورد نظر خود را انتخاب کنید تا شماره کارت خیریه نمایش داده شود</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bank Selection */}
            <div className="space-y-2">
              <Label htmlFor="bank">بانک مورد نظر</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
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
                  <Button variant="ghost" size="sm" onClick={handleCopyCard} className="gap-1 text-xs">
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
              <Label htmlFor="amount">مبلغ کمک (تومان)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="مبلغ را وارد کنید..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-lg"
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

            {/* Donor Name (Optional) */}
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

            {/* Message (Optional) */}
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
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                پس از واریز مبلغ به شماره کارت بالا، لطفاً تصویر رسید را از طریق پنل کاربری ارسال کنید تا در لیست خیّرین
                ثبت شوید.
              </p>
            </div>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20"
              disabled={!selectedBank}
            >
              <Heart className="h-5 w-5" />
              ثبت کمک مالی
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
