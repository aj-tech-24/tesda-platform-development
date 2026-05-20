export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAdminRole } from '@/lib/admin-role'
import { AssessmentCenterForm } from '@/app/admin/components/assessment-center-form'

export default async function EditAdminAssessmentCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  const adminRole = getAdminRole(user)

  if (adminRole !== 'admin' && adminRole !== 'assessment_center') {
    redirect('/admin/assessment')
  }

  const { data: center, error } = await supabase
    .from('assessment_centers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !center) {
    redirect('/admin/assessment')
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/assessment/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-50 hover:text-violet-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-violet-600" />
              Edit Assessment Center
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Updating details for <span className="font-semibold text-foreground">{center.name}</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AssessmentCenterForm initialData={center} isEditing={true} successHref={`/admin/assessment/${id}`} />
      </div>
    </div>
  )
}