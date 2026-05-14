'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Edit2 } from 'lucide-react'
import { TrainerForm } from '../../../components/trainer-form'
import { createClient } from '@/lib/supabase/client'

export default function EditTrainerPage() {
  const [trainer, setTrainer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTrainer()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading Trainer...</p>
        </div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground mb-4">Trainer not found</p>
          <Link href="/admin/trainers">
            <Button>Back to Trainers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/trainers">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-primary" />
              Edit Trainer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Updating details for <span className="font-semibold text-foreground">{trainer.full_name}</span></p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-border/50 shadow-sm">
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
