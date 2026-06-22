'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Clock,
  Award,
  Search,
  BookOpen,
  Filter,
  GraduationCap,
  Laptop,
  Flame,
  Car,
  Utensils,
  HeartPulse,
  Cpu,
  HardHat,
  Compass,
  Briefcase,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Globe,
  Building2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  School
} from 'lucide-react'

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

interface GroupedProgram {
  title: string
  description: string | null
  qualification_level: string | null
  duration_hours: number | null
  delivery_mode: string | null
  offeringsCount: number
  ids: string[]
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

// Icon selector helper based on program title keywords
function getProgramIcon(title: string) {
  const lower = title.toLowerCase()
  if (
    lower.includes('computer') ||
    lower.includes('software') ||
    lower.includes('programming') ||
    lower.includes('information') ||
    lower.includes('systems servicing') ||
    lower.includes('it-') ||
    lower.includes('digital') ||
    lower.includes('animation')
  ) {
    return Laptop
  }
  if (lower.includes('weld') || lower.includes('metal') || lower.includes('shielded') || lower.includes('gas metal')) {
    return Flame
  }
  if (
    lower.includes('automotive') ||
    lower.includes('motorcycle') ||
    lower.includes('engine') ||
    lower.includes('driving') ||
    lower.includes('vehicle')
  ) {
    return Car
  }
  if (
    lower.includes('cook') ||
    lower.includes('food') ||
    lower.includes('baking') ||
    lower.includes('pastry') ||
    lower.includes('beverage') ||
    lower.includes('barista') ||
    lower.includes('restaurant') ||
    lower.includes('commercial cooking')
  ) {
    return Utensils
  }
  if (
    lower.includes('health') ||
    lower.includes('care') ||
    lower.includes('nursing') ||
    lower.includes('medical') ||
    lower.includes('dental') ||
    lower.includes('caregiving')
  ) {
    return HeartPulse
  }
  if (lower.includes('electric') || lower.includes('wiring') || lower.includes('electronic') || lower.includes('hvac')) {
    return Cpu
  }
  if (
    lower.includes('construction') ||
    lower.includes('masonry') ||
    lower.includes('carpentry') ||
    lower.includes('plumbing') ||
    lower.includes('civil') ||
    lower.includes('painting')
  ) {
    return HardHat
  }
  if (
    lower.includes('tour') ||
    lower.includes('hotel') ||
    lower.includes('hospitality') ||
    lower.includes('housekeeping') ||
    lower.includes('front office')
  ) {
    return Compass
  }
  if (
    lower.includes('business') ||
    lower.includes('office') ||
    lower.includes('bookkeeping') ||
    lower.includes('account') ||
    lower.includes('manage') ||
    lower.includes('admin')
  ) {
    return Briefcase
  }
  if (
    lower.includes('beauty') ||
    lower.includes('hair') ||
    lower.includes('wellness') ||
    lower.includes('massage') ||
    lower.includes('therap')
  ) {
    return ShoppingBag
  }
  return BookOpen
}

export function ProgramsList({ initialPrograms, initialSearchTerm = '' }: ProgramsListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Dialog State
  const [selectedProgram, setSelectedProgram] = useState<GroupedProgram | null>(null)
  const [isLoadingCenters, setIsLoadingCenters] = useState(false)
  const [trainingCenters, setTrainingCenters] = useState<any[]>([])
  const [assessmentCenters, setAssessmentCenters] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('training')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    setSearchTerm(initialSearchTerm)
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [initialSearchTerm])

