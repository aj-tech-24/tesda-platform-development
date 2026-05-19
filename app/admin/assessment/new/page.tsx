'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers } from 'lucide-react'
import { AssessmentCenterForm } from '@/app/admin/components/assessment-center-form'

export default function NewAssessmentCenterPage() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/assessment">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              Add Assessment Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Create a new assessment center record for the admin dashboard.</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AssessmentCenterForm />
      </div>
    </div>
  )
}
