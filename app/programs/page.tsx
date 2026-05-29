import { createClient } from '@/lib/supabase/server'
import { ProgramsList } from './programs-list'

// ISR: revalidate every hour. Data updates propagate within 60 minutes.
export const revalidate = 3600

export default async function ProgramsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const supabase = await createClient()
  const initialSearchTerm = typeof searchParams?.q === 'string' ? searchParams.q : ''
  
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, description, qualification_level, duration_hours, delivery_mode')
    .order('title')

  return <ProgramsList initialPrograms={programs || []} initialSearchTerm={initialSearchTerm} />
}