  // Reset to first page on search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Group programs by Title to eliminate duplicates by school
  const groupedPrograms = useMemo(() => {
    const map = new Map<string, GroupedProgram>()

    initialPrograms.forEach((p) => {
      const key = p.title.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          title: p.title,
          description: p.description,
          qualification_level: p.qualification_level,
          duration_hours: p.duration_hours,
          delivery_mode: p.delivery_mode,
          offeringsCount: 1,
          ids: [p.id],
        })
      } else {
        const existing = map.get(key)!
        existing.offeringsCount += 1
        existing.ids.push(p.id)
        if (!existing.description && p.description) {
          existing.description = p.description
        }
        if (p.duration_hours && (!existing.duration_hours || p.duration_hours > existing.duration_hours)) {
          existing.duration_hours = p.duration_hours
        }
      }
    })

    return Array.from(map.values())
  }, [initialPrograms])

  const filteredPrograms = useMemo(() => {
    const query = searchTerm.trim()
    if (!query) return groupedPrograms

    return groupedPrograms.filter(
      (program) =>
        matchesSearchField(program.title, query) ||
        matchesSearchField(program.description, query) ||
        matchesSearchField(program.qualification_level, query) ||
        matchesSearchField(program.delivery_mode, query)
    )
  }, [groupedPrograms, searchTerm])

  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredPrograms, currentPage])

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE)

  // Fetch training & assessment centers when a program is selected
  useEffect(() => {
    if (!selectedProgram) {
      setTrainingCenters([])
      setAssessmentCenters([])
      return
    }

    const fetchCentersData = async () => {
      setIsLoadingCenters(true)
      const supabase = createClient()

      try {
        // Fetch training and assessment data concurrently to reduce load latency
        const [trainingResult, assessmentResult] = await Promise.all([
          supabase
            .from('programs')
            .select(`
              id,
              registration_no,
              date_issued,
              expiration_date,
              delivery_mode,
              duration_hours,
              qualification_level,
              institutions (
                id,
                name,
                address,
                municipality,
                province,
                contact_email,
                contact_no,
                website_url,
                logo_url,
                institution_type,
                status
              )
            `)
            .eq('title', selectedProgram.title),
          supabase
            .from('assessment_accreditations')
            .select(`
              id,
              accreditation_number,
              date_accredited,
              valid_until,
              status,
              assessment_centers (
                id,
                name,
                region,
                province,
                address,
                center_manager,
                contact_no,
                sector,
                status
              )
            `)
            .ilike('qualification_title', `%${selectedProgram.title}%`)
        ])

        const { data: trainingData, error: trainingError } = trainingResult
        const { data: assessmentData, error: assessmentError } = assessmentResult

        if (trainingError) console.error('Error fetching training centers:', trainingError)
        if (assessmentError) console.error('Error fetching assessment centers:', assessmentError)

        // Parse and deduplicate training centers by institution ID
        const seenInstitutions = new Set()
        const parsedTraining: any[] = []

        if (trainingData) {
          trainingData.forEach((p: any) => {
            if (p.institutions && !seenInstitutions.has(p.institutions.id)) {
              seenInstitutions.add(p.institutions.id)
              parsedTraining.push({
                programId: p.id,
                registrationNo: p.registration_no,
                dateIssued: p.date_issued,
                expirationDate: p.expiration_date,
                deliveryMode: p.delivery_mode,
                durationHours: p.duration_hours,
                qualificationLevel: p.qualification_level,
                institution: p.institutions,
              })
            }
          })
        }

        // Parse and deduplicate assessment centers by center ID
        const seenCenters = new Set()
        const parsedAssessment: any[] = []

        if (assessmentData) {
          assessmentData.forEach((a: any) => {
            if (a.assessment_centers && !seenCenters.has(a.assessment_centers.id)) {
              seenCenters.add(a.assessment_centers.id)
              parsedAssessment.push({
                accreditationId: a.id,
                accreditationNumber: a.accreditation_number,
                dateAccredited: a.date_accredited,
                validUntil: a.valid_until,
                status: a.status,
                center: a.assessment_centers,
              })
            }
          })
        }

        setTrainingCenters(parsedTraining)
        setAssessmentCenters(parsedAssessment)
      } catch (err) {
        console.error('Failed to load related centers:', err)
      } finally {
        setIsLoadingCenters(false)
      }
    }

    fetchCentersData()
  }, [selectedProgram])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link href="/" className="inline-flex mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] cursor-pointer border border-transparent hover:border-primary/10"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back Home
            </Button>
          </Link>

          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.15)] hover:scale-105 transition-transform duration-300 backdrop-blur-xs">
              <GraduationCap className="w-8 h-8 text-primary animate-pulse-glow" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Training Programs
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Browse our comprehensive catalog of TESDA-accredited technical training qualifications.
              </p>
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
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                  }`}
                strokeWidth={1.5}
              />
              <input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 hover:shadow-xs focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground self-end sm:self-center">
              <Filter className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span>
                Showing <span className="font-semibold text-foreground">{filteredPrograms.length}</span> of{' '}
                {groupedPrograms.length} unique programs
              </span>
            </div>
          </div>

          {/* Programs Grid */}
          {paginatedPrograms.length > 0 ? (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPrograms.map((program, index) => {
                  const ProgramIcon = getProgramIcon(program.title)
                  return (
                    <Card
                      key={program.title}
                      onClick={() => {
                        setSelectedProgram(program)
                        setActiveTab('training')
                      }}
                      className="card-lift border border-border/50 hover:border-primary/30 rounded-2xl overflow-hidden group animate-fade-in-up h-full flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg shadow-xs active:scale-[0.99]"
                      style={prefersReducedMotion ? {} : { opacity: 0, animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                    >
                      {/* Top gradient highlight */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-primary/70 via-accent/40 to-transparent transition-all duration-300 group-hover:from-primary group-hover:via-accent" />

                      <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between relative">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all duration-300 shadow-2xs">
                              <ProgramIcon className="w-5.5 h-5.5 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                            </div>
                            <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 text-[11px] font-semibold py-0.5 px-2">
                              {program.offeringsCount} Center{program.offeringsCount > 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-extrabold leading-tight group-hover:text-primary transition-colors line-clamp-2 pt-1 text-foreground">
                            {program.title}
                          </h3>

                          {program.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {program.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 pt-5 border-t border-border/50">
                          {program.qualification_level && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-primary/70" strokeWidth={1.5} /> Level
                              </span>
                              <span className="font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-md">{program.qualification_level}</span>
                            </div>
                          )}
                          {program.duration_hours && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-primary/70" strokeWidth={1.5} /> Duration
                              </span>
                              <span className="font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-md">{program.duration_hours} hrs</span>
                            </div>
                          )}
                          {program.delivery_mode && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-primary/70" strokeWidth={1.5} /> Mode
                              </span>
                              <span className="font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-md">{program.delivery_mode}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10 pb-4 border-t border-border/40 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    disabled={currentPage === 1}
                    className="rounded-xl h-10 w-10 p-0 hover:bg-primary/5 hover:text-primary transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    // Display first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setCurrentPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`rounded-xl h-10 w-10 font-bold transition-all active:scale-95 cursor-pointer ${
                            currentPage === page
                              ? 'bg-primary text-white shadow-md hover:bg-primary/95'
                              : 'hover:bg-primary/5 hover:text-primary'
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    }
                    // Render ellipses
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="text-muted-foreground/60 px-1 font-bold">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className="rounded-xl h-10 w-10 p-0 hover:bg-primary/5 hover:text-primary transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-card/30 rounded-3xl border border-border/50 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Search className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-foreground mb-2">No programs found</p>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find any training programs matching your search criteria. Try adjusting your keywords or filters.</p>
              <Button
                variant="default"
                onClick={() => setSearchTerm('')}
                className="rounded-full px-8 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform cursor-pointer"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Program Details Modal - Enhanced Two-Column Layout */}
      <Dialog open={selectedProgram !== null} onOpenChange={(open) => { if (!open) setSelectedProgram(null) }}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-5xl max-h-[90vh] md:h-[800px] overflow-hidden flex flex-col p-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl bg-background/95 backdrop-blur-xl">
          {selectedProgram && (
            <div className="flex flex-col md:flex-row h-full w-full min-h-0 min-w-0">

              {/* Left Column: Program Details (Sticky Info) */}
              <div className="w-full md:w-[35%] bg-muted/20 border-b md:border-b-0 md:border-r border-border/60 p-4 md:p-8 flex flex-col shrink-0 md:overflow-y-auto">
                <DialogHeader className="text-left space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg shadow-primary/5">
                      {(() => {
                        const Icon = getProgramIcon(selectedProgram.title)
                        return <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" strokeWidth={1.5} />
                      })()}
                    </div>
                    {/* Mobile Title & Badges layout (Inline for compactness) */}
                    <div className="md:hidden flex-1 min-w-0">
                      <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground leading-tight truncate">
                        {selectedProgram.title}
                      </DialogTitle>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedProgram.qualification_level && (
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {selectedProgram.qualification_level}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-foreground/5 text-foreground border-foreground/10 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedProgram.offeringsCount} Center{selectedProgram.offeringsCount > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Title & Badges layout */}
                  <div className="hidden md:block">
                    <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
                      {selectedProgram.title}
                    </DialogTitle>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProgram.qualification_level && (
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {selectedProgram.qualification_level}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-foreground/5 text-foreground border-foreground/10 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {selectedProgram.offeringsCount} Center{selectedProgram.offeringsCount > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  <DialogDescription className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {selectedProgram.description || 'No detailed description is currently available for this training program.'}
                  </DialogDescription>

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6 border-t border-border/50">
                    {selectedProgram.duration_hours && (
                      <div className="bg-background/50 rounded-xl p-3 md:p-4 border border-border/40 shadow-sm">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary/70 mb-1.5 md:mb-2" strokeWidth={1.5} />
                        <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 md:mb-1">Duration</div>
                        <div className="text-xs md:text-sm font-bold text-foreground">{selectedProgram.duration_hours} hours</div>
                      </div>
                    )}
                    {selectedProgram.delivery_mode && (
                      <div className="bg-background/50 rounded-xl p-3 md:p-4 border border-border/40 shadow-sm">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary/70 mb-1.5 md:mb-2" strokeWidth={1.5} />
                        <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 md:mb-1">Mode</div>
                        <div className="text-xs md:text-sm font-bold text-foreground capitalize">{selectedProgram.delivery_mode}</div>
                      </div>
                    )}
                  </div>
                </DialogHeader>
              </div>

              {/* Right Column: Interactive Tabs */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background/50 p-6 md:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid grid-cols-2 w-full h-auto p-1.5 bg-muted/50 rounded-2xl shrink-0 border border-border/40 shadow-inner items-center">
                    <TabsTrigger value="training" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm data-[state=active]:bg-background">
                      <School className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" strokeWidth={2} />
                      <span className="truncate">Training Centers</span>
                      <span className="ml-1 sm:ml-2 bg-muted-foreground/15 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs shrink-0">{isLoadingCenters ? '-' : trainingCenters.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="assessment" className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm data-[state=active]:bg-background">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" strokeWidth={2} />
                      <span className="truncate">Assessment Centers</span>
                      <span className="ml-1 sm:ml-2 bg-muted-foreground/15 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs shrink-0">{isLoadingCenters ? '-' : assessmentCenters.length}</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Training Centers Content */}
                  <TabsContent value="training" className="flex-1 overflow-y-auto scroll-smooth mt-6 pr-2 min-h-0 w-full min-w-0 space-y-4">
                    {isLoadingCenters ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/40">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))
                    ) : trainingCenters.length > 0 ? (
                      <div className="grid gap-4 w-full">
                        {trainingCenters.map((item, i) => (
                          <div
                            key={item.programId}
                            className="group/item relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 p-5 rounded-2xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md w-full min-w-0"
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
                              </div>
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-base text-foreground group-hover/item:text-primary transition-colors truncate">
                                    {item.institution.name}
                                  </h4>
                                  {item.institution.institution_type && (
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold py-0 px-2 rounded-full border-border/80">
                                      {item.institution.institution_type}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-primary/60 shrink-0" strokeWidth={1.5} />
                                  <span className="truncate">
                                    {[item.institution.address, item.institution.municipality, item.institution.province]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </p>
                                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 mt-1 border-t border-border/40 text-xs text-muted-foreground/90 font-medium">
                                  {item.durationHours && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
                                      {item.durationHours} hrs
                                    </span>
                                  )}
                                  {item.deliveryMode && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
                                      {item.deliveryMode}
                                    </span>
                                  )}
                                  {item.registrationNo && (
                                    <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md">
                                      REG: {item.registrationNo}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Link href={`/centers/${item.institution.id}`} className="shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                              <Button
                                size="sm"
                                className="w-full lg:w-auto h-9 rounded-xl gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 px-4"
                              >
                                View Center
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6 shadow-inner">
                          <Building2 className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Training Centers</h3>
                        <p className="text-muted-foreground max-w-sm">We couldn't find any registered institutions currently offering this specific training program.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Assessment Centers Content */}
                  <TabsContent value="assessment" className="flex-1 overflow-y-auto scroll-smooth mt-6 pr-2 min-h-0 w-full min-w-0 space-y-4">
                    {isLoadingCenters ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/40">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))
                    ) : assessmentCenters.length > 0 ? (
                      <div className="grid gap-4 w-full">
                        {assessmentCenters.map((item, i) => (
                          <div
                            key={item.accreditationId}
                            className="group/item relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 p-5 rounded-2xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md w-full min-w-0"
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
                              </div>
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-base text-foreground group-hover/item:text-primary transition-colors truncate">
                                    {item.center.name}
                                  </h4>
                                  {item.status && (
                                    <Badge
                                      className={`text-[10px] uppercase tracking-wider font-bold py-0.5 px-2.5 rounded-full border ${item.status.toLowerCase() === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-destructive/10 text-destructive border-destructive/20'
                                        }`}
                                    >
                                      {item.status}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-primary/60 shrink-0" strokeWidth={1.5} />
                                  <span className="truncate">
                                    {[item.center.address, item.center.province, item.center.region]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </p>
                                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 mt-1 border-t border-border/40 text-xs text-muted-foreground/90 font-medium">
                                  {item.accreditationNumber && (
                                    <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-md">
                                      ACCRED: {item.accreditationNumber}
                                    </span>
                                  )}
                                  {item.validUntil && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <ShieldCheck className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
                                      Valid until {new Date(item.validUntil).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Link href={`/assessment-centers/${item.center.id}`} className="shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                              <Button
                                size="sm"
                                className="w-full lg:w-auto h-9 rounded-xl gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 px-4"
                              >
                                View Center
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6 shadow-inner">
                          <ShieldCheck className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Assessment Centers</h3>
                        <p className="text-muted-foreground max-w-sm">We couldn't find any accredited assessment centers for this qualification currently.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
