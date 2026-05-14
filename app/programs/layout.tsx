import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Programs | TESDA',
  description: 'Explore TESDA-accredited training programs across all industries. Find the right technical-vocational course to build your career.',
  openGraph: {
    title: 'Training Programs | TESDA',
    description: 'Explore TESDA-accredited training programs across all industries.',
    type: 'website',
  },
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children
}
