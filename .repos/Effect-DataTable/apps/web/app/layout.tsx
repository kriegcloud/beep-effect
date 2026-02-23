import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { Suspense } from 'react'
import { EffectProvider } from './_demo/providers/EffectProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Data Table Filter Demo',
  description: 'Demo of the data table filter component',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background min-h-svh`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <EffectProvider>
            <Suspense>{children}</Suspense>
          </EffectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
