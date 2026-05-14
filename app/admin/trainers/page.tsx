'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Trash2, Edit2, Plus, Search, Users, Award, Building2, Briefcase, Filter, ChevronRight, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [filteredTrainers, setFilteredTrainers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchTrainers() }, [])

  useEffect(() => {
    let result = trainers
    if (selectedSpec !== 'all') result = result.filter(t => t.specialization === selectedSpec)
    if (selectedType !== 'all') result = result.filter(t => t.employment_type === selectedType)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.full_name?.toLowerCase().includes(q) || t.specialization?.toLowerCase().includes(q) ||
        t.nttc_no?.toLowerCase().includes(q) || t.institutions?.name?.toLowerCase().includes(q)
      )
    }
    setFilteredTrainers(result)
    setCurrentPage(1)
  }, [searchQuery, selectedSpec, selectedType, trainers])

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage)
  const paginatedTrainers = filteredTrainers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const specializations = Array.from(new Set(trainers.map(t => t.specialization).filter(Boolean))).sort()

  // Stats
  const regularCount = trainers.filter(t => t.employment_type === 'Regular').length
  const onCallCount = trainers.filter(t => t.employment_type !== 'Regular').length

  async function fetchTrainers() {
    try {
      const { data, error } = await supabase.from('trainers').select('*, institutions(name)').order('created_at', { ascending: false })
      if (error) throw error
      setTrainers(data || [])
      setFilteredTrainers(data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  async function deleteTrainer(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this trainer?')) return
    try {
      const { error } = await supabase.from('trainers').delete().eq('id', id)
      if (error) throw error
      await fetchTrainers()
      toast.success('Trainer deleted')
    } catch { toast.error('Failed to delete trainer') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Trainers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Trainers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTrainers.length} of {trainers.length} trainers
              <span className="hidden sm:inline text-muted-foreground/60"> • {regularCount} regular, {onCallCount} on-call</span>
            </p>
          </div>
          <Link href="/admin/trainers/new">
            <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> Add Trainer
            </Button>
          </Link>
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
              placeholder="Search by name, specialization, NTTC, institution..."
              className="pl-11 pr-4 py-6 bg-white dark:bg-card border-border/50 shadow-sm rounded-2xl focus-visible:ring-primary/20 text-base w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-2xl border border-border/50 shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground ml-1" />
              <Select value={selectedSpec} onValueChange={setSelectedSpec}>
                <SelectTrigger className="w-[180px] bg-transparent border-0 focus:ring-0 shadow-none font-medium text-sm">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map(s => <SelectItem key={s as string} value={s as string}>{s as string}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-2xl border border-border/50 shadow-sm">
              <Users className="w-4 h-4 text-muted-foreground ml-1" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px] bg-transparent border-0 focus:ring-0 shadow-none font-medium text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="On call">On Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredTrainers.length > 0 ? (
          <>
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase bg-secondary/50 text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Trainer</th>
                      <th className="px-6 py-4">Employment</th>
                      <th className="px-6 py-4">Specialization</th>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4">NTTC</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedTrainers.map((trainer) => {
                      const isRegular = trainer.employment_type === 'Regular'
                      const nttcExpired = trainer.nttc_validity && new Date(trainer.nttc_validity) < new Date()
                      
                      return (
                        <tr 
                          key={trainer.id} 
                          className="hover:bg-violet-50/50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors group"
                          onClick={() => router.push(`/admin/trainers/${trainer.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${isRegular ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                                {trainer.full_name?.charAt(0) || 'T'}
                              </div>
                              <div className="max-w-[200px] sm:max-w-[250px]">
                                <p className="font-bold text-foreground truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{trainer.full_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isRegular ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                              {trainer.employment_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <p className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 shrink-0 text-violet-500/50" /> {trainer.specialization}</p>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {trainer.institutions ? (
                              <p className="flex items-center gap-1.5 truncate max-w-[200px]"><Building2 className="w-4 h-4 shrink-0 text-emerald-500/50" /> {trainer.institutions.name}</p>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {trainer.nttc_no ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-amber-600">{trainer.nttc_no}</span>
                                {nttcExpired && <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">EXPIRED</span>}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <Link href={`/admin/trainers/${trainer.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 rounded-lg">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg" onClick={(e) => deleteTrainer(trainer.id, e)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
            <h3 className="text-lg font-bold text-foreground">No trainers found</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {searchQuery ? "No matches for your search." : "No trainers have been registered yet."}
            </p>
            {!searchQuery && (
              <Link href="/admin/trainers/new">
                <Button className="mt-6 gap-2 rounded-full shadow-md"><Plus className="w-4 h-4" /> Register First Trainer</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
