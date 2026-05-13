'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Mail, Globe, Search, Building2, Filter, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([])
  const [filteredCenters, setFilteredCenters] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCenters()
  }, [])

  async function fetchCenters() {
    try {
      const { data, error } = await supabase
        .from('training_centers')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCenters(data || [])
      setFilteredCenters(data || [])
    } catch (error) {
      console.error('Error fetching centers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = centers.filter((center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCenters(filtered)
  }, [searchTerm, centers])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-accent/3 to-background border-b border-border/50">
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
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200/30 items-center justify-center flex-shrink-0">
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
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{filteredCenters.length}</span> of {centers.length} centers</span>
            </div>
          </div>

          {/* Centers Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-muted rounded-lg w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCenters.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCenters.map((center, index) => (
                <Card 
                  key={center.id} 
                  className="card-lift border-border/50 hover:border-emerald-300/50 overflow-hidden group animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <CardContent className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200/20 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:shadow-md transition-shadow">
                        {center.logo_url ? (
                          <img src={center.logo_url} alt={center.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Building2 className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-emerald-700 transition-colors">{center.name}</h3>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 pl-0">
                      <div className="flex items-start gap-3 group/item">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-sm text-muted-foreground pt-1.5 leading-relaxed">{center.address}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-500" />
                        </div>
                        <a href={`mailto:${center.contact_email}`} className="text-sm text-primary hover:underline underline-offset-2">
                          {center.contact_email}
                        </a>
                      </div>

                      {center.website_url && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-violet-500" />
                          </div>
                          <a href={center.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline underline-offset-2 flex items-center gap-1">
                            Visit Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="w-full rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group/btn">
                      View Programs
                      <ArrowLeft className="w-3 h-3 ml-1 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
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
              <Button variant="outline" onClick={() => setSearchTerm('')} className="rounded-full">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
