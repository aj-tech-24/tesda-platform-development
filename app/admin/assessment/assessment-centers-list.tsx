'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Search, Filter, MapPin, Building2, Layers } from 'lucide-react'

interface Center {
  id: string
  name: string
  region?: string | null
  province?: string | null
  address?: string | null
  sector?: string | null
  status?: string | null
}

interface AssessmentCentersListProps {
  initialCenters: Center[]
  addButtonText?: string
  addButtonHref?: string
}

export function AssessmentCentersList({ initialCenters, addButtonText, addButtonHref }: AssessmentCentersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = Array.from(new Set(initialCenters.map(c => c.status).filter(Boolean))).sort()

  const filtered = initialCenters.filter((center) => {
    const matchesSearch = !searchTerm ||
      center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || center.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-linear-to-br from-violet-50/50 via-primary/3 to-background border-b border-border/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/10 to-violet-600/5 border border-violet-200/30 items-center justify-center shrink-0">
              <Layers className="w-8 h-8 text-violet-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Assessment Centers</h1>
              <p className="text-muted-foreground max-w-xl">Manage and review TESDA assessment centers in this admin area.</p>
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
                <Link href={addButtonHref}>
                  <Button className="rounded-full" size="sm">{addButtonText || 'Add'}</Button>
                </Link>
              ) : null}
              <div className="inline-flex items-center gap-3">
                <Filter className="w-4 h-4" />
                <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialCenters.length} centers</span>
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filtered.map((center, index) => (
                <Link key={center.id} href={`/admin/assessment/${center.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl">
                  <Card className="card-lift border-border/50 hover:border-violet-300/50 overflow-hidden group animate-fade-in-up h-fit self-start" style={{ opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}>
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                        {center.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors flex items-center gap-1.5">
                          {center.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {center.sector && (
                            <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400">{center.sector}</span>
                          )}
                          {center.status && (
                            <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{center.status}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(center.address || center.region || center.province) && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-rose-500" />
                          </div>
                          <div className="pt-0.5">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Location</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{[center.address, center.region, center.province].filter(Boolean).join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {center.sector && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="pt-0.5">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Sector</p>
                            <p className="text-sm font-semibold">{center.sector}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-border/60 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Building2 className="w-4 h-4 text-violet-600" />
                        Open center details
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No assessment centers found</p>
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
