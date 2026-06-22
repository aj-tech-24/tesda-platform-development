'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function handleSearchSubmit() {
    const query = searchQuery.trim()
    if (!query) {
      router.push('/programs')
      return
    }
    router.push(`/programs?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative z-10 -mt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <form
        className="glass rounded-2xl shadow-xl shadow-primary/5 p-2 animate-scale-in"
        style={{ animationDelay: '0.4s' }}
        onSubmit={(e) => {
          e.preventDefault()
          handleSearchSubmit()
        }}
      >
        <div className="flex items-center gap-3 bg-background/60 rounded-xl px-5 py-4">
          <Search className="w-5 h-5 text-primary" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search training programs, e.g. SMAW"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-foreground placeholder-muted-foreground text-base focus:ring-0"
          />
          <Button 
            type="submit" 
            size="sm" 
            className="rounded-full bg-primary hover:bg-primary/90 px-5 hidden sm:inline-flex active:scale-[0.98] transition-transform cursor-pointer"
          >
            Search
          </Button>
        </div>
      </form>
    </section>
  )
}
