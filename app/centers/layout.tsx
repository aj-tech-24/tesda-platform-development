import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Centers | TESDA',
  description: 'Find TESDA-accredited training centers near you. Browse our directory of certified technical-vocational training centers nationwide.',
  openGraph: {
    title: 'Training Centers | TESDA',
    description: 'Find TESDA-accredited training centers near you.',
    type: 'website',
  },
}

export default function CentersLayout({ children }: { children: React.ReactNode }) {
  return children
}
