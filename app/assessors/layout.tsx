import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assessors | TESDA',
  description: 'Browse TESDA-accredited assessors and their qualification accreditations.',
  openGraph: {
    title: 'Assessors | TESDA',
    description: 'Browse TESDA-accredited assessors and their qualification accreditations.',
    type: 'website',
  },
}

export default function AssessorsLayout({ children }: { children: React.ReactNode }) {
  return children
}