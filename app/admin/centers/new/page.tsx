'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'
import { CenterForm } from '../../components/center-form'

export default function NewCenterPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/centers">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              Register New Institution
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Fill in the comprehensive details to add a new institution to the directory.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <CenterForm />
      </div>
    </div>
  )
}
