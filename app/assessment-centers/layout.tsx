import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assessment Centers | TESDA',
  description: 'Browse TESDA-accredited assessment centers and their offered qualifications.',
  openGraph: {
    title: 'Assessment Centers | TESDA',
    description: 'Browse TESDA-accredited assessment centers and their qualifications.',
    type: 'website',
  },
}

export default function AssessmentCentersLayout({ children }: { children: React.ReactNode }) {
  return children
}
