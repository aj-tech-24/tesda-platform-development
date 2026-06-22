'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen, Users, Award, Shield, Building2, ChevronRight, Menu, X } from 'lucide-react'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Invisible sentinel scroll tracker to toggle navbar backdrop states */}
      <div 
        ref={sentinelRef} 
        className="absolute top-0 left-0 right-0 h-5 pointer-events-none z-0" 
        aria-hidden="true" 
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/90 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50 py-3'
        : 'bg-transparent py-4'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative flex items-center justify-center drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300">
              <Image 
                src="/tesda-logo.png" 
                alt="TESDA Logo" 
                fill 
                className="object-contain" 
                priority 
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none">TESDA PO</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase leading-none mt-0.5">Davao del Sur</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/programs', label: 'Programs', icon: BookOpen },
              { href: '/centers', label: 'Training Centers', icon: Building2 },
              { href: '/trainers', label: 'Trainers', icon: Users },
              { href: '/assessment-centers', label: 'Assessment Centers', icon: Shield },
              { href: '/assessors', label: 'Assessors', icon: Award },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 group flex items-center gap-2"
              >
                <Icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <ThemeToggle />
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all ml-1 active:scale-[0.98] transition-transform cursor-pointer"
              >
                Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer active:scale-[0.95] transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 pb-6 space-y-1 mt-2">
              {[
                { href: '/programs', label: 'Training Programs', icon: BookOpen },
                { href: '/centers', label: 'Training Centers', icon: Building2 },
                { href: '/trainers', label: 'Expert Trainers', icon: Users },
                { href: '/assessment-centers', label: 'Assessment Centers', icon: Shield },
                { href: '/assessors', label: 'Assessors', icon: Award },
                { href: '/admin', label: 'Admin Portal', icon: Shield },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  <span className="font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
