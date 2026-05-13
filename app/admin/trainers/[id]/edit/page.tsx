'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { TrainerForm } from '../../../components/trainer-form'
import { createClient } from '@/lib/supabase/client'

export default function EditTrainerPage() {
  const [trainer, setTrainer] = useState<any>(null)
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
      await fetchTrainer()
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTrainer() {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      setTrainer(data)
    } catch (error) {
      console.error('Error fetching trainer:', error)
      router.push('/admin/trainers')
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

  if (!trainer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground mb-4">Trainer not found</p>
          <Link href="/admin/trainers">
            <Button>Back to Trainers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/trainers">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Trainer</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Trainer Details</CardTitle>
            <CardDescription>Update the trainer details</CardDescription>
          </CardHeader>
          <CardContent>
            <TrainerForm initialData={trainer} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
