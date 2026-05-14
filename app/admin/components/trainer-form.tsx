'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

const trainerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  employment_type: z.string().min(1, 'Employment type is required'),
  institution_id: z.string().optional().nullable(),
  nttc_no: z.string().optional().nullable(),
  nttc_validity: z.string().optional().nullable(),
})
type TrainerFormValues = z.infer<typeof trainerSchema>

interface TrainerFormProps {
  initialData?: any
  isEditing?: boolean
}

export function TrainerForm({ initialData, isEditing = false }: TrainerFormProps) {
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      specialization: initialData?.specialization || '',
      employment_type: initialData?.employment_type || 'Regular',
      institution_id: initialData?.institution_id || '',
      nttc_no: initialData?.nttc_no || '',
      nttc_validity: initialData?.nttc_validity ? initialData.nttc_validity.split('T')[0] : '',
    }
  })

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

  async function onSubmit(values: TrainerFormValues) {
    setLoading(true)
    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('trainers')
          .update({
            full_name: values.full_name,
            specialization: values.specialization,
            employment_type: values.employment_type,
            institution_id: values.institution_id === 'none' ? null : values.institution_id || null,
            nttc_no: values.nttc_no || null,
            nttc_validity: values.nttc_validity || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error
        toast.success('Trainer updated successfully')
        router.push('/admin/trainers')
      } else {
        const { error } = await supabase
          .from('trainers')
          .insert([{
            full_name: values.full_name,
            specialization: values.specialization,
            employment_type: values.employment_type,
            institution_id: values.institution_id === 'none' ? null : values.institution_id || null,
            nttc_no: values.nttc_no || null,
            nttc_validity: values.nttc_validity || null,
          }])

        if (error) throw error
        toast.success('Trainer created successfully')
        router.push('/admin/trainers')
      }
    } catch (err: any) {
      toast.error('Failed to save trainer', { description: err.message || 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="full_name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Juan Dela Cruz" disabled={loading} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="specialization" render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Welding, Electrical Installation" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="employment_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="On call">On call</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="institution_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Training Center</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || ''} disabled={loading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a training center..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No specific center (Pool)</SelectItem>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="nttc_no" render={({ field }) => (
            <FormItem>
              <FormLabel>NTTC Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CERT-2024-001" disabled={loading} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="nttc_validity" render={({ field }) => (
            <FormItem>
              <FormLabel>NTTC Validity Date</FormLabel>
              <FormControl>
                <Input type="date" disabled={loading} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
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
    </Form>
  )
}
