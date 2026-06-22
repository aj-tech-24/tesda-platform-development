'use client'

import { useState } from 'react'
import { BadgeCheck, Search, ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react'

interface Accreditation {
  id: string
  qualification_title: string
  accreditation_number: string | null
  date_accredited: string | null
  valid_until: string | null
  status: string | null
}

interface AccreditationsListClientProps {
  initialAccreditations: Accreditation[]
}

export default function AccreditationsListClient({ initialAccreditations }: AccreditationsListClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Parse and pre-filter only active/expiring accreditations
  const activeAccreditations = initialAccreditations
    .map(a => {
      const isExpired = a.valid_until ? new Date(a.valid_until) < new Date() : false
      const isExpiring = a.valid_until && !isExpired 
        ? (new Date(a.valid_until).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000 
        : false

      let derivedStatus = a.status || 'Active'
      if (isExpired) derivedStatus = 'Expired'
      else if (isExpiring) derivedStatus = 'Expiring'

      return {
        ...a,
        isExpired,
        isExpiring,
        derivedStatus
      }
    })
    .filter(a => a.derivedStatus === 'Active' || a.derivedStatus === 'Expiring')

  // Filter based on search term
  const filtered = activeAccreditations.filter(a => {
    return !searchTerm || a.qualification_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.accreditation_number && a.accreditation_number.toLowerCase().includes(searchTerm.toLowerCase()))
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
          placeholder="Search qualification or accreditation no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border/80 bg-background/90 hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-background outline-none transition-all"
        />
      </div>

      {/* Accreditations List Grid */}
      <div className="space-y-3 overflow-y-auto max-h-[500px] lg:max-h-none lg:flex-1 lg:min-h-0 pr-1.5 -mr-1.5 scrollbar-thin">
        {filtered.length ? (
          filtered.map((a, i) => (
            <div 
              key={a.id || i} 
              className={`rounded-xl border bg-background/60 px-4 py-3.5 space-y-2 transition-all hover:border-primary/20 ${
                a.derivedStatus === 'Expiring'
                  ? 'border-amber-500/15 hover:border-amber-500/30'
                  : 'border-border/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <BadgeCheck 
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      a.derivedStatus === 'Expiring' ? 'text-amber-500' : 'text-primary'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{a.qualification_title || 'Unknown Qualification'}</p>
                    {a.accreditation_number && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">Accreditation No. {a.accreditation_number}</p>
                    )}
                  </div>
                </div>

                {/* Status Badge (rendered only if Expiring Soon for visibility) */}
                {a.derivedStatus === 'Expiring' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 bg-amber-500/5 text-amber-600 border-amber-500/15">
                    Expiring Soon
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                {a.date_accredited && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    Accredited: {new Date(a.date_accredited).toLocaleDateString()}
                  </span>
                )}
                {a.valid_until && (
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    a.derivedStatus === 'Expiring' ? 'text-amber-600 font-semibold' : ''
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Valid until: {new Date(a.valid_until).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-muted/20 border border-dashed border-border/60 rounded-xl space-y-2">
            <AlertCircle className="w-8 h-8 text-muted-foreground/35 mx-auto" strokeWidth={1.5} />
            <p className="text-muted-foreground font-medium text-xs">No active qualifications found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
