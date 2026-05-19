'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, BookOpen, Users, Award, Search, GraduationCap, Building2, ChevronRight, Menu, X, Sparkles, Shield, Target, MapPin, Star, CheckCircle2, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-bold gradient-text">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-background/90 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300">
              <Image src="/tesda-logo.png" alt="TESDA Logo" fill className="object-contain" priority loading="eager" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none">TESDA</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase leading-none mt-0.5">Skills Development</span>
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
                <Icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                {label}
              </Link>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all ml-1">
                Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 pb-6 space-y-1">
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
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-pattern overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />

        {/* Floating shapes */}
        <div className="absolute top-32 left-[15%] w-16 h-16 border-2 border-primary/10 rounded-2xl animate-float opacity-40 rotate-12" />
        <div className="absolute bottom-40 right-[20%] w-12 h-12 bg-accent/10 rounded-full animate-float-delayed opacity-50" />
        <div className="absolute top-1/3 right-[10%] w-8 h-8 border-2 border-accent/15 rounded-lg animate-float opacity-30 -rotate-12" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 text-sm text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              Empowering Filipino Workers
            </div>

            {/* Main heading */}
            <div className="space-y-5 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-pretty leading-[0.9]">
                Build Your Future
                <br />
                <span className="gradient-text">With Skills</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Discover accredited technical training programs from certified TESDA centers.
                Develop in-demand skills and earn recognized qualifications for a brighter career.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up stagger-2 flex flex-col sm:flex-row gap-4 justify-center pt-2" style={{ opacity: 0 }}>
              <Link href="/programs">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 text-white rounded-full px-8 h-12 text-base">
                  Explore Programs <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/centers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base border-border/80 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <Building2 className="w-4 h-4 mr-2" />
                  Find Training Centers
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in-up stagger-3 pt-10 space-y-4" style={{ opacity: 0 }}>
              <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
                {[
                  { icon: CheckCircle2, label: '500+ Programs', color: 'text-emerald-500' },
                  { icon: Building2, label: '150+ Training Centers', color: 'text-blue-500' },
                  { icon: Users, label: '10K+ Trainers', color: 'text-violet-500' },
                  { icon: Star, label: 'TESDA Accredited', color: 'text-amber-500' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
      </section>

      {/* Search Bar Section */}
      <section className="relative z-10 -mt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl shadow-xl shadow-primary/5 p-2 animate-scale-in" style={{ opacity: 0, animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 bg-background/60 rounded-xl px-5 py-4">
            <Search className="w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search programs, centers, or skills..."
              className="bg-transparent flex-1 outline-none text-foreground placeholder-muted-foreground text-base"
            />
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 px-5 hidden sm:inline-flex">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-primary tracking-wider uppercase">Why Choose TESDA</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need to <span className="gradient-text">Succeed</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            TESDA provides comprehensive support for your skills development journey, from training to certification.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: BookOpen,
              title: 'Comprehensive Programs',
              description: 'Access a wide range of technical training programs covering various industries and skill levels from beginner to advanced certifications.',
              color: 'from-blue-500/10 to-blue-600/5',
              iconColor: 'text-blue-600',
              borderColor: 'hover:border-blue-300',
              link: '/programs',
              linkLabel: 'Browse Programs',
            },
            {
              icon: Users,
              title: 'Expert Trainers',
              description: 'Learn from certified and experienced trainers who bring real-world expertise and industry knowledge to every classroom.',
              color: 'from-emerald-500/10 to-emerald-600/5',
              iconColor: 'text-emerald-600',
              borderColor: 'hover:border-emerald-300',
              link: '/trainers',
              linkLabel: 'Meet Trainers',
            },
            {
              icon: Award,
              title: 'Recognized Credentials',
              description: 'Earn TESDA accredited certifications recognized by employers nationwide and internationally in your field.',
              color: 'from-amber-500/10 to-amber-600/5',
              iconColor: 'text-amber-600',
              borderColor: 'hover:border-amber-300',
              link: '/programs',
              linkLabel: 'View Certifications',
            },
          ].map(({ icon: Icon, title, description, color, iconColor, borderColor, link, linkLabel }) => (
            <Card key={title} className={`card-lift border-border/50 ${borderColor} transition-all duration-300 overflow-hidden group`}>
              <CardContent className="p-8 space-y-5 relative">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
                  <Link href={link} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${iconColor} group-hover:gap-2.5 transition-all duration-300`}>
                    {linkLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="absolute inset-0 dot-pattern" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14 space-y-3">
            <p className="text-sm font-semibold text-primary tracking-wider uppercase">Our Impact</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Numbers That <span className="gradient-text">Speak</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { target: 500, suffix: '+', label: 'Programs Available', sublabel: 'Across all industries', icon: GraduationCap, accent: 'from-blue-500/15 to-blue-600/5' },
              { target: 150, suffix: '+', label: 'Certified Centers', sublabel: 'Nationwide coverage', icon: Building2, accent: 'from-emerald-500/15 to-emerald-600/5' },
              { target: 10000, suffix: '+', label: 'Active Trainers', sublabel: 'Industry professionals', icon: Users, accent: 'from-violet-500/15 to-violet-600/5' },
            ].map(({ target, suffix, label, sublabel, icon: Icon, accent }) => (
              <div key={label} className="relative bg-white/60 backdrop-blur-sm rounded-2xl border border-border/40 p-8 text-center space-y-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${accent} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <AnimatedCounter target={target} suffix={suffix} />
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-primary tracking-wider uppercase">Getting Started</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your Path to <span className="gradient-text">Certification</span></h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Browse Programs', desc: 'Explore our catalog of accredited training programs', icon: Search },
            { step: '02', title: 'Choose a Training Center', desc: 'Find a certified training center near you', icon: Building2 },
            { step: '03', title: 'Enroll & Train', desc: 'Register and start your hands-on training', icon: Target },
            { step: '04', title: 'Get Certified', desc: 'Complete assessments and earn your TESDA NC', icon: Award },
          ].map(({ step, title, desc, icon: Icon }, index) => (
            <div key={step} className="relative text-center group">
              {/* Connector line */}
              {index < 3 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-linear-to-r from-primary/30 to-primary/5" />
              )}

              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary/10 to-accent/5 border border-primary/15 mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                <Icon className="w-7 h-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary/90 to-accent p-12 md:p-20 text-center">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 dot-pattern opacity-10" />
          <div className="absolute top-12 left-12 w-20 h-20 border border-white/10 rounded-2xl rotate-12 animate-float" />
          <div className="absolute bottom-12 right-16 w-14 h-14 border border-white/10 rounded-full animate-float-delayed" />

          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm text-white/90 font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              Start Your Journey Today
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white text-pretty tracking-tight">
              Ready to Transform
              <br />
              Your Career?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Start your journey with one of our comprehensive training programs and join thousands of successful graduates building better futures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/programs">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                  Get Started Today <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/centers">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white border border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/50 rounded-full px-8 h-12 text-base font-medium transition-all duration-300 backdrop-blur-sm cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  View All Training Centers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 relative">
        <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-sm">
                  <Image src="/tesda-logo.png" alt="TESDA Logo" fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">TESDA</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Technical Education and Skills Development Authority — empowering Filipinos through quality technical-vocational education and training.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/programs" className="text-foreground/70 hover:text-primary transition-colors">Programs</Link></li>
                <li><Link href="/centers" className="text-foreground/70 hover:text-primary transition-colors">Training Centers</Link></li>
                <li><Link href="/trainers" className="text-foreground/70 hover:text-primary transition-colors">Trainers</Link></li>
                <li><Link href="/assessment-centers" className="text-foreground/70 hover:text-primary transition-colors">Assessment Centers</Link></li>
                <li><Link href="/assessors" className="text-foreground/70 hover:text-primary transition-colors">Assessors</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Admin</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">Admin Portal</Link></li>
                <li><Link href="/admin/login" className="text-foreground/70 hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Contact</h4>
              <p className="text-sm text-foreground/70">support@tesda.gov.ph</p>
              <p className="text-sm text-foreground/70">+63 (2) 887-7777</p>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TESDA. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
