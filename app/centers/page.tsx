import { createClient } from '@/lib/supabase/server'
import { CentersList } from './centers-list'

// ISR: revalidate every hour
export const revalidate = 3600

export default async function CentersPage() {
  const supabase = await createClient()
  
  const { data: centers } = await supabase
    .from('institutions')
    .select('id, name, address, municipality, province, contact_email, contact_no, website_url, logo_url, institution_type, status, programs(id, title, qualification_level, duration_hours, registration_no, date_issued, expiration_date, delivery_mode)')
    .order('name')

  return <CentersList initialCenters={centers || []} />
}
