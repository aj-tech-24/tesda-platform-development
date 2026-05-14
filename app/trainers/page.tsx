import { createClient } from '@/lib/supabase/server'
import { TrainersList } from './trainers-list'

// ISR: revalidate every hour
export const revalidate = 3600

export default async function TrainersPage() {
  const supabase = await createClient()
  
  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, full_name, specialization, employment_type, nttc_no, nttc_validity, institutions(name)')
    .order('full_name')

  return <TrainersList initialTrainers={(trainers as any) || []} />
}
