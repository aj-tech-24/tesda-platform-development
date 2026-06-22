'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Building2, Search, MapPin, Filter, Phone, User, Award, BadgeCheck, CalendarDays, FileText } from 'lucide-react'
import { matchesSearchValue } from '@/lib/search-utils'

interface AssessmentAccreditation {
  qualification_title: string | null
  accreditation_number: string | null
  date_accredited: string | null
  valid_until: string | null
  status: string | null
}

interface AssessmentCenter {
  id: string
  name: string
  region: string | null
  province: string | null
  address: string | null
  longitude: number | null
  latitude: number | null
  center_manager: string | null
  contact_no: string | null
  sector: string | null
  status: string | null
  assessment_accreditations?: AssessmentAccreditation[]
}

interface AssessmentCentersListProps {
  initialCenters: AssessmentCenter[]
}

export function AssessmentCentersList({ initialCenters }: AssessmentCentersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const activeCenters = initialCenters.filter(center => (center.status || 'Active').toLowerCase() === 'active')

  const filtered = activeCenters.filter((center) => {
    const matchesSearch = !searchTerm ||
      matchesSearchValue(center.name, searchTerm) ||
      matchesSearchValue(center.region, searchTerm) ||
      matchesSearchValue(center.province, searchTerm) ||
      matchesSearchValue(center.address, searchTerm) ||
      matchesSearchValue(center.center_manager, searchTerm) ||
      matchesSearchValue(center.sector, searchTerm) ||
      (center.assessment_accreditations && center.assessment_accreditations.some(a => {
        const isExpired = a.valid_until ? new Date(a.valid_until) < new Date() : false;
        const isStatusActive = (a.status || 'Active').toLowerCase() === 'active';
        return !isExpired && isStatusActive && matchesSearchValue(a.qualification_title, searchTerm);
      }))
    return matchesSearch
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Assessment Centers</h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">Browse TESDA-accredited assessment centers and view qualifications.</p>
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
                  placeholder="Search by center, region, province, manager or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 hover:shadow-xs focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all text-sm"
                />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 self-end sm:self-center">
              <Filter className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {activeCenters.length} centers</span>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((center, index) => {
                const accreditations = center.assessment_accreditations || []

                return (
                  <Card
                    key={center.id}
                    className="card-lift border-border/50 hover:border-primary/30 rounded-2xl overflow-hidden group animate-fade-in-up h-full flex flex-col relative cursor-pointer hover:shadow-md transition-all duration-300"
                    style={prefersReducedMotion ? {} : { opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                          <Building2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/assessment-centers/${center.id}`} className="hover:underline focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:z-0">
                              {center.name}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {center.sector && (
                              <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/5 text-primary dark:bg-primary/25 dark:text-primary-foreground">{center.sector}</span>
                            )}
                            {center.status && (
                              <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border relative z-10 ${
                                center.status.toLowerCase() === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}>
                                {center.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(center.address || center.region || center.province) && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Location</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{[center.address, center.region, center.province].filter(Boolean).join(', ')}</p>
                            </div>
                          </div>
                        )}

                        {center.center_manager && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Center Manager</p>
                              <p className="text-sm font-semibold">{center.center_manager}</p>
                            </div>
                          </div>
                        )}

                        {center.contact_no && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Contact No.</p>
                              <p className="text-sm font-semibold">{center.contact_no}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/60 space-y-3">
                        {(() => {
                          const activeAccreds = accreditations.filter(a => {
                            const isExpired = a.valid_until ? new Date(a.valid_until) < new Date() : false;
                            const isStatusActive = (a.status || 'Active').toLowerCase() === 'active';
                            return !isExpired && isStatusActive;
                          });

                          return (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                  <Award className="w-4 h-4 text-primary" strokeWidth={1.5} />
                                  Accreditation Coverage
                                </div>
                                <span className="text-xs text-muted-foreground">{activeAccreds.length} qualification{activeAccreds.length !== 1 ? 's' : ''}</span>
                              </div>

                              {activeAccreds.length > 0 ? (
                                <div className="space-y-2">
                                  {activeAccreds.slice(0, 2).map((accreditation, accredIndex) => (
                                    <div key={`${center.id}-${accredIndex}`} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 space-y-2">
                                      <div className="flex items-start gap-2">
                                        <BadgeCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold truncate">{accreditation.qualification_title || 'Unknown Qualification'}</p>
                                          {accreditation.accreditation_number && (
                                            <p className="text-xs text-muted-foreground">Accreditation No. {accreditation.accreditation_number}</p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                        {accreditation.date_accredited && (
                                          <span className="inline-flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            Accredited {new Date(accreditation.date_accredited).toLocaleDateString()}
                                          </span>
                                        )}
                                        {accreditation.valid_until && (
                                          <span className="inline-flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            Valid until {new Date(accreditation.valid_until).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {activeAccreds.length > 2 && (
                                    <p className="text-xs text-muted-foreground">+{activeAccreds.length - 2} more qualification{activeAccreds.length - 2 !== 1 ? 's' : ''}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No active qualifications listed</p>
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
              <p className="text-muted-foreground mb-2 font-medium">No assessment centers found</p>
              <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search terms</p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm('') }} 
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
