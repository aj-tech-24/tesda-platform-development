'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Users, Briefcase, Award, Clock, History, Edit2, Building2, MapPin, Calendar, Shield, Phone, Mail, BookOpen, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminTrainerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [trainer, setTrainer] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [assignedPrograms, setAssignedPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    try {
      const { data: trainerData } = await supabase
        .from('trainers').select('*, institutions(name, province, address)').eq('id', id).single()
      if (!trainerData) { router.push('/admin/trainers'); return }
      setTrainer(trainerData)

      const { data: histData } = await supabase
        .from('trainer_history').select('*, institutions(name)').eq('trainer_id', id).order('created_at', { ascending: false })
      setHistory(histData || [])

      // Get assigned programs via junction table
      const { data: tpData } = await supabase
        .from('trainer_programs').select('*, programs(title, qualification_level, duration_hours)').eq('trainer_id', id)
      setAssignedPrograms(tpData || [])

    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  // NTTC validity status
  const nttcExpired = trainer?.nttc_validity && new Date(trainer.nttc_validity) < new Date()
  const nttcExpiring = trainer?.nttc_validity && !nttcExpired && (new Date(trainer.nttc_validity).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Trainer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Hero Header */}
      <div className={`text-white relative overflow-hidden ${trainer?.employment_type === 'Regular' ? 'bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900' : 'bg-gradient-to-br from-amber-700 via-amber-800 to-orange-900'}`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link href="/admin/trainers">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-full">
                <ArrowLeft className="w-4 h-4" /> Back to Trainers
              </Button>
            </Link>
            {trainer?.id && (
              <Link href={`/admin/trainers/${trainer.id}/edit`}>
                <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1.5 rounded-full backdrop-blur-sm">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Trainer
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex items-start gap-5 flex-1">
              {/* Avatar */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border-2 border-white/20 shrink-0 ${trainer?.employment_type === 'Regular' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                {trainer?.full_name?.charAt(0) || 'T'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider border ${trainer?.employment_type === 'Regular' ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border-amber-400/30'}`}>
                    {trainer?.employment_type}
                  </span>
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider border ${trainer?.status === 'Active' ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' : 'bg-red-400/20 text-red-200 border-red-400/30'}`}>
                    {trainer?.status}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-tight">{trainer?.full_name}</h1>
                <p className="text-sm text-white/70 flex items-center gap-1.5 mt-1.5">
                  <Briefcase className="w-4 h-4" /> {trainer?.specialization}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[90px]">
                <p className="text-2xl font-black">{assignedPrograms.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/70">Programs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[90px]">
                <p className="text-2xl font-black">{history.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/70">History</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NTTC Card */}
          <Card className={`border shadow-sm bg-white dark:bg-card ${nttcExpired ? 'border-red-200 dark:border-red-800/30' : nttcExpiring ? 'border-amber-200 dark:border-amber-800/30' : 'border-border/50'}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${nttcExpired ? 'bg-red-50 dark:bg-red-950/30' : nttcExpiring ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                  <Award className={`w-4.5 h-4.5 ${nttcExpired ? 'text-red-600' : nttcExpiring ? 'text-amber-600' : 'text-amber-600'}`} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">NTTC Number</span>
              </div>
              <p className="text-lg font-black text-foreground">{trainer?.nttc_no || 'Not provided'}</p>
              {nttcExpired && <p className="text-[10px] text-red-600 font-bold mt-1">⚠ EXPIRED</p>}
              {nttcExpiring && <p className="text-[10px] text-amber-600 font-bold mt-1">⚠ EXPIRING SOON</p>}
            </CardContent>
          </Card>

          {/* NTTC Validity Card */}
          <Card className="border border-border/50 shadow-sm bg-white dark:bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">NTTC Validity</span>
              </div>
              <p className="text-lg font-black text-foreground">
                {trainer?.nttc_validity ? new Date(trainer.nttc_validity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not provided'}
              </p>
            </CardContent>
          </Card>

          {/* Institution Card */}
          <Card className="border border-border/50 shadow-sm bg-white dark:bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Institution</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{trainer?.institutions?.name || 'Unassigned'}</p>
              {trainer?.institutions?.province && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {trainer.institutions.province}</p>
              )}
            </CardContent>
          </Card>

          {/* Specialization Card */}
          <Card className="border border-border/50 shadow-sm bg-white dark:bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <Briefcase className="w-4.5 h-4.5 text-violet-600" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Specialization</span>
              </div>
              <p className="text-sm font-bold text-foreground">{trainer?.specialization || 'General'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Programs */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Assigned Programs</h2>
              <p className="text-xs text-muted-foreground font-medium">{assignedPrograms.length} program{assignedPrograms.length !== 1 ? 's' : ''} assigned</p>
            </div>
          </div>
          
          {assignedPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {assignedPrograms.map(tp => (
                <Card key={tp.id} className="border border-border/50 shadow-sm bg-white dark:bg-card hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{tp.programs?.title || 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tp.programs?.qualification_level && <span className="text-[10px] font-bold text-blue-600">{tp.programs.qualification_level}</span>}
                        {tp.programs?.duration_hours > 0 && <span className="text-[10px] text-muted-foreground">{tp.programs.duration_hours} hrs</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {tp.assigned_at && new Date(tp.assigned_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-border/60 shadow-sm bg-white dark:bg-card">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No programs assigned yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Employment History */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
              <History className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Employment History</h2>
              <p className="text-xs text-muted-foreground font-medium">{history.length} record{history.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          {history.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border/50" />
              <div className="space-y-4">
                {history.map((h, i) => (
                  <Card key={h.id} className="border border-border/50 shadow-sm bg-white dark:bg-card ml-10 relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[26px] top-5 w-3 h-3 rounded-full border-2 border-white dark:border-card ${i === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-base">{h.institutions?.name || 'Unknown Institution'}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{h.remarks || h.status}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg shrink-0">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {h.start_date ? new Date(h.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}</span>
                          <span>→</span>
                          <span className={`flex items-center gap-1 ${!h.end_date ? 'text-emerald-600 font-bold' : ''}`}>{h.end_date ? new Date(h.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border border-dashed border-border/60 shadow-sm bg-white dark:bg-card">
              <CardContent className="py-12 text-center">
                <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No history records found</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
