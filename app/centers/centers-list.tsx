'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Mail, Globe, Search, Building2, Filter, ExternalLink, Phone } from 'lucide-react'

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
}

interface CentersListProps {
  initialCenters: Institution[]
}

export function CentersList({ initialCenters }: CentersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const institutionTypes = Array.from(new Set(initialCenters.map(c => c.institution_type).filter(Boolean))).sort()

  const filtered = initialCenters.filter((c) => {
    const matchesSearch = !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.municipality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.province?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || c.institution_type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-50/50 via-accent/3 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link href="/" className="inline-flex mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/60 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
          
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200/30 items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Training Centers</h1>
              <p className="text-muted-foreground max-w-xl">Find TESDA-accredited training centers near you and start your skills journey.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search by name, city, province..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
              {institutionTypes.length > 0 && (
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-border/80 bg-background text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                >
                  <option value="all">All Types</option>
                  {institutionTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
                </select>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialCenters.length} centers</span>
            </div>
          </div>

          {/* Centers Grid */}
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((center, index) => (
                <Card 
                  key={center.id} 
                  className="card-lift border-border/50 hover:border-emerald-300/50 overflow-hidden group animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                >
                  <CardContent className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {center.logo_url ? (
                          <img src={center.logo_url} alt={center.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Building2 className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{center.name}</h3>
                        {center.institution_type && (
                          <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 mt-1">{center.institution_type}</span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      {(center.address || center.municipality || center.province) && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-rose-500" />
                          </div>
                          <p className="text-sm text-muted-foreground pt-1.5 leading-relaxed">
                            {[center.address, center.municipality, center.province].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {center.contact_email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-blue-500" />
                          </div>
                          <a href={`mailto:${center.contact_email}`} className="text-sm text-primary hover:underline underline-offset-2">
                            {center.contact_email}
                          </a>
                        </div>
                      )}

                      {center.contact_no && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-violet-500" />
                          </div>
                          <span className="text-sm text-muted-foreground">{center.contact_no}</span>
                        </div>
                      )}

                      {center.website_url && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4 text-teal-500" />
                          </div>
                          <a href={center.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline underline-offset-2 flex items-center gap-1">
                            Visit Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No centers found</p>
              <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search terms</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedType('all') }} className="rounded-full">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
