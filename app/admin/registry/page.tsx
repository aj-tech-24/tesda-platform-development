'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Building2, MapPin, Phone, Mail, Facebook, BookOpen, Clock, Tag, Calendar, User, FileText, CheckCircle2, AlertTriangle, XCircle, Filter, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Helper to determine status
function getExpiryStatus(dateStr: string | null) {
  if (!dateStr) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: HelpCircle }

  const expiry = new Date(dateStr)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: XCircle }
  } else if (diffDays <= 30) {
    return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: AlertTriangle }
  } else {
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle2 }
  }
}

function RegistryContent() {
  const [records, setRecords] = useState<any[]>([])
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const searchQuery = searchParams.get('q') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')
  const itemsPerPage = 30

  const updateURL = (query: string, page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    params.set('page', page.toString())
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    fetchRegistry()
  }, [])

  async function fetchRegistry() {
    try {
      const { data, error } = await supabase
        .from('registry_view')
        .select('*')

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching registry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter records based on global search
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records
    const lowerQuery = searchQuery.toLowerCase()
    return records.filter(r =>
      r.institution_name?.toLowerCase().includes(lowerQuery) ||
      r.program_name?.toLowerCase().includes(lowerQuery) ||
      r.trainers_list?.toLowerCase().includes(lowerQuery) ||
      r.province?.toLowerCase().includes(lowerQuery) ||
      r.registration_no?.toLowerCase().includes(lowerQuery)
    )
  }, [records, searchQuery])

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading Command Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  Global Registry
                </h1>
                <p className="text-sm text-muted-foreground">Unified search across institutions, programs, and trainers.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Search SMAW, Bulacan, Juan..."
                  className="pl-9 pr-4 py-2 bg-secondary/50 border-transparent focus-visible:ring-primary/20 rounded-full"
                  defaultValue={searchQuery}
                  onChange={(e) => {
                    updateURL(e.target.value, 1)
                  }}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Smart Table */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col">
        <div className="bg-white dark:bg-card border border-border/50 shadow-sm rounded-2xl flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Institution</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Province</th>
                  <th className="px-6 py-4 font-semibold">Trainer(s)</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => {
                    const statusInfo = getExpiryStatus(record.expiration_date)
                    const StatusIcon = statusInfo.icon

                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-primary/5 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors max-w-[250px] truncate" title={record.institution_name}>
                            {record.institution_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium max-w-[200px] truncate" title={record.program_name}>
                            {record.program_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {record.province || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-muted-foreground max-w-[200px] truncate" title={record.trainers_list || 'No trainers'}>
                            {record.trainers_list || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {record.expiration_date ? new Date(record.expiration_date).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Search className="w-8 h-8 text-muted-foreground/50" />
                        <p>No records found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40 flex items-center justify-between bg-white dark:bg-card shrink-0">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} entries
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURL(searchQuery, Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full px-4"
                >
                  Previous
                </Button>
                <div className="text-sm font-medium px-2 text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURL(searchQuery, Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      <Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <SheetContent className="w-full sm:max-w-md lg:max-w-lg overflow-y-auto border-l border-border/50 p-0">
          {selectedRecord && (
            <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-background">
              {/* Header */}
              <div className="p-6 pb-4 bg-white dark:bg-card border-b border-border/50 sticky top-0 z-10">
                <SheetHeader className="text-left space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Registry Record</Badge>
                    {(() => {
                      const st = getExpiryStatus(selectedRecord.expiration_date)
                      const Icon = st.icon
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {st.label}
                        </span>
                      )
                    })()}
                  </div>
                  <SheetTitle className="text-2xl font-bold leading-tight">{selectedRecord.program_name}</SheetTitle>
                  <SheetDescription className="text-base font-medium flex items-center gap-1.5 pt-1">
                    <Building2 className="w-4 h-4 shrink-0" />
                    {selectedRecord.institution_name}
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-8 flex-1">

                {/* Program Info */}
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Program Info
                  </h3>
                  <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border/50 shadow-sm grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Qualification Level</p>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-muted-foreground" /> {selectedRecord.qualification_level || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Duration</p>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {selectedRecord.duration_hours ? `${selectedRecord.duration_hours} hours` : '-'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Registration No.</p>
                      <p className="text-sm font-semibold font-mono bg-secondary/50 inline-block px-2 py-0.5 rounded text-foreground">{selectedRecord.registration_no || 'Not Set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Date Issued</p>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {selectedRecord.date_issued ? new Date(selectedRecord.date_issued).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Expiration Date</p>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {selectedRecord.expiration_date ? new Date(selectedRecord.expiration_date).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                </section>

                {/* Institution Info */}
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Institution Info
                  </h3>
                  <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border/50 shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Location</p>
                        <p className="text-sm font-medium">{selectedRecord.address || '-'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedRecord.municipality}{selectedRecord.province ? `, ${selectedRecord.province}` : ''}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Head Name</p>
                        <p className="text-sm font-semibold">{selectedRecord.head_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact No.</p>
                        <p className="text-sm font-semibold">{selectedRecord.contact_no || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</p>
                        <p className="text-sm font-semibold break-all">{selectedRecord.contact_email || '-'}</p>
                      </div>
                      {selectedRecord.fb_account && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" /> FB Account</p>
                          <a href={selectedRecord.fb_account} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline break-all">{selectedRecord.fb_account}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Trainer Info */}
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Trainers
                  </h3>
                  <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
                    {selectedRecord.trainers_list ? (
                      <ul className="space-y-2">
                        {selectedRecord.trainers_list.split(', ').map((trainer: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-medium bg-secondary/30 px-3 py-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                            {trainer}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">No trainers assigned to this institution.</p>
                    )}
                  </div>
                </section>

              </div>

              {/* Footer */}
              <div className="p-4 bg-white dark:bg-card border-t border-border/50 sticky bottom-0 z-10 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default function RegistryPage() { return <Suspense fallback={<div>Loading...</div>}><RegistryContent /></Suspense> }
