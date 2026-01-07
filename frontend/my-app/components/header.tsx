"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Menu, User, LogOut, LayoutDashboard, X } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"

export function Header() {
  const { user, logout, isLoading } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userName = user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-l from-primary to-warm bg-clip-text text-transparent">
            پلتفرم نیک‌یار
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/ads"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            آگهی‌ها
          </Link>
          <Link
            href="/search"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            دسته‌بندی
          </Link>
          <Link
            href="#how-it-works"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            نحوه کار
          </Link>
          <Link
            href="#about"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            درباره ما
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline-block font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    حساب کاربری
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    پنل کاربری
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">ورود</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">ثبت‌نام</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          <Link
            href="/ads"
            className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            آگهی‌ها
          </Link>
          <Link
            href="/search"
            className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            دسته‌بندی
          </Link>
          <Link
            href="#how-it-works"
            className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            نحوه کار
          </Link>
          {!user && (
            <Link
              href="/login"
              className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              ورود
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
