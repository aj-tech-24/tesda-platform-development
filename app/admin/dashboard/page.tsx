'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, BookOpen, Building2, Users, Shield, ArrowRight, Activity, Search, FileSpreadsheet, Clock, CalendarDays, PieChart as PieIcon, MapPin, AlertTriangle, Loader2, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48'
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ programs: 0, centers: 0, trainers: 0 })
  const [sectorData, setSectorData] = useState<any[]>([])
  const [recentPrograms, setRecentPrograms] = useState<any[]>([])
  const [recentProgramsFilter, setRecentProgramsFilter] = useState('1')
  const [loadingRecentPrograms, setLoadingRecentPrograms] = useState(false)
  const [expiringPrograms, setExpiringPrograms] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    fetchStats()
    fetchRecentPrograms(parseInt(recentProgramsFilter))
  }, [])

  useEffect(() => {
    fetchRecentPrograms(parseInt(recentProgramsFilter))
  }, [recentProgramsFilter])

  async function fetchRecentPrograms(months: number) {
    setLoadingRecentPrograms(true)
    try {
      const dateLimit = new Date()
      dateLimit.setMonth(dateLimit.getMonth() - months)

      const { data, error } = await supabase
        .from('programs')
        .select('id, title, created_at, institution_id, institutions(name, province)')
        .gte('created_at', dateLimit.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentPrograms(data || [])
    } catch (err) {
      console.error('Error fetching recent programs:', err)
    } finally {
      setLoadingRecentPrograms(false)
    }
  }

  async function fetchStats() {
    try {
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

      const [programsRes, centersRes, trainersRes, institutionsWithSector, expiringRes] = await Promise.all([
        supabase.from('programs').select('id', { count: 'exact' }),
        supabase.from('institutions').select('id', { count: 'exact' }),
        supabase.from('trainers').select('id', { count: 'exact' }),
        supabase.from('institutions').select('sector'),
        supabase.from('programs')
          .select('id, title, expiration_date, institution_id, institutions(name)')
          .not('expiration_date', 'is', null)
          .gte('expiration_date', new Date().toISOString())
          .lte('expiration_date', threeMonthsFromNow.toISOString())
          .order('expiration_date', { ascending: true })
          .limit(6)
      ])

      setStats({
        programs: programsRes.count || 0,
        centers: centersRes.count || 0,
        trainers: trainersRes.count || 0,
      })
      setExpiringPrograms(expiringRes.data || [])

      // Aggregate sector data
      const sectorMap: Record<string, number> = {}
        ; (institutionsWithSector.data || []).forEach((inst: any) => {
          const s = inst.sector || 'Unclassified'
          sectorMap[s] = (sectorMap[s] || 0) + 1
        })
      setSectorData(Object.entries(sectorMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))

    } catch (error) { console.error('Error fetching stats:', error) }
  }

  if (loadingRecentPrograms && recentPrograms.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-450 mx-auto w-full h-full">

        {/* Welcome Banner + Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          {/* Welcome */}
          <div className="col-span-1 bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="absolute right-4 bottom-4 opacity-5">
              <Shield className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold tracking-wider mb-3 uppercase border border-white/10 w-fit backdrop-blur-sm">
                <CalendarDays className="w-3 h-3" /> {dateString}
              </div>
              <h2 className="text-2xl font-black leading-tight mb-1">{greeting}!</h2>
              <p className="text-xs text-blue-200/80 font-medium flex items-center gap-1.5 mt-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> System Status: <span className="text-emerald-300 font-bold">Operational</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          {[
            { label: 'Institutions', value: stats.centers, icon: Building2, color: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-950/30', accent: 'border-emerald-200 dark:border-emerald-800/30' },
            { label: 'Programs', value: stats.programs, icon: BookOpen, color: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-950/30', accent: 'border-blue-200 dark:border-blue-800/30' },
            { label: 'Trainers', value: stats.trainers, icon: Users, color: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-950/30', accent: 'border-violet-200 dark:border-violet-800/30' },
          ].map((stat, i) => (
            <Card key={i} className={`border ${stat.accent} shadow-sm bg-white dark:bg-card hover:shadow-md transition-shadow`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground leading-none tracking-tight">{stat.value}</h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts + Modules Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

          {/* Sector Distribution Pie Chart */}
          <Card className="border shadow-sm bg-white dark:bg-card lg:col-span-1 flex flex-col overflow-hidden">
            <CardContent className="p-6 flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <PieIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Sectors</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Institution distribution by sector</p>
                </div>
              </div>
              {sectorData.length > 0 ? (
                <div className="flex flex-col items-center flex-1 overflow-y-auto min-h-0 pr-1">
                  <div className="w-full h-50 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                          {sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full shrink-0 pb-2">
                    {sectorData.slice(0, 8).map((s, i) => (
                      <div key={s.name} className="flex items-center gap-1.5 text-[11px] truncate">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="truncate text-muted-foreground">{s.name}</span>
                        <span className="ml-auto font-bold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No sector data</div>
              )}
            </CardContent>
          </Card>


          {/* Recent Activity + Quick Links */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
            {/* Newly Registered Programs */}
            <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm bg-white dark:bg-card">
              <div className="p-4 border-b bg-secondary/20 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">New Programs</span>
                </div>
                <Select value={recentProgramsFilter} onValueChange={setRecentProgramsFilter} disabled={loadingRecentPrograms}>
                  <SelectTrigger className="h-7 w-25 text-[10px] uppercase font-bold tracking-wider rounded-full bg-white dark:bg-background shadow-sm border-border">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 overflow-y-auto relative">
                {loadingRecentPrograms && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-card/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {recentPrograms.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {recentPrograms.map((prog) => (
                      <Link href={`/admin/programs`} key={prog.id} className="p-3.5 hover:bg-secondary/30 transition-colors flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{prog.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {prog.institutions?.name || 'Unknown'} {prog.institutions?.province && `• ${prog.institutions.province}`}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                    <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">No programs found</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t bg-secondary/10 shrink-0">
                <Link href="/admin/programs">
                  <Button variant="outline" className="w-full h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5 rounded-lg">
                    View All Programs <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Expiring Programs */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden border border-amber-200 dark:border-amber-900/30 shadow-sm bg-white dark:bg-card">
              <div className="p-4 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Expiring Programs</span>
                <span className="ml-auto text-[10px] text-amber-700 font-bold bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">{'<= 3 Months'}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {expiringPrograms.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {expiringPrograms.map((prog) => (
                      <Link href={`/admin/centers/${prog.institution_id}`} key={prog.id} className="p-3.5 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors flex items-start gap-3 group cursor-pointer">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-amber-50 text-amber-600">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-amber-600 transition-colors">{prog.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {prog.institutions?.name || 'Unknown Institution'}
                          </p>
                          <p className="text-[10px] font-bold mt-1.5 text-amber-600">
                            Expires: {new Date(prog.expiration_date).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-30 text-emerald-500" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">All programs valid</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>


    </div>
  )
}
