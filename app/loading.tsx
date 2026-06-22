export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Skeleton */}
      <div className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
            <div className="hidden sm:block w-28 h-4 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-16 h-3.5 rounded-full bg-muted/80 animate-pulse" />
              <div className="w-20 h-3.5 rounded-full bg-muted/80 animate-pulse" />
              <div className="w-14 h-3.5 rounded-full bg-muted/80 animate-pulse" />
              <div className="w-24 h-3.5 rounded-full bg-muted/80 animate-pulse" />
            </div>
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-20 hero-pattern">
        {/* Background blobs */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-accent/4 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="w-64 h-9 rounded-full bg-primary/5 border border-primary/10 animate-pulse" />

              {/* Heading lines */}
              <div className="space-y-3">
                <div className="h-12 sm:h-14 w-[90%] rounded-2xl bg-muted/70 animate-pulse" />
                <div className="h-12 sm:h-14 w-[60%] rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 animate-pulse" />
              </div>

              {/* Subtext */}
              <div className="space-y-2.5 max-w-xl">
                <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                <div className="h-4 w-[85%] rounded-full bg-muted/40 animate-pulse" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="h-12 w-48 rounded-full bg-gradient-to-r from-primary/20 to-accent/15 animate-pulse shadow-lg shadow-primary/5" />
                <div className="h-12 w-52 rounded-full border border-border/60 bg-muted/20 animate-pulse" />
              </div>
            </div>

            {/* Right Column: Image placeholder */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-2xl shadow-primary/5 bg-muted/30 aspect-4/3 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Skeleton */}
      <section className="relative z-10 -mt-8 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="h-14 rounded-2xl bg-card border border-border/50 shadow-xl shadow-primary/5 animate-pulse" />
      </section>

      {/* Trust Indicators Skeleton */}
      <section className="relative z-10 mt-6 mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl border border-border/40 p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-around gap-6 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/15 animate-pulse" />
                <div className="w-24 h-3.5 rounded-full bg-muted/60 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="h-10 w-80 mx-auto rounded-2xl bg-muted/60 animate-pulse" />
          <div className="h-4 w-64 mx-auto rounded-full bg-muted/40 animate-pulse" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 p-8 space-y-5 bg-card/50 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded-full bg-muted/70" />
                <div className="h-3.5 w-full rounded-full bg-muted/40" />
                <div className="h-3.5 w-[85%] rounded-full bg-muted/30" />
              </div>
              <div className="h-3.5 w-28 rounded-full bg-primary/10" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-accent/3 to-primary/3" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <div className="h-10 w-56 mx-auto rounded-2xl bg-muted/50 animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative bg-white/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/40 p-8 text-center space-y-4 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto" />
                <div className="h-10 w-20 rounded-xl bg-muted/60 mx-auto" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded-full bg-muted/50 mx-auto" />
                  <div className="h-3.5 w-24 rounded-full bg-muted/30 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}