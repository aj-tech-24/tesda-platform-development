import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  Shield, 
  Target, 
  Star, 
  CheckCircle2 
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { SearchBar } from '@/components/search-bar'
import { AnimatedCounter } from '@/components/animated-counter'
import { createClient } from '@/lib/supabase/server'

import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ISR: revalidate every hour
export const revalidate = 3600

const getStats = unstable_cache(
  async () => {
    // Use a stateless client so we don't opt out of caching via cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    const [
      { count: programsCount },
      { count: institutionsCount },
      { count: trainersCount },
      { count: assessmentCentersCount },
      { count: assessorsCount }
    ] = await Promise.all([
      supabase.from('programs').select('*', { count: 'estimated', head: true }),
      supabase.from('institutions').select('*', { count: 'estimated', head: true }),
      supabase.from('trainers').select('*', { count: 'estimated', head: true }),
      supabase.from('assessment_centers').select('*', { count: 'estimated', head: true }),
      supabase.from('assessors').select('*', { count: 'estimated', head: true })
    ])

    return {
      programsCount: programsCount || 0,
      institutionsCount: institutionsCount || 0,
      trainersCount: trainersCount || 0,
      assessmentCentersCount: assessmentCentersCount || 0,
      assessorsCount: assessorsCount || 0,
    }
  },
  ['homepage-stats'],
  { revalidate: 3600 }
)

export default async function Home() {
  // Fetch stats from cache (instantly fast on reload, even in dev mode)
  const {
    programsCount,
    institutionsCount,
    trainersCount,
    assessmentCentersCount,
    assessorsCount
  } = await getStats()

  const totalCentersCount = (institutionsCount || 0) + (assessmentCentersCount || 0)
  const totalTrainersCount = (trainersCount || 0) + (assessorsCount || 0)
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-pattern overflow-hidden pt-24 pb-20">
        {/* Background blobs */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 text-left space-y-6 animate-fade-in-up">
              {/* Badge Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 text-sm text-primary font-medium">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                TESDA Davao del Sur Provincial Office
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-pretty leading-[1.05]">
                Empowering Davao del Sur
                <br />
                <span className="gradient-text">Through Skills</span>
              </h1>

              {/* Subtext */}
              <p className="text-base md:text-lg text-muted-foreground max-w-xl text-pretty leading-relaxed">
                Discover and access accredited technical vocational programs, certified training and assessment centers, and verified trainers across Davao del Sur.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/programs">
                  <Button size="lg" className="gap-2 w-full sm:w-auto bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 text-white rounded-full px-8 h-12 text-base active:scale-[0.98] transition-transform cursor-pointer">
                    Explore Programs <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </Link>
                <Link href="/centers">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base border-border/80 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98] transition-transform cursor-pointer">
                    <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Find Training Centers
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual photography asset */}
            <div className="lg:col-span-5 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative group rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/5 bg-muted aspect-4/3">
                <Image
                  src="/tesda-training.png"
                  alt="TESDA Skills Training Session"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <SearchBar />

      {/* Trust Indicators Section */}
      <section className="relative z-10 mt-6 mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl border border-border/40 p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-around gap-6 flex-wrap">
            {[
              { icon: CheckCircle2, label: `${programsCount || 0} Programs` },
              { icon: Building2, label: `${totalCentersCount || 0} Accredited Centers` },
              { icon: Users, label: `${totalTrainersCount || 0} Trainers & Assessors` },
              { icon: Star, label: 'TESDA Accredited' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
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
              description: 'Access a wide range of accredited training programs covering various industries and skill levels from beginner to advanced certifications.',
              link: '/programs',
              linkLabel: 'Browse Programs',
            },
            {
              icon: Users,
              title: 'Expert Trainers',
              description: 'Learn from certified and experienced trainers who bring real-world expertise and industry knowledge to every classroom.',
              link: '/trainers',
              linkLabel: 'Meet Trainers',
            },
            {
              icon: Award,
              title: 'Recognized Credentials',
              description: 'Earn TESDA accredited certifications recognized by employers nationwide and internationally in your field.',
              link: '/programs',
              linkLabel: 'View Certifications',
            },
          ].map(({ icon: Icon, title, description, link, linkLabel }) => (
            <Card key={title} className="card-lift border-border/50 hover:border-primary/30 rounded-2xl transition-all duration-300 overflow-hidden group">
              <CardContent className="p-8 space-y-5 relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
                  <Link href={link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-300 active:scale-[0.98] transition-transform">
                    {linkLabel}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="absolute inset-0 dot-pattern" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Numbers That <span className="gradient-text">Speak</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { target: programsCount || 0, suffix: '', label: 'Programs Available', sublabel: 'In Davao del Sur', icon: GraduationCap },
              { target: totalCentersCount || 0, suffix: '', label: 'Accredited Centers', sublabel: 'Training & Assessment', icon: Building2 },
              { target: totalTrainersCount || 0, suffix: '', label: 'Certified Professionals', sublabel: 'Trainers & Assessors', icon: Users },
            ].map(({ target, suffix, label, sublabel, icon: Icon }) => (
              <div key={label} className="relative bg-white/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/40 p-8 text-center space-y-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your Path to <span className="gradient-text">Certification</span></h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Browse Programs', desc: 'Explore our catalog of accredited training programs', icon: BookOpen },
            { step: '02', title: 'Choose a Training Center', desc: 'Find a certified training center near you', icon: Building2 },
            { step: '03', title: 'Enroll & Train', desc: 'Register and start your hands-on training', icon: Target },
            { step: '04', title: 'Get Certified', desc: 'Complete assessments and earn your TESDA NC', icon: Award },
          ].map(({ step, title, desc, icon: Icon }, index) => (
            <div key={step} className="relative text-center group">
              {/* Connector line */}
              {index < 3 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/5" />
              )}

              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/15 mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-12 md:p-20 text-center">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 dot-pattern opacity-10" />

          <div className="relative space-y-8">
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
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] transition-transform cursor-pointer">
                  Explore Programs <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link href="/centers">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white border border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/50 rounded-full px-8 h-12 text-base font-medium transition-all duration-300 backdrop-blur-sm active:scale-[0.98] transition-transform cursor-pointer">
                  <Building2 className="w-4 h-4" strokeWidth={1.5} />
                  Find Training Centers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative flex items-center justify-center drop-shadow-sm">
                  <Image src="/tesda-logo.png" alt="TESDA Logo" fill className="object-contain" sizes="48px" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">TESDA PO</h3>
                  <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-1">Davao del Sur</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Technical Education and Skills Development Authority - Davao del Sur Provincial Office. Empowering the province through quality technical-vocational education and training.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-foreground">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/programs" className="text-foreground/70 hover:text-primary transition-colors">Programs</Link></li>
                <li><Link href="/centers" className="text-foreground/70 hover:text-primary transition-colors">Training Centers</Link></li>
                <li><Link href="/trainers" className="text-foreground/70 hover:text-primary transition-colors">Trainers</Link></li>
                <li><Link href="/assessment-centers" className="text-foreground/70 hover:text-primary transition-colors">Assessment Centers</Link></li>
                <li><Link href="/assessors" className="text-foreground/70 hover:text-primary transition-colors">Assessors</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-foreground">Admin</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">Admin Portal</Link></li>
                <li><Link href="/admin/login" className="text-foreground/70 hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-foreground">Contact</h4>
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
