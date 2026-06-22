'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Building2, Search, Users, Filter, BadgeCheck, Hash, Calendar } from 'lucide-react'
import { matchesSearchValue } from '@/lib/search-utils'

interface Trainer {
  id: string
  full_name: string
  specialization: string | null
  employment_type: string | null
  nttc_no: string | null
  nttc_validity: string | null
  institutions: { name: string } | null
}

interface TrainersListProps {
  initialTrainers: Trainer[]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function TrainersList({ initialTrainers }: TrainersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const filtered = initialTrainers.filter((t) => {
    const matchesSearch = !searchTerm ||
      matchesSearchValue(t.full_name, searchTerm) ||
      matchesSearchValue(t.specialization, searchTerm) ||
      matchesSearchValue(t.institutions?.name, searchTerm)
    const matchesType = selectedType === 'all' || t.employment_type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
          <Link href="/" className="inline-flex mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-primary/10">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back Home
            </Button>
          </Link>
          
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="hidden sm:flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.15)] hover:scale-105 transition-transform duration-300 backdrop-blur-xs">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-pulse-glow" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Expert Trainers</h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">Meet our certified and experienced trainers who bring real-world expertise to every classroom.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="space-y-8">
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              <div className="relative flex-1 sm:max-w-md">
                <Search 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                  strokeWidth={1.5} 
                />
                <input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 hover:shadow-xs focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all text-sm"
                />
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[140px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 hover:shadow-xs focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background text-sm outline-none transition-all cursor-pointer appearance-none pr-10"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: 'right 0.75rem center', 
                    backgroundSize: '1.25rem', 
                    backgroundRepeat: 'no-repeat' 
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="Regular">Regular</option>
                  <option value="On call">On call</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 self-end sm:self-center">
              <Filter className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialTrainers.length} trainers</span>
            </div>
          </div>

          {/* Trainers Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((trainer, index) => {
                const nttcExpired = trainer.nttc_validity && new Date(trainer.nttc_validity) < new Date()
                const isRegular = trainer.employment_type === 'Regular'
                return (
                  <Card 
                    key={trainer.id} 
                    className="card-lift border-border/50 hover:border-primary/30 rounded-2xl overflow-hidden group animate-fade-in-up h-full flex flex-col relative cursor-pointer hover:shadow-md transition-all duration-300"
                    style={prefersReducedMotion ? {} : { opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                      {/* Profile Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-xs shrink-0">
                          {getInitials(trainer.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <Link href={`/trainers/${trainer.id}`} className="hover:underline focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:z-0">
                              {trainer.full_name}
                            </Link>
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                          </h3>
                          {trainer.employment_type && (
                            <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5 relative z-10 ${isRegular ? 'bg-primary/5 text-primary dark:bg-primary/25 dark:text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {trainer.employment_type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {trainer.specialization && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Specialization</p>
                              <p className="text-sm font-semibold">{trainer.specialization}</p>
                            </div>
                          </div>
                        )}

                        {trainer.institutions && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Training Center</p>
                              <p className="text-sm font-semibold">{trainer.institutions.name}</p>
                            </div>
                          </div>
                        )}

                        {trainer.nttc_no && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <Hash className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">NTTC No.</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono text-muted-foreground">{trainer.nttc_no}</p>
                                {nttcExpired && <span className="text-[9px] font-bold text-destructive bg-destructive/5 px-1.5 py-0.5 rounded-full">EXPIRED</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {trainer.nttc_validity && !nttcExpired && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Valid Until</p>
                              <p className="text-sm font-semibold text-primary">{new Date(trainer.nttc_validity).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No trainers found</p>
              <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search terms</p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(''); setSelectedType('all') }} 
                className="rounded-full active:scale-[0.98] transition-transform cursor-pointer"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
