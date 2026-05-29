'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, Award, Search, BookOpen, Filter, GraduationCap } from 'lucide-react'

interface Program {
  id: string
  title: string
  description: string | null
  qualification_level: string | null
  duration_hours: number | null
  delivery_mode: string | null
}

interface ProgramsListProps {
  initialPrograms: Program[]
  initialSearchTerm?: string
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function buildAcronym(value?: string | null) {
  if (!value) return ''

  return value
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toLowerCase()
}

function matchesSearchField(fieldValue: string | null | undefined, query: string) {
  if (!fieldValue) return false

  const normalizedField = normalizeText(fieldValue)
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return true

  if (normalizedField.includes(normalizedQuery)) return true

  const acronym = buildAcronym(fieldValue)
  return acronym.includes(normalizedQuery.replace(/\s+/g, ''))
}

export function ProgramsList({ initialPrograms, initialSearchTerm = '' }: ProgramsListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)

  useEffect(() => {
    setSearchTerm(initialSearchTerm)
  }, [initialSearchTerm])

  const filteredPrograms = useMemo(() => {
    const query = searchTerm.trim()
    if (!query) return initialPrograms

    return initialPrograms.filter((program) => (
      matchesSearchField(program.title, query) ||
      matchesSearchField(program.description, query) ||
      matchesSearchField(program.qualification_level, query) ||
      matchesSearchField(program.delivery_mode, query)
    ))
  }, [initialPrograms, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary/5 via-accent/3 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link href="/" className="inline-flex mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/60 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
          
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/30 items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Training Programs</h1>
              <p className="text-muted-foreground max-w-xl">Browse our comprehensive catalog of TESDA-accredited technical training programs.</p>
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
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{filteredPrograms.length}</span> of {initialPrograms.length} programs</span>
            </div>
          </div>

          {/* Programs Grid */}
          {filteredPrograms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program, index) => (
                <Card 
                  key={program.id} 
                  className="card-lift border-border/50 hover:border-primary/30 overflow-hidden group animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-linear-to-r from-primary/60 via-accent/40 to-transparent" />
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{program.title}</h3>
                    </div>

                    {program.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{program.description}</p>
                    )}
                    
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      {program.qualification_level && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>Type:</span>
                          </div>
                          <span className="font-semibold text-foreground bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md text-xs">{program.qualification_level}</span>
                        </div>
                      )}
                      {program.duration_hours && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Duration:</span>
                          </div>
                          <span className="font-semibold text-foreground">{program.duration_hours} hours</span>
                        </div>
                      )}
                      {program.delivery_mode && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <span>Mode:</span>
                          </div>
                          <span className="font-semibold text-foreground text-xs">{program.delivery_mode}</span>
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
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No programs found</p>
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
