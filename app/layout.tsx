import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { BrandingProvider } from '@/lib/branding-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TakaTrack - Waste Management System',
  description: 'Complete waste collection management platform powered by TakaTrack',
  generator: 'v0.app',
  icons: {
    icon: '/icon-32x32.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AuthProvider>
          <BrandingProvider>
            {children}
          </BrandingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
