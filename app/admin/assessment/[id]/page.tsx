import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Edit2, MapPin, Phone, User, Layers, BadgeCheck, CalendarDays, FileText, Globe } from 'lucide-react'
import { getAdminRole } from '@/lib/admin-role'

export const revalidate = 3600

export default async function AdminAssessmentCenterDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  const adminRole = getAdminRole(user)
  const canEditAssessmentCenters = adminRole === 'admin' || adminRole === 'assessment_center'

  try {
    const [{ data: center, error: centerError }, { data: accreditations, error: accreditationError }] = await Promise.all([
      supabase
        .from('assessment_centers')
        .select('id, name, region, province, address, longitude, latitude, center_manager, contact_no, sector, status')
        .eq('id', id)
        .single(),
      supabase
        .from('assessment_accreditations')
        .select('id, qualification_title, accreditation_number, date_accredited, valid_until, status')
        .eq('assessment_center_id', id)
        .order('qualification_title'),
    ])

    if (centerError) throw centerError
    if (accreditationError) throw accreditationError

    if (!center) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">Assessment center not found.</div>
        </div>
      )
    }

    const centerData: any = center
    const accreditationRows: any[] = accreditations || []

    return (
      <div className="min-h-screen bg-background pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/assessment">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-50 hover:text-violet-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-violet-600" />
                {centerData.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {[centerData.region, centerData.province].filter(Boolean).join(' • ') || 'Assessment center profile'}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {canEditAssessmentCenters && (
            <div className="flex justify-end mb-3">
              <Link href={`/admin/assessment/${id}/edit`}>
                <Button size="sm" variant="outline" className="gap-2 rounded-full border-border/80 bg-white/80 backdrop-blur-sm hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="bg-white dark:bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Assessment center profile and contact details.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Center Name</p>
                    <p className="text-foreground font-medium">{centerData.name || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Status</p>
                    <p className="text-foreground font-medium">{centerData.status || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Region</p>
                    <p className="text-foreground font-medium">{centerData.region || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Province</p>
                    <p className="text-foreground font-medium">{centerData.province || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Sector</p>
                    <p className="text-foreground font-medium">{centerData.sector || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Center Manager</p>
                    <p className="text-foreground font-medium">{centerData.center_manager || '—'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Address</p>
                  <p className="text-foreground font-medium">{centerData.address || '—'}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Contact Number</p>
                    <p className="text-foreground font-medium">{centerData.contact_no || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Coordinates</p>
                    <p className="text-foreground font-medium">
                      {centerData.latitude != null && centerData.longitude != null
                        ? `${centerData.latitude}, ${centerData.longitude}`
                        : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Accreditations</h3>
                  <div className="mt-3 space-y-3">
                    {accreditationRows.length ? (
                      accreditationRows.map((accreditation: any, index: number) => (
                        <div key={index} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <BadgeCheck className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{accreditation.qualification_title || 'Unknown Qualification'}</p>
                              {accreditation.accreditation_number && (
                                <p className="text-xs text-muted-foreground">Accreditation No. {accreditation.accreditation_number}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            {accreditation.date_accredited && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                Accredited {new Date(accreditation.date_accredited).toLocaleDateString()}
                              </span>
                            )}
                            {accreditation.valid_until && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                Valid until {new Date(accreditation.valid_until).toLocaleDateString()}
                              </span>
                            )}
                            {accreditation.status && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                {accreditation.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No accreditations listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-border/80 rounded-3xl p-6 shadow-sm h-fit self-start">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Status</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{centerData.status || 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{centerData.address || 'No address provided'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{centerData.contact_no || 'No contact number'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{centerData.center_manager || 'No center manager provided'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {centerData.region || 'No region'}{centerData.province ? `, ${centerData.province}` : ''}
                    </p>
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Error loading assessment center.</div>
      </div>
    )
  }
}
