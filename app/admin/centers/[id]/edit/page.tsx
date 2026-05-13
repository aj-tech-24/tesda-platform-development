'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Building2 } from 'lucide-react'
import { CenterForm } from '../../../components/center-form'
import { createClient } from '@/lib/supabase/client'

export default function EditCenterPage() {
  const [center, setCenter] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.user_metadata?.is_admin !== true) {
        router.push('/admin/login')
        return
      }

      setUser(user)
      await fetchCenter()
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCenter() {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      setCenter(data)
    } catch (error) {
      console.error('Error fetching center:', error)
      router.push('/admin/centers')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground mb-4">Center not found</p>
          <Link href="/admin/centers">
            <Button>Back to Centers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/admin/centers/${params.id}`}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  Edit Institution
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Update the details for {center.name}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CenterForm initialData={center} isEditing={true} />
      </div>
    </div>
  )
}
