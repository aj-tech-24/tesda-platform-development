'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Building2, Search, Users, Filter, BadgeCheck, Hash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [filteredTrainers, setFilteredTrainers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTrainers()
  }, [])

  async function fetchTrainers() {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*, training_centers(name)')
        .order('full_name')
      
      if (error) throw error
      setTrainers(data || [])
      setFilteredTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = trainers.filter((trainer) =>
      trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTrainers(filtered)
  }, [searchTerm, trainers])

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const avatarColors = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-50/50 via-primary/3 to-background border-b border-border/50">
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
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-200/30 items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-violet-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Expert Trainers</h1>
              <p className="text-muted-foreground max-w-xl">Meet our certified and experienced trainers who bring real-world expertise to every classroom.</p>
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
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{filteredTrainers.length}</span> of {trainers.length} trainers</span>
            </div>
          </div>

          {/* Trainers Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTrainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer, index) => (
                <Card 
                  key={trainer.id} 
                  className="card-lift border-border/50 hover:border-violet-300/50 overflow-hidden group animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <CardContent className="p-6 space-y-5">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {getInitials(trainer.full_name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-violet-700 transition-colors flex items-center gap-2">
                          {trainer.full_name}
                          <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        </h3>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="pt-0.5">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Specialization</p>
                          <p className="text-sm font-semibold">{trainer.specialization}</p>
                        </div>
                      </div>

                      {trainer.training_centers && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="pt-0.5">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Training Center</p>
                            <p className="text-sm font-semibold">{trainer.training_centers.name}</p>
                          </div>
                        </div>
                      )}

                      {trainer.certification_number && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Hash className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="pt-0.5">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Cert. Number</p>
                            <p className="text-sm font-mono text-muted-foreground">{trainer.certification_number}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="w-full rounded-lg hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all group/btn">
                      View Profile
                      <ArrowLeft className="w-3 h-3 ml-1 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No trainers found</p>
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
