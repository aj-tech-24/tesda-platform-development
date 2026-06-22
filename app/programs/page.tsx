import { createClient } from '@/lib/supabase/server'
import { ProgramsList } from './programs-list'

export const dynamic = 'force-dynamic'

export default async function ProgramsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const initialSearchTerm = typeof resolvedParams?.q === 'string' ? resolvedParams.q : ''
  
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, description, qualification_level, duration_hours, delivery_mode')
    .order('title')

  return <ProgramsList initialPrograms={programs || []} initialSearchTerm={initialSearchTerm} />
}
