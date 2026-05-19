import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assessment Centers | Admin',
  description: 'Admin area for managing assessment centers.',
}

export default function AdminAssessmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
