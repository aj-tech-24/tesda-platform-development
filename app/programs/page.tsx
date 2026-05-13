'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, Award, Search, BookOpen, Filter, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPrograms()
  }, [])

  async function fetchPrograms() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('title')
      
      if (error) throw error
      setPrograms(data || [])
      setFilteredPrograms(data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = programs.filter((program) =>
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPrograms(filtered)
  }, [searchTerm, programs])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/3 to-background border-b border-border/50">
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
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/30 items-center justify-center flex-shrink-0">
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
              <span>Showing <span className="font-semibold text-foreground">{filteredPrograms.length}</span> of {programs.length} programs</span>
            </div>
          </div>

          {/* Programs Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-5 bg-muted rounded-lg w-3/4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPrograms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program, index) => (
                <Card 
                  key={program.id} 
                  className="card-lift border-border/50 hover:border-primary/30 overflow-hidden group animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{program.title}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{program.description}</p>
                    
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Level:</span>
                        </div>
                        <span className="font-semibold text-foreground bg-amber-50 px-2 py-0.5 rounded-md text-xs">{program.qualification_level}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>Duration:</span>
                        </div>
                        <span className="font-semibold text-foreground">{program.duration_hours} hours</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group/btn">
                      View Details
                      <ArrowLeft className="w-3 h-3 ml-1 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
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
