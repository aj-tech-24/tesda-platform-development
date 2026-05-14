import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expert Trainers | TESDA',
  description: 'Meet our certified TESDA trainers. Browse expert technical-vocational instructors with verified NTTC certifications and real-world experience.',
  openGraph: {
    title: 'Expert Trainers | TESDA',
    description: 'Meet our certified TESDA trainers with verified NTTC credentials.',
    type: 'website',
  },
}

export default function TrainersLayout({ children }: { children: React.ReactNode }) {
  return children
}
