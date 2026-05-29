'use client'

import { useState } from 'react'
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

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function TrainersList({ initialTrainers }: TrainersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

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
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 rounded-xl border border-border/80 bg-background text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="Regular">Regular</option>
                <option value="On call">On call</option>
              </select>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {initialTrainers.length} trainers</span>
            </div>
          </div>

          {/* Trainers Grid */}
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((trainer, index) => {
                const nttcExpired = trainer.nttc_validity && new Date(trainer.nttc_validity) < new Date()
                const isRegular = trainer.employment_type === 'Regular'
                return (
                  <Card 
                    key={trainer.id} 
                    className="card-lift border-border/50 hover:border-violet-300/50 overflow-hidden group animate-fade-in-up"
                    style={{ opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <CardContent className="p-6 space-y-5">
                      {/* Profile Header */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-linear-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>
                          {getInitials(trainer.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors flex items-center gap-1.5">
                            {trainer.full_name}
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          </h3>
                          {trainer.employment_type && (
                            <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-0.5 ${isRegular ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                              {trainer.employment_type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {trainer.specialization && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Specialization</p>
                              <p className="text-sm font-semibold">{trainer.specialization}</p>
                            </div>
                          </div>
                        )}

                        {trainer.institutions && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Training Center</p>
                              <p className="text-sm font-semibold">{trainer.institutions.name}</p>
                            </div>
                          </div>
                        )}

                        {trainer.nttc_no && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
                              <Hash className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">NTTC No.</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono text-muted-foreground">{trainer.nttc_no}</p>
                                {nttcExpired && <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">EXPIRED</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {trainer.nttc_validity && !nttcExpired && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="pt-0.5">
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Valid Until</p>
                              <p className="text-sm font-semibold text-emerald-600">{new Date(trainer.nttc_validity).toLocaleDateString()}</p>
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
                <Users className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No trainers found</p>
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
