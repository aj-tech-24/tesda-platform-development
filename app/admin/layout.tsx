'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Shield, Activity, Building2, Users, Search, Settings, FileSpreadsheet, LogOut, BookOpen } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Skip auth check and layout for login and signup pages
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/sign-up'

  useEffect(() => {
    if (!isAuthPage) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname, isAuthPage])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.is_admin !== true) {
        router.push('/admin/login')
        return
      }
      setUser(user)
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Authenticating Admin...</p>
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  const navItems = [
    { label: 'Dashboard', icon: Activity, path: '/admin/dashboard' },
    { label: 'Institutions', icon: Building2, path: '/admin/centers' },
    { label: 'Programs', icon: BookOpen, path: '/admin/programs' },
    { label: 'Trainers', icon: Users, path: '/admin/trainers' },
    { label: 'Registry', icon: Search, path: '/admin/registry' },
  ]

  return (
    <div className="h-screen w-full bg-[#f1f5f9] dark:bg-background flex flex-col font-sans selection:bg-primary/20 overflow-hidden">
      {/* Global Admin Header */}
      <header className="h-14 border-b border-border/40 shrink-0 bg-white dark:bg-card px-4 sm:px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase hidden sm:block">TESDA PO Davao Del Sur</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.path)
              return (
                <Link key={item.path} href={item.path}>
                  <Button variant={active ? 'secondary' : 'ghost'} size="sm" className={`h-8 gap-1.5 rounded-lg text-xs font-semibold ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/admin/import">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-sm font-medium">
                  <FileSpreadsheet className="w-4 h-4" /> Import Data
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full hidden lg:block border border-border/50">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 rounded-full hover:bg-red-50 hover:text-red-600 text-xs font-semibold dark:hover:bg-red-950/30">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        {children}
      </main>
    </div>
  )
}
