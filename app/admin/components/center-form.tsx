'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Building2, MapPin, Contact2, Tags, ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CenterFormProps {
  initialData?: any
  isEditing?: boolean
}

export function CenterForm({ initialData, isEditing = false }: CenterFormProps) {
  // Basic Information
  const [name, setName] = useState(initialData?.name || '')
  const [headName, setHeadName] = useState(initialData?.head_name || '')
  const [sector, setSector] = useState(initialData?.sector || '')
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '')

  // Contact & Online
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || '')
  const [contactNo, setContactNo] = useState(initialData?.contact_no || '')
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url || '')
  const [fbAccount, setFbAccount] = useState(initialData?.fb_account || '')

  // Location
  const [province, setProvince] = useState(initialData?.province || '')
  const [municipality, setMunicipality] = useState(initialData?.municipality || '')
  const [address, setAddress] = useState(initialData?.address || '')

  // Classification
  const [institutionType, setInstitutionType] = useState(initialData?.institution_type || '')
  const [classification, setClassification] = useState(initialData?.classification || '')
  const [status, setStatus] = useState(initialData?.status || 'Active')

  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Limit file size to 2MB
      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File too large', { description: 'Please choose an image under 2MB.' })
        return
      }

      setLogoFile(file)

      // Create a temporary local preview URL
      const objectUrl = URL.createObjectURL(file)
      setLogoUrl(objectUrl)
    } catch (err: any) {
      toast.error('Error processing image.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let finalLogoUrl = logoUrl

      // Upload logo if a new file was selected
      if (logoFile) {
        setUploadingLogo(true)
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile)

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
        finalLogoUrl = data.publicUrl
        setUploadingLogo(false)
      }

      const payload = {
        name,
        head_name: headName,
        sector,
        logo_url: finalLogoUrl,
        contact_email: contactEmail,
        contact_no: contactNo,
        website_url: websiteUrl,
        fb_account: fbAccount,
        province,
        municipality,
        address,
        institution_type: institutionType,
        classification,
        status,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('institutions')
          .update(payload)
          .eq('id', initialData.id)

        if (error) throw error
        toast.success('Institution updated successfully')
        router.push(`/admin/centers/${initialData.id}`)
      } else {
        const { error } = await supabase
          .from('institutions')
          .insert([payload])

        if (error) throw error
        toast.success('Institution registered successfully')
        router.push('/admin/centers')
      }
    } catch (err: any) {
      toast.error('Failed to save institution', { description: err.message || 'An unexpected error occurred.' })
      setUploadingLogo(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Basic Information */}
      <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Building2 className="w-4 h-4" /> Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center bg-white dark:bg-emerald-950/20 overflow-hidden relative shadow-sm">
                {uploadingLogo ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-emerald-300 dark:text-emerald-700/50" />
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <ImagePlus className="w-6 h-6 text-white" />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleLogoUpload}
                  disabled={loading || uploadingLogo}
                  title="Upload institution logo"
                />
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl('')
                    setLogoFile(null)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Institution Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Manila Technical Training Center" required disabled={loading} className="border-emerald-100 focus-visible:ring-emerald-500/20 shadow-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Head of Institution</label>
            <Input value={headName} onChange={(e) => setHeadName(e.target.value)} placeholder="Name of Director/Head" disabled={loading} className="border-emerald-100 focus-visible:ring-emerald-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Sector</label>
            <Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="e.g., TVI, Public, Private" disabled={loading} className="border-emerald-100 focus-visible:ring-emerald-500/20 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <MapPin className="w-4 h-4" /> Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Complete Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street name, Barangay" disabled={loading} className="border-blue-100 focus-visible:ring-blue-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Municipality/City</label>
            <Input value={municipality} onChange={(e) => setMunicipality(e.target.value)} placeholder="e.g., Digos City" disabled={loading} className="border-blue-100 focus-visible:ring-blue-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Province</label>
            <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g., Davao Del Sur" disabled={loading} className="border-blue-100 focus-visible:ring-blue-500/20 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Contact & Online */}
      <div className="bg-violet-50/30 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-violet-800 dark:text-violet-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Contact2 className="w-4 h-4" /> Contact & Online
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@institution.com" disabled={loading} className="border-violet-100 focus-visible:ring-violet-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Contact Number</label>
            <Input value={contactNo} onChange={(e) => setContactNo(e.target.value)} placeholder="(082) 123-4567" disabled={loading} className="border-violet-100 focus-visible:ring-violet-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Facebook Page/Account</label>
            <Input value={fbAccount} onChange={(e) => setFbAccount(e.target.value)} placeholder="https://facebook.com/..." disabled={loading} className="border-violet-100 focus-visible:ring-violet-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Website URL</label>
            <Input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://www.example.com" disabled={loading} className="border-violet-100 focus-visible:ring-violet-500/20 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Tags className="w-4 h-4" /> Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Institution Type</label>
            <Select value={institutionType || undefined} onValueChange={setInstitutionType} disabled={loading}>
              <SelectTrigger className="w-full border-amber-100 focus:ring-amber-500/20 shadow-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TVI">TVI</SelectItem>
                <SelectItem value="TTI">TTI</SelectItem>
                <SelectItem value="Farm School">Farm School</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="LGU">LGU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Classification</label>
            <Input value={classification} onChange={(e) => setClassification(e.target.value)} placeholder="A, B, C, etc." disabled={loading} className="border-amber-100 focus-visible:ring-amber-500/20 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
            <Select value={status || undefined} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger className="w-full border-amber-100 focus:ring-amber-500/20 shadow-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
        <Link href={isEditing ? `/admin/centers/${initialData.id}` : '/admin/centers'}>
          <Button type="button" variant="ghost" disabled={loading} className="rounded-full px-6 hover:bg-secondary">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2 rounded-full px-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Register Institution'}
        </Button>
      </div>
    </form>
  )
}
