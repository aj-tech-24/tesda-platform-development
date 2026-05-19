import { createClient } from '@/lib/supabase/server'
import { AssessorsList } from '@/app/assessors/assessors-list'

export const revalidate = 3600

export default async function AdminAssessorsPage() {
  const supabase = await createClient()

  const { data: assessors, error } = await supabase
    .from('assessors')
    .select('id, name, region, province, address, sector, status, assessor_accreditations(qualification_title, date_accredited, valid_until, status)')
    .order('name')

  return <AssessorsList initialAssessors={(assessors as any) || []} addButtonText="Add Assessor" addButtonHref="/admin/assessors/new" />
}
