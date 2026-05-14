'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Building2, MapPin, Mail, Phone, BookOpen, Users, Plus, Edit2, Globe, Calendar, Clock, Hash, Award, Layers, Shield, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const programSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  qualification_level: z.string().min(1, 'Type is required'),
  duration_hours: z.coerce.number().min(0, 'Duration must be positive'),
  delivery_mode: z.string().optional(),
  registration_no: z.string().optional(),
  date_issued: z.string().optional(),
  expiration_date: z.string().optional(),
})
type ProgramFormValues = z.infer<typeof programSchema>

export default function AdminCenterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [center, setCenter] = useState<any>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrainers, setShowTrainers] = useState(false)

  const [openAddProgram, setOpenAddProgram] = useState(false)
  const [submittingProgram, setSubmittingProgram] = useState(false)

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: '', qualification_level: '', duration_hours: 0,
      delivery_mode: '', registration_no: '', date_issued: '', expiration_date: ''
    }
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    try {
      const { data: instData } = await supabase.from('institutions').select('*').eq('id', id).single()
      if (!instData) { router.push('/admin/centers'); return }
      setCenter(instData)

      const { data: progData } = await supabase.from('programs').select('*').eq('institution_id', id).order('created_at', { ascending: false })
      setPrograms(progData || [])

      const { data: trainData } = await supabase.from('trainers').select('*, trainer_programs(*)').eq('institution_id', id).order('created_at', { ascending: false })
      setTrainers(trainData || [])
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  async function onSubmitProgram(values: ProgramFormValues) {
    setSubmittingProgram(true)
    // --- Optimistic update: append program immediately ---
    const optimisticProgram = {
      id: `optimistic-${Date.now()}`,
      institution_id: id,
      title: values.title,
      qualification_level: values.qualification_level,
      duration_hours: values.duration_hours,
      delivery_mode: values.delivery_mode,
      registration_no: values.registration_no,
      date_issued: values.date_issued || null,
      expiration_date: values.expiration_date || null,
      created_at: new Date().toISOString(),
    }
    setPrograms(prev => [optimisticProgram, ...prev])
    setOpenAddProgram(false)
    form.reset()
    // -----------------------------------------------------
    try {
      const { data, error } = await supabase.from('programs').insert({
        institution_id: id,
        title: values.title,
        qualification_level: values.qualification_level,
        duration_hours: values.duration_hours,
        delivery_mode: values.delivery_mode,
        registration_no: values.registration_no,
        date_issued: values.date_issued || null,
        expiration_date: values.expiration_date || null
      }).select().single()
      if (error) throw error
      // Replace optimistic record with real one from DB
      setPrograms(prev => prev.map(p => p.id === optimisticProgram.id ? data : p))
      toast.success('Program added successfully')
    } catch (err: any) {
      // Revert optimistic update on failure
      setPrograms(prev => prev.filter(p => p.id !== optimisticProgram.id))
      setOpenAddProgram(true)
      console.error(err)
      toast.error('Failed to add program', { description: err.message || 'Please check your inputs.' })
    } finally {
      setSubmittingProgram(false)
    }
  }


  const regularTrainers = trainers.filter(t => t.employment_type === 'Regular')
  const onCallTrainers = trainers.filter(t => t.employment_type !== 'Regular')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Institution...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link href="/admin/centers">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-full">
                <ArrowLeft className="w-4 h-4" /> Back to Institutions
              </Button>
            </Link>
            {center?.id && (
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1.5 rounded-full backdrop-blur-sm">
                      <Users className="w-3.5 h-3.5" /> View Trainers
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-[75vw] max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                      <DialogTitle>Assigned Trainers ({trainers.length})</DialogTitle>
                    </DialogHeader>
                    {trainers.length > 0 ? (
                      <div className="mt-4 border border-border/50 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
                        <div className="overflow-auto flex-1 min-h-0">
                          <table className="w-full text-sm text-left whitespace-nowrap relative">
                            <thead className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                              <tr>
                                <th className="px-4 py-3 bg-secondary/90 backdrop-blur-md">Trainer Name</th>
                                <th className="px-4 py-3 bg-secondary/90 backdrop-blur-md">Employment</th>
                                <th className="px-4 py-3 bg-secondary/90 backdrop-blur-md">Specialization</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 bg-white dark:bg-card">
                              {trainers.map(t => (
                                <tr key={t.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors cursor-pointer group" onClick={() => router.push(`/admin/trainers/${t.id}`)}>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0 ${t.employment_type === 'Regular' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                                        {t.full_name?.charAt(0) || 'T'}
                                      </div>
                                      <span className="font-bold text-foreground group-hover:text-violet-600 transition-colors">{t.full_name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded-md ${t.employment_type === 'Regular' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                                      {t.employment_type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {t.specialization || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium text-sm">No trainers assigned yet</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Link href={`/admin/centers/${center.id}/edit`}>
                  <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1.5 rounded-full backdrop-blur-sm">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Institution
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {center?.logo_url ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-xl shrink-0 overflow-hidden relative z-20">
                  <img src={center.logo_url} alt={center.name} className="w-full h-full object-cover rounded-xl" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 shadow-xl shrink-0 overflow-hidden relative z-20 border border-white/20 flex items-center justify-center text-5xl font-black text-white/50">
                  {center?.name?.charAt(0) || 'I'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 mt-2 sm:mt-0">
                  {center?.status && (
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 tracking-wider">
                      {center.status}
                    </span>
                  )}
                  {center?.institution_type && (
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/20 tracking-wider">
                      {center.institution_type}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-tight mb-2">{center?.name}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-100/80">
                  {center?.address && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" /> {center.address}</span>
                  )}
                  {center?.province && (
                    <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 shrink-0" /> {center.province}{center.municipality ? `, ${center.municipality}` : ''}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[90px]">
                <p className="text-2xl font-black">{programs.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-200/80">Programs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[90px]">
                <p className="text-2xl font-black">{trainers.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-200/80">Trainers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[90px]">
                <p className="text-2xl font-black">{regularTrainers.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-200/80">Regular</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Institution Details Panel */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {[
              { label: 'Head of Institution', value: center?.head_name, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Contact Number', value: center?.contact_no, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Email Address', value: center?.contact_email, icon: Mail, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            ].map((item, i) => (
              <div key={i} className="p-5 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">{item.value || 'Not provided'}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 border-t border-border/50">
            {[
              { label: 'Sector', value: center?.sector, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: 'Classification', value: center?.classification, icon: Award, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-500/10' },
              { label: 'Facebook', value: center?.fb_account, icon: Globe, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
            ].map((item, i) => (
              <div key={i} className="p-5 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">{item.value || 'Not provided'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Registered Programs</h2>
                <p className="text-xs text-muted-foreground font-medium">{programs.length} program{programs.length !== 1 ? 's' : ''} registered</p>
              </div>
            </div>
            <Dialog open={openAddProgram} onOpenChange={(open) => {
              if (open) form.reset()
              setOpenAddProgram(open)
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-full shadow-sm bg-blue-600 hover:bg-blue-700 text-white text-sm">
                  <Plus className="w-4 h-4" /> Add Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register New Program</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProgram)} className="space-y-4 mt-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Program Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Computer Systems Servicing NC II" className="focus-visible:ring-blue-500/20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="qualification_level" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">TYPE (WTR/NTR/MTP/COC)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full focus:ring-blue-500/20"><SelectValue placeholder="Select type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WTR">WTR</SelectItem>
                              <SelectItem value="NTR">NTR</SelectItem>
                              <SelectItem value="MTP">MTP</SelectItem>
                              <SelectItem value="COC">COC</SelectItem>
                              <SelectItem value="RTP">RTP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="duration_hours" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Duration (Hours)</FormLabel>
                          <FormControl>
                            <Input type="number" className="focus-visible:ring-blue-500/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="delivery_mode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Delivery Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full focus:ring-blue-500/20"><SelectValue placeholder="Select mode" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Institution-based">Institution-based</SelectItem>
                              <SelectItem value="Enterprise-based">Enterprise-based</SelectItem>
                              <SelectItem value="Community-based">Community-based</SelectItem>
                              <SelectItem value="Online/Blended">Online/Blended</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="registration_no" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Registration Number (CoPR)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 20230102030" className="focus-visible:ring-blue-500/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="date_issued" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Date Issued</FormLabel>
                          <FormControl>
                            <Input type="date" className="focus-visible:ring-blue-500/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="expiration_date" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Expiration Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="focus-visible:ring-blue-500/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                      <Button type="button" variant="outline" onClick={() => setOpenAddProgram(false)}>Cancel</Button>
                      <Button type="submit" disabled={submittingProgram} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {submittingProgram ? 'Saving...' : 'Save Program'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {programs.length > 0 ? (
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase bg-secondary/50 text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Program Title</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">Dates & Registration</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {programs.map(p => (
                      <tr
                        key={p.id}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/admin/programs/${p.id}`)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-base text-foreground group-hover:text-blue-600 transition-colors whitespace-normal line-clamp-2 max-w-sm">{p.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {p.qualification_level && <span className="text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{p.qualification_level}</span>}
                            {p.duration_hours > 0 && <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">{p.duration_hours} hrs</span>}
                            {p.delivery_mode && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">{p.delivery_mode}</span>}
                            {p.program_type && <span className="text-[10px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 px-2 py-0.5 rounded-full">{p.program_type}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground space-y-1">
                          {p.registration_no && <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-400" /> Reg: {p.registration_no}</div>}
                          {p.date_issued && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> Issued: {new Date(p.date_issued).toLocaleDateString()}</div>}
                          {p.expiration_date && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Expires: {new Date(p.expiration_date).toLocaleDateString()}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Card className="border border-dashed border-border/60 shadow-sm bg-white dark:bg-card">
              <CardContent className="py-16 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No programs registered yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Click "Add Program" to register the first one.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trainers Section Removed */}

      </div>
    </div>
  )
}
