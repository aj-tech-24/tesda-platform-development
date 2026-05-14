'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'
import { CenterForm } from '../../../components/center-form'
import { createClient } from '@/lib/supabase/client'

export default function EditCenterPage() {
  const [center, setCenter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCenter()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

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

  if (!center) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground mb-4">Institution not found</p>
          <Link href="/admin/centers">
            <Button>Back to Centers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
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
            <p className="text-sm text-muted-foreground mt-0.5">Updating details for <span className="font-semibold text-foreground">{center.name}</span></p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <CenterForm initialData={center} isEditing={true} />
      </div>
    </div>
  )
}
