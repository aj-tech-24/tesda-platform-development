'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TrainerFormProps {
  initialData?: any
  isEditing?: boolean
}

export function TrainerForm({ initialData, isEditing = false }: TrainerFormProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || '')
  const [specialization, setSpecialization] = useState(initialData?.specialization || '')
  const [certificationNumber, setCertificationNumber] = useState(initialData?.certification_number || '')
  const [institutionId, setInstitutionId] = useState(initialData?.institution_id || '')
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCenters()
  }, [])

  async function fetchCenters() {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name')
      
      if (error) throw error
      setCenters(data || [])
    } catch (error) {
      console.error('Error fetching centers:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('trainers')
          .update({
            full_name: fullName,
            specialization,
            certification_number: certificationNumber,
            institution_id: institutionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error
        router.push('/admin/trainers')
      } else {
        const { error } = await supabase
          .from('trainers')
          .insert([{
            full_name: fullName,
            specialization,
            certification_number: certificationNumber,
            institution_id: institutionId,
          }])

        if (error) throw error
        router.push('/admin/trainers')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save trainer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Full Name *</label>
        <Input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g., Juan Dela Cruz"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="specialization" className="text-sm font-medium">Specialization *</label>
        <Input
          id="specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="e.g., Welding, Electrical Installation"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="center" className="text-sm font-medium">Training Center</label>
        <select
          id="center"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        >
          <option value="">Select a training center...</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cert" className="text-sm font-medium">Certification Number</label>
        <Input
          id="cert"
          value={certificationNumber}
          onChange={(e) => setCertificationNumber(e.target.value)}
          placeholder="e.g., CERT-2024-001"
          disabled={loading}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update Trainer' : 'Create Trainer'}
        </Button>
        <Link href="/admin/trainers">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
