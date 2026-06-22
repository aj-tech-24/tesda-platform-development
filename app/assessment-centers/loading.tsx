import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Building2, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
          <div className="inline-flex mb-8">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full pointer-events-none opacity-50 border border-transparent">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back Home
            </Button>
          </div>

          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.15)] backdrop-blur-xs">
              <Building2 className="w-8 h-8 text-primary/40 animate-pulse" strokeWidth={1.5} />
            </div>
            <div className="space-y-3 flex-1 max-w-xl">
              <Skeleton className="h-9 w-64 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="space-y-8">
          {/* Search + Filter Bar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full animate-pulse">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
                <div className="w-full h-11 rounded-xl border border-border/80 bg-background/50" />
              </div>
              <div className="w-32 h-11 rounded-xl border border-border/80 bg-background/50" />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground/40 shrink-0 self-end sm:self-center">
              <Filter className="w-4 h-4 text-primary/40" strokeWidth={1.5} />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="border-border/50 rounded-2xl overflow-hidden h-full flex flex-col">
                <CardContent className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Card Header Skeleton */}
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-4 w-1/4 rounded-full" />
                      </div>
                    </div>

                    {/* Card Details Skeleton */}
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accreditation Coverage Section Skeleton */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>

                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/60 bg-background/30 px-4 py-3 space-y-3">
                          <div className="flex items-start gap-2">
                            <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
