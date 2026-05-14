'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Users, Plus, Edit2, Calendar, Clock, Hash, Award, Building2 } from 'lucide-react'
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

export default function AdminProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [program, setProgram] = useState<any>(null)
  const [institution, setInstitution] = useState<any>(null)
  const [trainers, setTrainers] = useState<any[]>([]) // Tagged trainers
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]) // Trainers not yet tagged
  const [loading, setLoading] = useState(true)
  const [taggingTrainer, setTaggingTrainer] = useState(false)
  const [openTagModal, setOpenTagModal] = useState(false)

  const [openEditProgram, setOpenEditProgram] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)

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
      // Fetch program details
      const { data: progData } = await supabase.from('programs').select('*').eq('id', id).single()
      if (!progData) { router.push('/admin/programs'); return }
      setProgram(progData)

      // Fetch institution details
      const { data: instData } = await supabase.from('institutions').select('*').eq('id', progData.institution_id).single()
      setInstitution(instData)

      // Fetch tagged trainers via junction table
      const { data: tpData } = await supabase.from('trainer_programs').select('trainer_id').eq('program_id', id)
      const taggedTrainerIds = tpData?.map(tp => tp.trainer_id) || []

      // Fetch all trainers for this institution
      const { data: allInstTrainers } = await supabase.from('trainers').select('*').eq('institution_id', progData.institution_id).order('full_name', { ascending: true })

      const allTrainers = allInstTrainers || []
      setTrainers(allTrainers.filter(t => taggedTrainerIds.includes(t.id)))
      setAvailableTrainers(allTrainers.filter(t => !taggedTrainerIds.includes(t.id)))

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleTagTrainer(trainerId: string) {
    // --- Optimistic update: move trainer immediately ---
    const trainerToTag = availableTrainers.find(t => t.id === trainerId)
    if (!trainerToTag) return
    setAvailableTrainers(prev => prev.filter(t => t.id !== trainerId))
    setTrainers(prev => [...prev, trainerToTag])
    // -------------------------------------------------
    setTaggingTrainer(true)
    try {
      const { error } = await supabase.from('trainer_programs').insert({
        program_id: id,
        trainer_id: trainerId
      })
      if (error) throw error
      toast.success('Trainer tagged successfully')
    } catch (err: any) {
      // Revert optimistic update on failure
      setTrainers(prev => prev.filter(t => t.id !== trainerId))
      setAvailableTrainers(prev => [...prev, trainerToTag].sort((a, b) => a.full_name.localeCompare(b.full_name)))
      console.error(err)
      toast.error('Failed to tag trainer', { description: err.message || 'An unexpected error occurred.' })
    } finally {
      setTaggingTrainer(false)
    }
  }

  async function onSubmitEdit(values: ProgramFormValues) {
    setSubmittingEdit(true)
    // --- Optimistic update: reflect changes in UI immediately ---
    const prevProgram = program
    setProgram((p: any) => p ? { ...p, ...values } : p)
    // -----------------------------------------------------------
    try {
      const { error } = await supabase.from('programs').update({
        title: values.title,
        qualification_level: values.qualification_level,
        duration_hours: values.duration_hours,
        delivery_mode: values.delivery_mode,
        registration_no: values.registration_no,
        date_issued: values.date_issued || null,
        expiration_date: values.expiration_date || null
      }).eq('id', id)

      if (error) throw error
      setOpenEditProgram(false)
      toast.success('Program updated successfully')
    } catch (err: any) {
      // Revert optimistic update on failure
      setProgram(prevProgram)
      console.error(err)
      toast.error('Failed to update program', { description: err.message || 'Please check your inputs.' })
    } finally {
      setSubmittingEdit(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Program...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/admin/centers/${program?.institution_id}`}>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-full">
                <ArrowLeft className="w-4 h-4" /> Back to {institution?.name || 'Institution'}
              </Button>
            </Link>
            <div className="flex gap-2">
              <Dialog open={openEditProgram} onOpenChange={(open) => {
                if (open && program) {
                  form.reset({
                    title: program.title || '',
                    qualification_level: program.qualification_level || '',
                    duration_hours: program.duration_hours || 0,
                    delivery_mode: program.delivery_mode || '',
                    registration_no: program.registration_no || '',
                    date_issued: program.date_issued ? program.date_issued.split('T')[0] : '',
                    expiration_date: program.expiration_date ? program.expiration_date.split('T')[0] : '',
                  })
                }
                setOpenEditProgram(open)
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1.5 rounded-full backdrop-blur-sm">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Program
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-foreground">
                  <DialogHeader>
                    <DialogTitle>Edit Program Details</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 mt-4">
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
                        <Button type="button" variant="outline" onClick={() => setOpenEditProgram(false)}>Cancel</Button>
                        <Button type="submit" disabled={submittingEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {submittingEdit ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {program?.qualification_level && (
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-100 border border-blue-400/30 tracking-wider">
                    {program.qualification_level}
                  </span>
                )}
                {program?.program_type && (
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/20 tracking-wider">
                    {program.program_type}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-tight mb-2">{program?.title}</h1>
              {institution && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-blue-100/80">
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 shrink-0" /> {institution.name}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center min-w-[100px]">
                <p className="text-2xl font-black">{trainers.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200/80">Assigned Trainers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Program Details Panel */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {[
              { label: 'Duration (Hours)', value: program?.duration_hours ? `${program.duration_hours} hrs` : null, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { label: 'Delivery Mode', value: program?.delivery_mode, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
              { label: 'Registration No. (CoPR)', value: program?.registration_no, icon: Hash, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
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
              { label: 'Date Issued', value: program?.date_issued ? new Date(program.date_issued).toLocaleDateString() : null, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Expiration Date', value: program?.expiration_date ? new Date(program.expiration_date).toLocaleDateString() : null, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: 'TYPE (WTR/NTR/MTP/COC)', value: program?.qualification_level, icon: Award, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-500/10' },
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

        {/* Assigned Trainers Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Assigned Trainers</h2>
                <p className="text-xs text-muted-foreground font-medium">{trainers.length} trainer{trainers.length !== 1 ? 's' : ''} assigned to this program</p>
              </div>
            </div>

            <Dialog open={openTagModal} onOpenChange={setOpenTagModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-full shadow-sm bg-violet-600 hover:bg-violet-700 text-white text-sm">
                  <Plus className="w-4 h-4" /> Assign Trainer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader className="shrink-0">
                  <DialogTitle>Assign Trainer to {program?.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 border border-border/50 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
                  <div className="bg-secondary/50 p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    Available Trainers from {institution?.name}
                  </div>
                  <div className="overflow-auto flex-1 min-h-0 p-2 space-y-2 bg-secondary/10">
                    {availableTrainers.length > 0 ? (
                      availableTrainers.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-white dark:bg-card border border-border/50 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 ${t.employment_type === 'Regular' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                              {t.full_name?.charAt(0) || 'T'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{t.full_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${t.employment_type === 'Regular' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {t.employment_type}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">{t.specialization}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
                            onClick={() => handleTagTrainer(t.id)}
                            disabled={taggingTrainer}
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium text-sm">No available trainers to tag.</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">All institution trainers are already tagged, or none exist.</p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {trainers.length > 0 ? (
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase bg-secondary/50 text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Trainer Name</th>
                      <th className="px-6 py-4">Employment</th>
                      <th className="px-6 py-4">Specialization</th>
                      <th className="px-6 py-4">NTTC No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {trainers.map(t => (
                      <tr key={t.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/trainers/${t.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0 ${t.employment_type === 'Regular' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                              {t.full_name?.charAt(0) || 'T'}
                            </div>
                            <span className="font-bold text-foreground group-hover:text-violet-600 transition-colors">{t.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded-md ${t.employment_type === 'Regular' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                            {t.employment_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {t.specialization || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {t.nttc_no ? (
                            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500" /> {t.nttc_no}</span>
                          ) : 'N/A'}
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
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No trainers tagged yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Click "Tag Trainer" to assign instructors to this program.</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
