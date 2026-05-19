import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assessment Centers | TESDA',
  description: 'Find TESDA-accredited assessment centers and the qualifications they can assess.',
  openGraph: {
    title: 'Assessment Centers | TESDA',
    description: 'Find TESDA-accredited assessment centers and their qualification accreditations.',
    type: 'website',
  },
}

export default function AssessmentCentersLayout({ children }: { children: React.ReactNode }) {
  return children
}