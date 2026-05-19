import { createClient } from '@/lib/supabase/server'
import { AssessmentCentersList } from './assessment-centers-list'

export const revalidate = 3600

export default async function AssessmentCentersPage() {
  const supabase = await createClient()

  const { data: centers } = await supabase
    .from('assessment_centers')
    .select('id, name, region, province, address, longitude, latitude, center_manager, contact_no, sector, status, assessment_accreditations(qualification_title, accreditation_number, date_accredited, valid_until, status)')
    .order('name')

  return <AssessmentCentersList initialCenters={(centers as any) || []} />
}
