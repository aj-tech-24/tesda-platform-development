'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Trash2, Edit2, Plus, Search, BookOpen, Clock, BarChart, FileText, Building2, ExternalLink, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminProgramsPage() {
  const [groupedPrograms, setGroupedPrograms] = useState<any[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    let result = groupedPrograms;

    if (selectedLevel !== 'all') {
      result = result.filter(p => p.qualification_level === selectedLevel)
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.qualification_level?.toLowerCase().includes(lowerQuery)
      )
    }

    setFilteredPrograms(result)
    setCurrentPage(1)
  }, [searchQuery, selectedLevel, groupedPrograms])

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage)
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const qualificationLevels = Array.from(new Set(groupedPrograms.map(p => p.qualification_level).filter(Boolean))).sort()

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.is_admin !== true) {
        router.push('/admin/login')
        return
      }
      setUser(user)
      await fetchPrograms()
    } catch (error) {
      router.push('/admin/login')
    }
  }

  async function fetchPrograms() {
    try {
      // Fetch programs WITH their associated institutions
      const { data, error } = await supabase
        .from('programs')
        .select('*, institutions(id, name, province)')
        .order('created_at', { ascending: false })
        
      if (error) throw error

      // Group them by Title
      const grouped = (data || []).reduce((acc: any, curr: any) => {
        const title = curr.title?.trim() || 'Untitled Program'
        const key = title.toUpperCase()
        if (!acc[key]) {
          acc[key] = {
            id: curr.id, // Representative ID
            title: title,
            qualification_level: curr.qualification_level || 'N/A',
            duration_hours: curr.duration_hours,
            description: curr.description,
            instances: [] // Hold all specific records here
          }
        }
        acc[key].instances.push(curr)
        return acc
      }, {})

      // Convert to array and sort alphabetically
      const sortedArray = Object.values(grouped).sort((a: any, b: any) => a.title.localeCompare(b.title))
      
      setGroupedPrograms(sortedArray)
      setFilteredPrograms(sortedArray)
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProgramInstance(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this specific program registration?')) return

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id)
      if (error) throw error
      
      await fetchPrograms()
      setSelectedProgram(null) // Close modal as data changed
    } catch (error) {
      console.error('Error deleting program:', error)
      alert('Failed to delete program')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading Programs Directory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm">
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
                  <BookOpen className="w-6 h-6 text-primary" />
                  Program Directory
                </h1>
                <p className="text-sm text-muted-foreground">Master list of all distinct programs and their accredited institutions.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/admin/programs/new">
                <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                  <Plus className="w-4 h-4" />
                  Add New Program
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toolbar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search distinct programs by title or level..."
              className="pl-11 pr-4 py-6 bg-white dark:bg-card border-border/50 shadow-sm rounded-2xl focus-visible:ring-primary/20 text-base w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-2xl border border-border/50 shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground ml-2" />
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-[180px] bg-transparent border-0 focus:ring-0 shadow-none font-medium">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {qualificationLevels.map(l => <SelectItem key={l as string} value={l as string}>{l as string}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredPrograms.length > 0 ? (
          <>
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase bg-secondary/50 text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Program Title</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4 text-center">Institutions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedPrograms.map((programGroup) => (
                      <tr 
                        key={programGroup.title} 
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group"
                        onClick={() => setSelectedProgram(programGroup)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/50 shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="max-w-[300px] sm:max-w-[400px]">
                              <p className="font-bold text-foreground truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{programGroup.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <BarChart className="w-3.5 h-3.5" />
                            {programGroup.qualification_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {programGroup.duration_hours ? (
                            <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" />
                              {programGroup.duration_hours}h
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            {programGroup.instances.length} Institution{programGroup.instances.length > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded-full px-6"
                >
                  Previous
                </Button>
                <div className="text-sm font-semibold text-muted-foreground bg-white dark:bg-card px-4 py-1.5 rounded-full border shadow-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="rounded-full px-6"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No programs found</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {searchQuery ? "We couldn't find any grouped programs matching your search." : "No training programs imported yet."}
            </p>
          </div>
        )}
      </div>

      {/* Program Details & Institutions Modal */}
      <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
        <DialogContent aria-describedby="dialog-description" className="max-w-4xl sm:rounded-3xl p-0 overflow-hidden bg-[#f8fafc] dark:bg-background">
          <DialogTitle className="sr-only">Program Details Modal</DialogTitle>
          <DialogDescription id="dialog-description" className="sr-only">
            Details and list of institutions offering this program.
          </DialogDescription>
          {selectedProgram && (
            <div className="flex flex-col max-h-[85vh]">
              {/* Modal Header Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-primary to-blue-900 p-8 text-white relative shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-black tracking-tight mb-4">{selectedProgram.title}</h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/20 border border-white/20 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                      <BarChart className="w-4 h-4" /> Level: {selectedProgram.qualification_level}
                    </span>
                    {selectedProgram.duration_hours && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/20 border border-white/20 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                        <Clock className="w-4 h-4" /> {selectedProgram.duration_hours} hours
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Offered by {selectedProgram.instances.length} Institution{selectedProgram.instances.length > 1 ? 's' : ''}
                  </h3>
                </div>

                <div className="grid gap-4">
                  {selectedProgram.instances.map((instance: any) => (
                    <Card key={instance.id} className="border-border/50 shadow-sm bg-white dark:bg-card">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-lg mb-1">{instance.institutions?.name || 'Unknown Institution'}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {instance.institutions?.province && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {instance.institutions.province}
                              </span>
                            )}
                            {instance.registration_no && (
                              <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-foreground">
                                Reg: {instance.registration_no}
                              </span>
                            )}
                            {instance.expiration_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Expires: {new Date(instance.expiration_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions for specific instance */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/admin/centers/${instance.institutions?.id}`}>
                            <Button variant="outline" size="sm" className="gap-2 bg-secondary/50">
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Center
                            </Button>
                          </Link>
                          <Link href={`/admin/programs/${instance.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={(e) => deleteProgramInstance(instance.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 bg-white dark:bg-card border-t border-border/40 shrink-0 flex justify-end">
                <Button onClick={() => setSelectedProgram(null)} className="rounded-full px-8">
                  Close Directory
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
