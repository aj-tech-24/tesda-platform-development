import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, MapPin, User, Phone, Layers, Award } from 'lucide-react'
import AccreditationsListClient from '@/components/accreditations-list-client'

export const revalidate = 3600

export default async function AssessmentCenterDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

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

    if (!center) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Assessment center not found.</div>
      </div>
    )

    const centerData: any = center
    const accreditationRows: any[] = accreditations || []

    return (
      <div className="min-h-screen bg-background pb-12 relative overflow-hidden">
        {/* Background visual layers */}
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Navigation */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-3 sm:pb-4 z-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <Link href="/assessment-centers" className="shrink-0 mt-0.5">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/10 w-9 h-9 sm:w-10 sm:h-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
                  <Building2 className="w-5 h-5 sm:w-6 h-6 text-primary animate-pulse-glow shrink-0 mt-0.5 sm:mt-1" strokeWidth={1.5} />
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight break-words">
                    {centerData.name}
                  </h1>
                </div>
                {centerData.status && (
                  <div className="shrink-0 self-start sm:self-auto pl-[26px] sm:pl-0">
                    <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      centerData.status.toLowerCase() === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {centerData.status}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 pl-[26px] sm:pl-8">{centerData.region || ''} {centerData.province ? `• ${centerData.province}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch items-start">
            {/* Left side details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Basic Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Assessment center profile and catalog details.</p>
                </div>

                <div className="grid gap-2 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200 md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Center Name</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.name || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Region</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.region || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Province</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.province || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Sector</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.sector || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Status</p>
                    <div className="pt-0.5">
                      {centerData.status ? (
                        <span className={`inline-flex text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          centerData.status.toLowerCase() === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {centerData.status}
                        </span>
                      ) : (
                        <p className="text-sm font-bold text-foreground leading-snug">—</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200 md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Address</p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">{centerData.address || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Center Manager</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.center_manager || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Contact Number</p>
                    <p className="text-sm font-bold text-foreground leading-snug">{centerData.contact_no || '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Latitude</p>
                    <p className="text-sm font-bold font-mono text-foreground leading-snug">{centerData.latitude != null ? centerData.latitude : '—'}</p>
                  </div>
                  <div className="space-y-0.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Longitude</p>
                    <p className="text-sm font-bold font-mono text-foreground leading-snug">{centerData.longitude != null ? centerData.longitude : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Contact & Location Card */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-5 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">Contact & Location</h3>
                    <p className="text-xs text-muted-foreground">Get in touch or view on map.</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 pt-2.5 sm:pt-3 border-t border-border/40">
                  {centerData.address && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-muted/40 transition-colors duration-200 group">
                      <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-primary shrink-0 transition-all duration-300 shadow-2xs">
                        <MapPin className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Address</p>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{centerData.address}</p>
                      </div>
                    </div>
                  )}

                  {centerData.contact_no && (
                    <a 
                      href={`tel:${centerData.contact_no.replace(/\s+/g, '')}`}
                      className="flex items-start gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-muted/40 transition-colors duration-200 group relative z-10"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-primary shrink-0 transition-all duration-300 shadow-2xs">
                        <Phone className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Phone Number</p>
                        <p className="text-xs font-bold text-primary group-hover:underline underline-offset-2">{centerData.contact_no}</p>
                      </div>
                    </a>
                  )}

                  {centerData.center_manager && (
                    <div className="flex items-start gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-muted/40 transition-colors duration-200 group">
                      <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-primary shrink-0 transition-all duration-300 shadow-2xs">
                        <User className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Center Manager</p>
                        <p className="text-xs font-semibold text-foreground">{centerData.center_manager}</p>
                      </div>
                    </div>
                  )}
                </div>

                {centerData.latitude != null && centerData.longitude != null && (
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interactive Map</p>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${centerData.latitude},${centerData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 active:scale-[0.98] transition-transform relative z-10"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-2xs group/map aspect-square w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${centerData.latitude},${centerData.longitude}&z=15&output=embed`}
                        className="absolute inset-0 w-full h-full rounded-2xl transition-transform duration-500 group-hover/map:scale-105"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side listings */}
            <div className="relative w-full lg:h-full lg:min-h-0">
              {/* Accreditation Coverage Card */}
              <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs lg:absolute lg:inset-0 lg:h-full lg:flex lg:flex-col lg:space-y-0 lg:min-h-0 space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50 shrink-0 lg:pb-4 lg:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    Accreditation Coverage
                  </h3>
                  <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-md font-semibold">
                    {accreditationRows.length} qualification{accreditationRows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden">
                  <AccreditationsListClient initialAccreditations={accreditationRows} />
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
