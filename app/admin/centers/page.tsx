'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Trash2, Edit2, Plus, Search, Building2, MapPin, Mail, Phone, Filter, ChevronRight, BookOpen, Users, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<any[]>([])
  const [filteredCenters, setFilteredCenters] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [programCounts, setProgramCounts] = useState<Record<string, number>>({})
  const [trainerCounts, setTrainerCounts] = useState<Record<string, number>>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    let result = centers
    if (selectedType !== 'all') result = result.filter(c => c.institution_type === selectedType)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q) || c.province?.toLowerCase().includes(q) ||
        c.institution_type?.toLowerCase().includes(q) || c.sector?.toLowerCase().includes(q) ||
        c.head_name?.toLowerCase().includes(q)
      )
    }
    setFilteredCenters(result)
    setCurrentPage(1)
  }, [searchQuery, selectedType, centers])

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage)
  const paginatedCenters = filteredCenters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const institutionTypes = Array.from(new Set(centers.map(c => c.institution_type).filter(Boolean))).sort()

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.is_admin !== true) { router.push('/admin/login'); return }
      setUser(user)
      await fetchCenters()
    } catch { router.push('/admin/login') }
  }

  async function fetchCenters() {
    try {
      const { data, error } = await supabase.from('institutions').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setCenters(data || [])
      setFilteredCenters(data || [])

      // Fetch program counts per institution
      const { data: progs } = await supabase.from('programs').select('institution_id')
      const pc: Record<string, number> = {}
        ; (progs || []).forEach((p: any) => { pc[p.institution_id] = (pc[p.institution_id] || 0) + 1 })
      setProgramCounts(pc)

      // Fetch trainer counts per institution
      const { data: trns } = await supabase.from('trainers').select('institution_id')
      const tc: Record<string, number> = {}
        ; (trns || []).forEach((t: any) => { tc[t.institution_id] = (tc[t.institution_id] || 0) + 1 })
      setTrainerCounts(tc)
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  async function deleteCenter(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this institution?')) return
    try {
      const { error } = await supabase.from('institutions').delete().eq('id', id)
      if (error) throw error
      await fetchCenters()
    } catch { alert('Failed to delete') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Institutions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  Institutions
                </h1>
                <p className="text-sm text-muted-foreground">{filteredCenters.length} of {centers.length} institutions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/admin/centers/new">
                <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                  <Plus className="w-4 h-4" /> Add Institution
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, address, head, sector..."
              className="pl-11 pr-4 py-6 bg-white dark:bg-card border-border/50 shadow-sm rounded-2xl focus-visible:ring-primary/20 text-base w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-2xl border border-border/50 shadow-sm">
              <Layers className="w-4 h-4 text-muted-foreground ml-1" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px] bg-transparent border-0 focus:ring-0 shadow-none font-medium text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {institutionTypes.map(t => <SelectItem key={t as string} value={t as string}>{t as string}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredCenters.length > 0 ? (
          <>
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase bg-secondary/50 text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-center">Programs</th>
                      <th className="px-6 py-4 text-center">Trainers</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedCenters.map((center) => (
                      <tr
                        key={center.id}
                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors group"
                        onClick={() => router.push(`/admin/centers/${center.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 overflow-hidden relative">
                              {center.logo_url ? (
                                <img src={center.logo_url} alt={center.name} className="w-full h-full object-cover" />
                              ) : (
                                center.name?.charAt(0) || 'I'
                              )}
                            </div>
                            <div className="max-w-[250px] sm:max-w-[300px]">
                              <p className="font-bold text-foreground truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{center.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {center.institution_type ? (
                            <span className="inline-flex text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                              {center.institution_type}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {center.province ? (
                            <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0 text-emerald-500/50" /> {center.province}</p>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] gap-1 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                            {programCounts[center.id] || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] gap-1 text-xs font-semibold text-violet-700 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-lg">
                            {trainerCounts[center.id] || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/admin/centers/${center.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg" onClick={(e) => deleteCenter(center.id, e)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="rounded-full px-6">Previous</Button>
                <div className="text-sm font-semibold text-muted-foreground bg-white dark:bg-card px-4 py-1.5 rounded-full border shadow-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="rounded-full px-6">Next</Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No institutions found</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {searchQuery ? "No matches for your search." : "No institutions have been added yet."}
            </p>
            {!searchQuery && (
              <Link href="/admin/centers/new">
                <Button className="mt-6 gap-2 rounded-full shadow-md"><Plus className="w-4 h-4" /> Add First Institution</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
