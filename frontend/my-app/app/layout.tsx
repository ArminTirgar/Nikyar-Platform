import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "@/contexts/user-context"
import "./globals.css"

const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn-Regular.woff2",
  variable: "--font-vazirmatn",
})


export const metadata: Metadata = {
  title: "پلتفرم نیک‌یار - اهدای مستقیم کالا به نیازمندان",
  description: "پلتفرم اهدای مستقیم کالا به نیازمندان. با ثبت کالاهای خود، مستقیماً به کمک نیازمندان بیایید.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
  <body className={`${vazirmatn.className} font-sans antialiased`}>
    <UserProvider>{children}</UserProvider>
    <Analytics />
  </body>
</html>

  )
}
