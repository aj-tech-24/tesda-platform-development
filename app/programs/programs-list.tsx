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

  useEffect(() => {
    setSearchTerm(initialSearchTerm)
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [initialSearchTerm])

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
        // 1. Fetch training centers offering this program title
        const { data: trainingData, error: trainingError } = await supabase
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
          .eq('title', selectedProgram.title)

        // 2. Fetch assessment centers accredited for this program title
        const { data: assessmentData, error: assessmentError } = await supabase
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

        if (trainingError) console.error('Error fetching training centers:', trainingError)
        if (assessmentError) console.error('Error fetching assessment centers:', assessmentError)

        // Filter out null relations
        const parsedTraining = (trainingData || [])
          .map((p: any) => ({
            programId: p.id,
            registrationNo: p.registration_no,
            dateIssued: p.date_issued,
            expirationDate: p.expiration_date,
            deliveryMode: p.delivery_mode,
            durationHours: p.duration_hours,
            qualificationLevel: p.qualification_level,
            institution: p.institutions,
          }))
          .filter((item: any) => item.institution !== null)

        const parsedAssessment = (assessmentData || [])
          .map((a: any) => ({
            accreditationId: a.id,
            accreditationNumber: a.accreditation_number,
            dateAccredited: a.date_accredited,
            validUntil: a.valid_until,
            status: a.status,
            center: a.assessment_centers,
          }))
          .filter((item: any) => item.center !== null)

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
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isSearchFocused ? 'text-primary' : 'text-muted-foreground'
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
          {filteredPrograms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program, index) => {
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

                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 pt-1">
                          {program.title}
                        </h3>

                        {program.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {program.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-border/50">
                        {program.qualification_level && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} /> Level:
                            </span>
                            <span className="font-semibold text-foreground">{program.qualification_level}</span>
                          </div>
                        )}
                        {program.duration_hours && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} /> Max Duration:
                            </span>
                            <span className="font-semibold text-foreground">{program.duration_hours} hours</span>
                          </div>
                        )}
                        {program.delivery_mode && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} /> Delivery Mode:
                            </span>
                            <span className="font-semibold text-foreground">{program.delivery_mode}</span>
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
                <Search className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-muted-foreground mb-2 font-medium">No programs found</p>
              <p className="text-sm text-muted-foreground/70 mb-6">Try adjusting your search terms</p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="rounded-full active:scale-[0.98] transition-transform cursor-pointer"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Program Details Modal */}
      <Dialog open={selectedProgram !== null} onOpenChange={(open) => { if (!open) setSelectedProgram(null) }}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl bg-background/95 backdrop-blur-md">
          {selectedProgram && (
            <>
              <DialogHeader className="text-left shrink-0 pr-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {(() => {
                      const Icon = getProgramIcon(selectedProgram.title)
                      return <Icon className="w-5.5 h-5.5" strokeWidth={1.5} />
                    })()}
                  </div>
                  {selectedProgram.qualification_level && (
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-xs font-semibold px-2 py-0.5">
                      {selectedProgram.qualification_level}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                  {selectedProgram.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed max-h-[80px] overflow-y-auto pr-1">
                  {selectedProgram.description || 'No description available for this training program.'}
                </DialogDescription>
              </DialogHeader>

              {/* Tabs Content */}
              <div className="flex-1 overflow-hidden flex flex-col mt-4 min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid grid-cols-2 w-full p-1 bg-muted/50 rounded-xl shrink-0">
                    <TabsTrigger value="training" className="rounded-lg py-2">
                      <School className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Training Centers ({isLoadingCenters ? '...' : trainingCenters.length})
                    </TabsTrigger>
                    <TabsTrigger value="assessment" className="rounded-lg py-2">
                      <Award className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Assessment Centers ({isLoadingCenters ? '...' : assessmentCenters.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Training Centers Content */}
                  <TabsContent value="training" className="flex-1 overflow-y-auto mt-4 pr-1 min-h-0">
                    {isLoadingCenters ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                    ) : trainingCenters.length > 0 ? (
                      <div className="space-y-3.5">
                        {trainingCenters.map((item, i) => (
                          <div
                            key={item.programId}
                            className="group/item relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-sm text-foreground group-hover/item:text-primary transition-colors truncate">
                                  {item.institution.name}
                                </h4>
                                {item.institution.institution_type && (
                                  <Badge className="bg-primary/5 text-primary border-primary/5 text-[9px] uppercase tracking-wider font-bold py-0 px-2 rounded-full">
                                    {item.institution.institution_type}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" strokeWidth={1.5} />
                                <span className="truncate">
                                  {[item.institution.address, item.institution.municipality, item.institution.province]
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[11px] text-muted-foreground/90 border-t border-border/30">
                                {item.durationHours && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary/70" strokeWidth={1.5} />
                                    {item.durationHours} hrs
                                  </span>
                                )}
                                {item.deliveryMode && (
                                  <span className="inline-flex items-center gap-1 uppercase font-semibold text-[10px] text-primary/80">
                                    {item.deliveryMode}
                                  </span>
                                )}
                                {item.registrationNo && (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    Reg: {item.registrationNo}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link href={`/centers/${item.institution.id}`} className="shrink-0 self-end sm:self-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8.5 rounded-xl gap-1 hover:bg-primary hover:text-white transition-all cursor-pointer border-border/80 hover:border-primary text-xs pr-2 pl-3 active:scale-95"
                              >
                                View Profile
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60">
                          <Building2 className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">No offering training centers found</p>
                        <p className="text-xs text-muted-foreground/75">There are no registered schools currently offering this training curriculum.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Assessment Centers Content */}
                  <TabsContent value="assessment" className="flex-1 overflow-y-auto mt-4 pr-1 min-h-0">
                    {isLoadingCenters ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                    ) : assessmentCenters.length > 0 ? (
                      <div className="space-y-3.5">
                        {assessmentCenters.map((item, i) => (
                          <div
                            key={item.accreditationId}
                            className="group/item relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-foreground group-hover/item:text-primary transition-colors truncate">
                                  {item.center.name}
                                </h4>
                                {item.status && (
                                  <Badge
                                    className={`text-[9px] uppercase tracking-wider font-bold py-0 px-2 rounded-full border ${
                                      item.status.toLowerCase() === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-destructive/10 text-destructive border-destructive/20'
                                    }`}
                                  >
                                    {item.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" strokeWidth={1.5} />
                                <span className="truncate">
                                  {[item.center.address, item.center.province, item.center.region]
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[11px] text-muted-foreground/90 border-t border-border/30">
                                {item.accreditationNumber && (
                                  <span className="font-mono text-[10px]">Accred: {item.accreditationNumber}</span>
                                )}
                                {item.validUntil && (
                                  <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
                                    Valid until: {new Date(item.validUntil).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link href={`/assessment-centers/${item.center.id}`} className="shrink-0 self-end sm:self-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8.5 rounded-xl gap-1 hover:bg-primary hover:text-white transition-all cursor-pointer border-border/80 hover:border-primary text-xs pr-2 pl-3 active:scale-95"
                              >
                                View Profile
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60">
                          <Award className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">No accredited assessment centers found</p>
                        <p className="text-xs text-muted-foreground/75 font-normal">There are no assessment centers currently accredited for this qualification.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
