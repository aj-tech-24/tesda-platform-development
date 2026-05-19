'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AssessorFormProps {
  initialData?: any
  isEditing?: boolean
}

export function AssessorForm({ initialData, isEditing = false }: AssessorFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [region, setRegion] = useState(initialData?.region || '')
  const [province, setProvince] = useState(initialData?.province || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [sector, setSector] = useState(initialData?.sector || '')
  const [status, setStatus] = useState(initialData?.status || 'Active')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name,
        region,
        province,
        address,
        sector,
        status,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && initialData?.id) {
        const { error } = await supabase.from('assessors').update(payload).eq('id', initialData.id)
        if (error) throw error
        toast.success('Assessor updated successfully')
        router.push('/admin/assessors')
        return
      }

      const { error } = await supabase.from('assessors').insert([payload])
      if (error) throw error

      toast.success('Assessor added successfully')
      router.push('/admin/assessors')
    } catch (err: any) {
      toast.error('Unable to save assessor', { description: err?.message || 'Please try again.' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Assessor Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan Dela Cruz" required disabled={loading} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Region</label>
          <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. XI" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Province</label>
          <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g. Davao del Sur" disabled={loading} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Address</label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Barangay, City" rows={3} disabled={loading} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Sector</label>
          <Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="e.g. Automotive" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground" disabled={loading}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="rounded-full px-6" disabled={loading}>
          {isEditing ? 'Save Changes' : 'Add Assessor'}
        </Button>
      </div>
    </form>
  )
}
