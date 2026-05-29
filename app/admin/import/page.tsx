'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAdminRole, type AdminRole } from '@/lib/admin-role'


export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [importType, setImportType] = useState<'registry' | 'assessment' | 'assessor'>('registry')
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const allowedImportTypes = adminRole === 'admin'
    ? ['registry', 'assessment', 'assessor']
    : adminRole === 'assessment_center'
      ? ['assessment']
      : adminRole === 'training_center'
        ? ['registry']
        : []

  useEffect(() => {
    if (allowedImportTypes.length && !allowedImportTypes.includes(importType)) {
      setImportType(allowedImportTypes[0] as typeof importType)
    }
  }, [allowedImportTypes, importType])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const role = getAdminRole(user)
      if (!user || !role) {
        router.push('/admin/login')
        return
      }

      setAdminRole(role)
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setError('')
    }
  }

  const handleImport = async () => {
    if (!file) return
    if (allowedImportTypes.length && !allowedImportTypes.includes(importType)) {
      setError('You do not have access to this import type.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      let endpoint = '/api/import'
      if (importType === 'assessment') {
        endpoint = '/api/import/assessment'
      } else if (importType === 'assessor') {
        endpoint = '/api/import/assessor'
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
      setFile(null) // Reset file input
      // Reset input element
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during import.')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Upload className="w-6 h-6 text-primary" />
                Data Import Center
              </h1>
              <p className="text-sm text-muted-foreground">Bulk upload Institutions, Programs, and Trainers via Excel/CSV.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        <Card className="border-border/50 shadow-md bg-white dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Upload Spreadsheet
            </CardTitle>
            <CardDescription>
              Upload your official registry spreadsheet (.xlsx or .csv). The system will automatically map the columns, check for duplicates, and build the relational database structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Import Type</label>
              <Select value={importType} onValueChange={(val: any) => { setImportType(val); setResult(null); setError(''); }}>
                <SelectTrigger className="w-full border-border bg-white dark:bg-background shadow-sm rounded-xl py-6 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {allowedImportTypes.includes('registry') && (
                    <SelectItem value="registry" className="py-2.5 rounded-lg">Institutions, Programs & Trainers Registry</SelectItem>
                  )}
                  {allowedImportTypes.includes('assessment') && (
                    <SelectItem value="assessment" className="py-2.5 rounded-lg">Assessment Centers & Accreditations</SelectItem>
                  )}
                  {allowedImportTypes.includes('assessor') && (
                    <SelectItem value="assessor" className="py-2.5 rounded-lg">Assessors & Accreditations</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {importType === 'registry' && allowedImportTypes.includes('registry') && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Expected Columns Include:</h4>
                <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Institutions:</span> NAME OF INSTITUTION, PROVINCE, ADDRESS, TEL. NO., E-mail Address, TYPE OF INSTITUTION.<br />
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Programs:</span> COURSE/REGISTERED PROGRAM, Qualification Code, DURATION, EXPIRATION DATE, DELIVERY MODE.<br />
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Trainers:</span> Trainer, NTTC No., Validity.
                </p>
              </div>
            )}
            {importType === 'assessment' && allowedImportTypes.includes('assessment') && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Expected Columns Include:</h4>
                <p className="text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed font-mono text-xs">
                  Region | PROVINCE | ASSESSMENT CENTER | ADDRESS | LONGITUDE | LATITUDE | CENTER MANAGER | TEL. NO. | SECTOR | QUALIFICATION TITLE | ACCREDITATION NUMBER | DATE ACCREDITED | VALID UNTIL | Status
                </p>
              </div>
            )}
            {importType === 'assessor' && allowedImportTypes.includes('assessor') && (
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/50">
                <h4 className="text-sm font-semibold text-violet-800 dark:text-violet-300 mb-2">Expected Columns Include:</h4>
                <p className="text-xs text-violet-700/80 dark:text-violet-300/80 leading-relaxed font-mono">
                  REGION | PROVINCE | NAME | ADDRESS | SECTOR | QUALIFICATION TITLE | DATE OF ACCREDITATION | VALID UNTIL | Status
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors relative">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary/60" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">XLSX or CSV (Max. 10MB)</p>
                </div>
                {file && (
                  <div className="mt-4 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/50">
                    <FileSpreadsheet className="w-4 h-4" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            {result && result.success && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-4">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="font-bold text-lg">Import Successful</h3>
                </div>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 text-sm">{result.message}</p>

                {result.stats && result.stats.centers !== undefined && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.centers}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Assessment Centers</div>
                    </div>
                    <div className="text-center border-l border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.accreditations}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Accreditations</div>
                    </div>
                  </div>
                )}

                {result.stats && result.stats.assessors !== undefined && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.assessors}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Assessors</div>
                    </div>
                    <div className="text-center border-l border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.accreditations}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Accreditations</div>
                    </div>
                  </div>
                )}

                {result.stats && result.stats.institutions !== undefined && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.institutions}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Institutions</div>
                    </div>
                    <div className="text-center border-l border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.programs}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Programs</div>
                    </div>
                    <div className="text-center border-l border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.trainers}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Trainers</div>
                    </div>
                    <div className="text-center border-l border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.stats.compliance || 0}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Compliance</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 border-t border-border/50 bg-secondary/10 flex justify-end">
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="gap-2 shadow-md min-w-35"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
