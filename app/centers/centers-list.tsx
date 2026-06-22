'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Mail, Globe, Search, Building2, Filter, ExternalLink, Phone, Award, BadgeCheck, Clock, BookOpen } from 'lucide-react'
import { matchesSearchValue } from '@/lib/search-utils'

interface Program {
  id: string
  title: string
  qualification_level: string | null
  duration_hours: number | null
  registration_no: string | null
  date_issued: string | null
  expiration_date: string | null
  delivery_mode: string | null
}

interface Institution {
  id: string
  name: string
  address: string | null
  municipality: string | null
  province: string | null
  contact_email: string | null
  contact_no: string | null
  website_url: string | null
  logo_url: string | null
  institution_type: string | null
  status: string | null
  programs?: Program[]
}

interface CentersListProps {
  initialCenters: Institution[]
}

export function CentersList({ initialCenters }: CentersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const activeCenters = initialCenters.filter(c => (c.status || 'Active').toLowerCase() === 'active')
  const institutionTypes = Array.from(new Set(activeCenters.map(c => c.institution_type).filter(Boolean))).sort()

  const filtered = activeCenters.filter((c) => {
    const matchesSearch = !searchTerm ||
      matchesSearchValue(c.name, searchTerm) ||
      matchesSearchValue(c.address, searchTerm) ||
      matchesSearchValue(c.municipality, searchTerm) ||
      matchesSearchValue(c.province, searchTerm) ||
      (c.programs && c.programs.some(p => {
        const isExpired = p.expiration_date ? new Date(p.expiration_date) < new Date() : false;
        return !isExpired && matchesSearchValue(p.title, searchTerm);
      }))
    const matchesType = selectedType === 'all' || c.institution_type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-6 sm:pb-12">
          <Link href="/" className="inline-flex mb-4 sm:mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-primary/10">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back Home
            </Button>
          </Link>

          <div className="flex items-start gap-3 sm:gap-5">
            <div className="hidden sm:flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.15)] hover:scale-105 transition-transform duration-300 backdrop-blur-xs">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-pulse-glow" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Training Centers</h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">Find TESDA-accredited training centers near you and start your skills journey.</p>
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
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  strokeWidth={1.5}
                />
                <input
                  placeholder="Search by name, city, province or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 hover:shadow-xs focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all text-sm"
                />
              </div>
              {institutionTypes.length > 0 && (
                <div className="relative min-w-[140px]">
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
                    {institutionTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 self-end sm:self-center">
              <Filter className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialCenters.length} centers</span>
            </div>
          </div>

          {/* Centers Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((center, index) => {
                const programs = center.programs || []
                return (
                  <Card
                    key={center.id}
                    className="card-lift border-border/50 hover:border-primary/30 rounded-2xl overflow-hidden group animate-fade-in-up h-full flex flex-col relative cursor-pointer hover:shadow-md transition-all duration-300"
                    style={prefersReducedMotion ? {} : { opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {center.logo_url ? (
                              <img src={center.logo_url} alt={center.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Building2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                              <Link href={`/centers/${center.id}`} className="hover:underline focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:z-0">
                                {center.name}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {center.institution_type && (
                                <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/5 text-primary dark:bg-primary/25 dark:text-primary-foreground">{center.institution_type}</span>
                              )}
                              {center.status && (
                                <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border relative z-10 ${center.status.toLowerCase() === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                                  }`}>
                                  {center.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          {(center.address || center.municipality || center.province) && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                              </div>
                              <p className="text-sm text-muted-foreground pt-1.5 leading-relaxed">
                                {[center.address, center.municipality, center.province].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          )}

                          {center.contact_email && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                              </div>
                              <a href={`mailto:${center.contact_email}`} className="text-sm text-primary hover:underline underline-offset-2 relative z-10">
                                {center.contact_email}
                              </a>
                            </div>
                          )}

                          {center.contact_no && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                              </div>
                              <span className="text-sm text-muted-foreground">{center.contact_no}</span>
                            </div>
                          )}

                          {center.website_url && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                <Globe className="w-4 h-4 text-primary" strokeWidth={1.5} />
                              </div>
                              <a href={center.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline underline-offset-2 flex items-center gap-1 active:scale-[0.98] transition-transform relative z-10">
                                Visit Website <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Program Coverage */}
                      <div className="pt-4 border-t border-border/60 space-y-3">
                        {(() => {
                          const activeProgs = programs.filter(p => {
                            const isExpired = p.expiration_date ? new Date(p.expiration_date) < new Date() : false;
                            return !isExpired;
                          });

                          return (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                  <Award className="w-4 h-4 text-primary" strokeWidth={1.5} />
                                  Program Coverage
                                </div>
                                <span className="text-xs text-muted-foreground">{activeProgs.length} program{activeProgs.length !== 1 ? 's' : ''}</span>
                              </div>

                              {activeProgs.length > 0 ? (
                                <div className="space-y-2">
                                  {activeProgs.slice(0, 2).map((program, progIndex) => (
                                    <div key={`${center.id}-${progIndex}`} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 space-y-2">
                                      <div className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold truncate">{program.title || 'Unknown Program'}</p>
                                          {program.registration_no && (
                                            <p className="text-xs text-muted-foreground font-mono">Reg. No. {program.registration_no}</p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                        {program.duration_hours && (
                                          <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            {program.duration_hours} hours
                                          </span>
                                        )}
                                        {program.delivery_mode && (
                                          <span className="inline-flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            {program.delivery_mode}
                                          </span>
                                        )}
                                        {program.qualification_level && (
                                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                            <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            {program.qualification_level}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {activeProgs.length > 2 && (
                                    <p className="text-xs text-muted-foreground">+{activeProgs.length - 2} more program{activeProgs.length - 2 !== 1 ? 's' : ''}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No active programs listed</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No centers found</p>
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
