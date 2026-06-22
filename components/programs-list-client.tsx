'use client'

import { useState } from 'react'
import { BadgeCheck, Clock, BookOpen, Search, ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react'

interface Program {
  id: string
  title: string
  registration_no: string | null
  duration_hours: number | null
  delivery_mode: string | null
  qualification_level: string | null
  date_issued: string | null
  expiration_date: string | null
}

interface ProgramsListClientProps {
  initialPrograms: Program[]
}

export default function ProgramsListClient({ initialPrograms }: ProgramsListClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Process and pre-filter only active/expiring programs
  const activePrograms = initialPrograms
    .map(p => {
      const isExpired = p.expiration_date ? new Date(p.expiration_date) < new Date() : false
      const isExpiring = p.expiration_date && !isExpired
        ? (new Date(p.expiration_date).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000
        : false

      let derivedStatus: 'Active' | 'Expiring' | 'Expired' = 'Active'
      if (isExpired) derivedStatus = 'Expired'
      else if (isExpiring) derivedStatus = 'Expiring'

      return {
        ...p,
        isExpired,
        isExpiring,
        derivedStatus
      }
    })
    .filter(p => p.derivedStatus === 'Active' || p.derivedStatus === 'Expiring')

  // Filter based on search term
  const filtered = activePrograms.filter(p => {
    return !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.registration_no && p.registration_no.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  return (
    <div className="space-y-4 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:space-y-0">
      {/* Search Input Box */}
      <div className="relative pt-2 shrink-0 lg:pb-3">
        <Search 
          className={`absolute left-3 top-[55%] -translate-y-1/2 w-4 h-4 transition-colors ${
            isSearchFocused ? 'text-primary' : 'text-muted-foreground'
          }`} 
          strokeWidth={1.5} 
        />
        <input
          placeholder="Search programs by title or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-background outline-none transition-all"
        />
      </div>

      {/* Programs List */}
      <div className="space-y-3 overflow-y-auto max-h-[500px] lg:max-h-none lg:flex-1 lg:min-h-0 pr-1.5 -mr-1.5 scrollbar-thin">
        {filtered.length ? (
          filtered.map((program, i) => (
            <div 
              key={program.id || i} 
              className={`rounded-xl border bg-background/60 px-4 py-3.5 space-y-2 transition-all hover:border-primary/20 ${
                program.derivedStatus === 'Expiring'
                  ? 'border-amber-500/15 hover:border-amber-500/30'
                  : 'border-border/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <BadgeCheck 
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      program.derivedStatus === 'Expiring' ? 'text-amber-500' : 'text-primary'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground leading-snug">{program.title || 'Unknown Program'}</p>
                    {program.registration_no && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">Registration No. {program.registration_no}</p>
                    )}
                  </div>
                </div>

                {/* Warning badge (only show Expiring Soon status badge for visibility) */}
                {program.derivedStatus === 'Expiring' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 bg-amber-500/5 text-amber-600 border-amber-500/15">
                    Expiring Soon
                  </span>
                )}
              </div>

              {/* Badges and Details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground pt-1.5 border-t border-border/30">
                {program.duration_hours && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    {program.duration_hours} hours
                  </span>
                )}
                {program.delivery_mode && (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    {program.delivery_mode}
                  </span>
                )}
                {program.qualification_level && (
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {program.qualification_level}
                  </span>
                )}
                {program.date_issued && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    Issued: {new Date(program.date_issued).toLocaleDateString()}
                  </span>
                )}
                {program.expiration_date && (
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    program.derivedStatus === 'Expiring' ? 'text-amber-600 font-semibold' : ''
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Expires: {new Date(program.expiration_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-muted/20 border border-dashed border-border/60 rounded-xl space-y-2">
            <AlertCircle className="w-8 h-8 text-muted-foreground/35 mx-auto" strokeWidth={1.5} />
            <p className="text-muted-foreground font-medium text-xs">No active programs found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
