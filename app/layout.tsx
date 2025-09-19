import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ServiceWorkerRegistration from "@/components/service-worker-registration"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Digital Notice Board",
  description: "A modern digital notice board for organizations to share announcements and important information",
  keywords: ["notice board", "announcements", "digital board", "organization", "notifications"],
  authors: [{ name: "Digital Notice Board Team" }],
  creator: "Digital Notice Board",
  publisher: "Digital Notice Board",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://your-domain.com"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Digital Notice Board",
    description: "Stay updated with the latest announcements and important information",
    url: "https://your-domain.com",
    siteName: "Digital Notice Board",
    images: [
      {
        url: "/digital-notice-board-app.jpg",
        width: 1200,
        height: 630,
        alt: "Digital Notice Board App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Notice Board",
    description: "Stay updated with the latest announcements and important information",
    images: ["/digital-notice-board-app.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Notice Board",
    "application-name": "Digital Notice Board",
    "msapplication-TileColor": "#0891b2",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#0891b2",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891b2" },
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/notice-board-icon.jpg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/notice-board-icon.jpg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/notice-board-icon.jpg" />
        <link rel="mask-icon" href="/notice-board-icon.jpg" color="#0891b2" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload critical resources */}
        <link rel="preload" href="/sw.js" as="script" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
