import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Users, Briefcase, Award, Clock, History, Building2, MapPin, Calendar, Shield } from 'lucide-react'

// ISR: revalidate every hour
export const revalidate = 3600

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default async function TrainerDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const [
      { data: trainer, error: trainerError },
      { data: assignedPrograms, error: programsError },
      { data: history, error: historyError }
    ] = await Promise.all([
      supabase
        .from('trainers')
        .select('*, institutions(name, province, address)')
        .eq('id', id)
        .single(),
      supabase
        .from('trainer_programs')
        .select('*, programs(title, qualification_level, duration_hours)')
        .eq('trainer_id', id),
      supabase
        .from('trainer_history')
        .select('*, institutions(name)')
        .eq('trainer_id', id)
        .order('created_at', { ascending: false })
    ])

    if (trainerError) throw trainerError
    if (programsError) throw programsError
    if (historyError) throw historyError

    if (!trainer) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Trainer not found.</div>
      </div>
    )

    const assignedProgramsRows = assignedPrograms || []
    const historyRows = history || []

    const nttcExpired = trainer.nttc_validity && new Date(trainer.nttc_validity) < new Date()
    const nttcExpiring = trainer.nttc_validity && !nttcExpired && (new Date(trainer.nttc_validity).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000

    return (
      <div className="min-h-screen bg-background pb-12 relative overflow-hidden">
        {/* Background Visual Effects */}
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Navigation */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 z-10">
          <div className="flex items-center gap-4">
            <Link href="/trainers">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-primary/10">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to Trainers
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Hero Block */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg shrink-0 ${trainer.employment_type === 'Regular' ? 'bg-gradient-to-br from-primary to-primary-foreground/30' : 'bg-gradient-to-br from-accent to-accent/50'}`}>
                {getInitials(trainer.full_name)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {trainer.employment_type && (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/15 tracking-wider">
                      {trainer.employment_type}
                    </span>
                  )}
                  {trainer.status && (
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider border ${trainer.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {trainer.status}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight">{trainer.full_name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Briefcase className="w-4 h-4 text-primary" strokeWidth={1.5} /> {trainer.specialization || 'Expert Trainer'}
                </p>
              </div>
            </div>

            {/* Quick stats indicators */}
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <div className="bg-card border border-border/60 rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-center min-w-[70px] sm:min-w-[90px] shadow-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{assignedProgramsRows.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Programs</p>
              </div>
              <div className="bg-card border border-border/60 rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-center min-w-[70px] sm:min-w-[90px] shadow-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{historyRows.length}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">History</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
            
            {/* Left Side: General Profile info, assigned programs, and timeline history */}
            <div className="space-y-8">
              
              {/* Profile Details Block */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Trainer Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">Detailed specialist fields and registration stats.</p>
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Full Name</p>
                    <p className="text-foreground font-medium">{trainer.full_name || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Specialization</p>
                    <p className="text-foreground font-medium">{trainer.specialization || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Employment Type</p>
                    <p className="text-foreground font-medium">{trainer.employment_type || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">NTTC Certificate No.</p>
                    <p className="text-foreground font-medium">{trainer.nttc_no || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Programs catalog */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Assigned Programs</h2>
                    <p className="text-xs text-muted-foreground font-medium">{assignedProgramsRows.length} program{assignedProgramsRows.length !== 1 ? 's' : ''} assigned</p>
                  </div>
                </div>

                {assignedProgramsRows.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignedProgramsRows.map(tp => (
                      <Card key={tp.id} className="border border-border/50 shadow-xs bg-card hover:shadow-md transition-all rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">{tp.programs?.title || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tp.programs?.qualification_level && <span className="text-[10px] font-bold text-primary">{tp.programs.qualification_level}</span>}
                              {tp.programs?.duration_hours > 0 && <span className="text-[10px] text-muted-foreground">{tp.programs.duration_hours} hrs</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-dashed border-border/60 shadow-xs bg-card rounded-2xl">
                    <CardContent className="py-12 text-center">
                      <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground font-medium text-sm">No programs assigned to this trainer yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Chronological Employment History */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Employment History</h2>
                    <p className="text-xs text-muted-foreground font-medium">{historyRows.length} record{historyRows.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {historyRows.length > 0 ? (
                  <div className="relative pl-6">
                    {/* Vertical line timeline */}
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border/60" />
                    <div className="space-y-4">
                      {historyRows.map((h, i) => (
                        <div key={h.id} className="relative">
                          {/* Circle timeline dot indicator */}
                          <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background shrink-0 ${i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]' : 'bg-muted-foreground/45'}`} />
                          
                          <Card className="border border-border/50 shadow-xs bg-card rounded-2xl">
                            <CardContent className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h3 className="font-bold text-base text-foreground">{h.institutions?.name || 'Unknown Institution'}</h3>
                                  <p className="text-sm text-muted-foreground mt-0.5">{h.remarks || h.status || 'Active record'}</p>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-primary/5 dark:bg-primary/20 dark:text-primary-foreground px-3 py-1.5 rounded-lg shrink-0 w-fit">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" strokeWidth={1.5} /> {h.start_date ? new Date(h.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}</span>
                                  <span>→</span>
                                  <span className={`font-semibold ${!h.end_date ? 'text-primary' : ''}`}>{h.end_date ? new Date(h.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border border-dashed border-border/60 shadow-xs bg-card rounded-2xl">
                    <CardContent className="py-12 text-center">
                      <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground font-medium text-sm">No employment history records found.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>

            {/* Right Side: Certificate Validity & Assigned training center quick info */}
            <div className="space-y-6">
              
              {/* NTTC Certificate Card details */}
              <Card className={`border shadow-xs bg-card rounded-3xl ${nttcExpired ? 'border-destructive/30' : nttcExpiring ? 'border-amber-300' : 'border-border/80'}`}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] shrink-0 ${nttcExpired ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <Award className="w-5 h-5 animate-pulse-glow" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">NTTC Certificate</p>
                      <p className="text-sm font-semibold text-foreground">{trainer.nttc_no || 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Validity:</span>
                      <span className="font-semibold text-foreground">
                        {trainer.nttc_validity ? new Date(trainer.nttc_validity).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      {nttcExpired ? (
                        <span className="text-xs uppercase font-bold text-destructive px-2 py-0.5 bg-destructive/10 rounded-md">Expired</span>
                      ) : nttcExpiring ? (
                        <span className="text-xs uppercase font-bold text-amber-600 px-2 py-0.5 bg-amber-50 rounded-md">Expiring Soon</span>
                      ) : (
                        <span className="text-xs uppercase font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">Active / Valid</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned training center quick info */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Primary Center Assignment</h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  {trainer.institutions ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Institution Name</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{trainer.institutions.name}</p>
                      </div>
                      {trainer.institutions.address && (
                        <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span>{trainer.institutions.address}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Not currently assigned to an institution.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    )
  } catch (err) {
    console.error(err)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Error loading trainer profile details.</div>
      </div>
    )
  }
}
