import { createClient } from '@/lib/supabase/server'
import { AssessmentCentersList } from './assessment-centers-list'

export const revalidate = 3600

export default async function AdminAssessmentPage() {
  const supabase = await createClient()

  const { data: centers } = await supabase
    .from('assessment_centers')
    .select('id, name, region, province, address, sector, status')
    .order('name')

  const assessmentCenters = (centers as any) || []

  return <AssessmentCentersList initialCenters={assessmentCenters} addButtonText="Add Assessment Center" addButtonHref="/admin/assessment/new" />
}
