type PageLoaderProps = {
  title: string
  description: string
}

export function PageLoader({ title, description }: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 via-primary to-cyan-500" />
        </div>
        <div className="space-y-4 rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-card/70">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
            <div className="h-7 w-2/3 rounded-full bg-muted/80 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-muted/70 animate-pulse" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-28 rounded-2xl border border-border/60 bg-muted/30 animate-pulse" />
            <div className="h-28 rounded-2xl border border-border/60 bg-muted/30 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}