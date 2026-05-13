'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProgramFormProps {
  initialData?: any
  isEditing?: boolean
}

export function ProgramForm({ initialData, isEditing = false }: ProgramFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [qualificationLevel, setQualificationLevel] = useState(initialData?.qualification_level || 'Level I')
  const [durationHours, setDurationHours] = useState(initialData?.duration_hours || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('programs')
          .update({
            title,
            description,
            qualification_level: qualificationLevel,
            duration_hours: parseInt(durationHours),
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error
        router.push('/admin/programs')
      } else {
        const { error } = await supabase
          .from('programs')
          .insert([{
            title,
            description,
            qualification_level: qualificationLevel,
            duration_hours: parseInt(durationHours),
          }])

        if (error) throw error
        router.push('/admin/programs')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save program')
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
        <label htmlFor="title" className="text-sm font-medium">Program Title *</label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Welding Techniques"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description *</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the program and what participants will learn..."
          rows={5}
          required
          disabled={loading}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="level" className="text-sm font-medium">Qualification Level *</label>
          <select
            id="level"
            value={qualificationLevel}
            onChange={(e) => setQualificationLevel(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
            required
          >
            <option value="Level I">Level I</option>
            <option value="Level II">Level II</option>
            <option value="Level III">Level III</option>
            <option value="Level IV">Level IV</option>
            <option value="Specialization">Specialization</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium">Duration (hours) *</label>
          <Input
            id="duration"
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="e.g., 200"
            min="1"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update Program' : 'Create Program'}
        </Button>
        <Link href="/admin/programs">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
