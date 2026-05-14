'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { TrainerForm } from '../../components/trainer-form'

export default function NewTrainerPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background pb-12">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/trainers">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Create New Trainer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in the trainer's details below.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Trainer Details</CardTitle>
            <CardDescription>Enter the details for the new trainer</CardDescription>
          </CardHeader>
          <CardContent>
            <TrainerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
