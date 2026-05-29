'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Search, Filter, MapPin, User, Award, BadgeCheck, CalendarDays, Building2 } from 'lucide-react'
import { matchesSearchValue } from '@/lib/search-utils'

interface AssessorAccreditation {
  qualification_title: string | null
  date_accredited: string | null
  valid_until: string | null
  status: string | null
}

interface Assessor {
  id: string
  name: string
  region: string | null
  province: string | null
  address: string | null
  sector: string | null
  status: string | null
  assessor_accreditations?: AssessorAccreditation[]
}

interface AssessorsListProps {
  initialAssessors: Assessor[]
  addButtonText?: string
  addButtonHref?: string
}

export function AssessorsList({ initialAssessors, addButtonText, addButtonHref }: AssessorsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = Array.from(new Set(initialAssessors.map(assessor => assessor.status).filter(Boolean))).sort()

  const filtered = initialAssessors.filter((assessor) => {
    const matchesSearch = !searchTerm ||
      matchesSearchValue(assessor.name, searchTerm) ||
      matchesSearchValue(assessor.region, searchTerm) ||
      matchesSearchValue(assessor.province, searchTerm) ||
      matchesSearchValue(assessor.address, searchTerm) ||
      matchesSearchValue(assessor.sector, searchTerm)
    const matchesStatus = selectedStatus === 'all' || assessor.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-linear-to-br from-violet-50/50 via-primary/3 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link href="/" className="inline-flex mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/60 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>

          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/10 to-violet-600/5 border border-violet-200/30 items-center justify-center shrink-0">
              <User className="w-8 h-8 text-violet-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Assessors</h1>
              <p className="text-muted-foreground max-w-xl">Browse TESDA-accredited assessors and review their qualification accreditations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search by name, region, province, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
              {statuses.length > 0 && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-border/80 bg-background text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => <option key={status as string} value={status as string}>{status as string}</option>)}
                </select>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground justify-end shrink-0">
              {addButtonHref ? (
                <Link href={addButtonHref} className="order-1 sm:order-0">
                  <Button className="rounded-full" size="sm">{addButtonText || 'Add'}</Button>
                </Link>
              ) : null}
              <div className="inline-flex items-center gap-3">
                <Filter className="w-4 h-4" />
                <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialAssessors.length} assessors</span>
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((assessor, index) => {
                const accreditations = assessor.assessor_accreditations || []

                return (
                  <Card
                    key={assessor.id}
                    className="card-lift border-border/50 hover:border-violet-300/50 overflow-hidden group animate-fade-in-up"
                    style={{ opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                          {assessor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold leading-tight group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors flex items-center gap-1.5">
                            {assessor.name}
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {assessor.sector && (
                              <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400">{assessor.sector}</span>
                            )}
                            {assessor.status && (
                              <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{assessor.status}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(assessor.address || assessor.region || assessor.province) && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Location</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{[assessor.address, assessor.region, assessor.province].filter(Boolean).join(', ')}</p>
                            </div>
                          </div>
                        )}

                        {assessor.sector && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Sector</p>
                              <p className="text-sm font-semibold">{assessor.sector}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/60 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Award className="w-4 h-4 text-violet-600" />
                            Accreditation Coverage
                          </div>
                          <span className="text-xs text-muted-foreground">{accreditations.length} qualification{accreditations.length !== 1 ? 's' : ''}</span>
                        </div>

                        {accreditations.length > 0 ? (
                          <div className="space-y-2">
                            {accreditations.slice(0, 2).map((accreditation, accredIndex) => (
                              <div key={`${assessor.id}-${accredIndex}`} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <BadgeCheck className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold truncate">{accreditation.qualification_title || 'Unknown Qualification'}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                  {accreditation.date_accredited && (
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays className="w-3.5 h-3.5" />
                                      Accredited {new Date(accreditation.date_accredited).toLocaleDateString()}
                                    </span>
                                  )}
                                  {accreditation.valid_until && (
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays className="w-3.5 h-3.5" />
                                      Valid until {new Date(accreditation.valid_until).toLocaleDateString()}
                                    </span>
                                  )}
                                  {accreditation.status && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                      <BadgeCheck className="w-3.5 h-3.5" />
                                      {accreditation.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {accreditations.length > 2 && (
                              <p className="text-xs text-muted-foreground">+{accreditations.length - 2} more qualification{accreditations.length - 2 !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No accreditations listed</p>
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
                <User className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No assessors found</p>
              <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search terms</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedStatus('all') }} className="rounded-full">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}