import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, MapPin, User, Phone, Layers } from 'lucide-react'

export const revalidate = 3600

export default async function AssessmentCenterDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const id = params.id

  try {
    const { data, error } = await supabase
      .from('assessment_centers')
      .select('*, assessment_accreditations(qualification_title, accreditation_number, date_accredited, valid_until, status)')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Assessment center not found.</div>
      </div>
    )

    const center: any = data

    return (
      <div className="min-h-screen bg-background pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/assessment-centers">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-600" />
                {center.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{center.region || ''} {center.province ? `• ${center.province}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-white dark:bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Assessment center profile and contact details.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Center Name</p>
                    <p className="text-foreground font-medium">{center.name || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Region</p>
                    <p className="text-foreground font-medium">{center.region || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Province</p>
                    <p className="text-foreground font-medium">{center.province || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Sector</p>
                    <p className="text-foreground font-medium">{center.sector || '—'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Address</p>
                  <p className="text-foreground font-medium">{center.address || '—'}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Center Manager</p>
                    <p className="text-foreground font-medium">{center.center_manager || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Contact Number</p>
                    <p className="text-foreground font-medium">{center.contact_no || '—'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Accreditations</h3>
                  <div className="mt-3 space-y-3">
                    {center.assessment_accreditations?.length ? (
                      center.assessment_accreditations.map((a: any, i: number) => (
                        <div key={i} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                          <p className="font-semibold">{a.qualification_title || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{a.accreditation_number ? `Accreditation No. ${a.accreditation_number}` : ''}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No accreditations listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Status</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{center.status || 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{center.address || 'No address provided'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{center.contact_no || 'No contact number'}</p>
                  </div>
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
        <div className="text-center">Error loading assessment center.</div>
      </div>
    )
  }
}
