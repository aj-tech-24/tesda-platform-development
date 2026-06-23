import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Screensaver } from '@/components/screensaver'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { InquiryWidget } from '@/components/inquiry-widget'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'TESDA - Technical Education & Skills Development',
    template: '%s | TESDA',
  },
  description: 'Discover professional training programs and technical certifications from TESDA accredited training centers across the Philippines. Build in-demand skills for a better career.',
  keywords: ['TESDA', 'technical education', 'skills development', 'training programs', 'TVET', 'Philippines', 'certification', 'NTTC', 'training centers'],
  authors: [{ name: 'TESDA' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    siteName: 'TESDA',
    title: 'TESDA - Technical Education & Skills Development',
    description: 'Discover professional training programs and technical certifications from TESDA accredited training centers.',
  },
  icons: {
    icon: '/apple-icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} bg-background scroll-smooth`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Screensaver />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <Toaster position="top-center" richColors />
          <InquiryWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
