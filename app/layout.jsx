import './globals.css';
import Script from 'next/script';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import WhatsAppChat from '@/components/WhatsAppChat';
import CopyProtection from '@/components/CopyProtection';

export const metadata = {
  title: 'RaiLoversPK — Pakistan Railway Vlogger & Filmmaker',
  description: "Pakistan's leading railway vlogger. Cinematic train reviews, journey guides, and railway documentation by RaiLoversPK.",
  keywords: 'Pakistan Railways, train vlog, railway review, Pakistan travel, RaiLoversPK, Railspk, train journey, railway documentary, train photography, railway enthusiast, Pakistan train travel, RaiLoversPK channel, train vlogging, railway exploration, Pakistan rail network, train adventures, RaiLoversPK videos',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://therails.pk'),
  openGraph: {
    title: 'RaiLoversPK',
    description: "Pakistan's leading railway vlogger and filmmaker — cinematic train reviews and journey vlogs from Pakistan.",
    url: 'https://therails.pk',
    siteName: 'RaiLoversPK',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'RaiLoversPK' }],
    type: 'website',
  },
  // Yahan Google Site Verification add ki gayi hai
  verification: {
    google: 'mqsYMsH-F5tYvqUvh9ZpzUa-CMe82D_BcqPTSLkvpdI',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ── Fonts — non-blocking load ──────────────────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap"
        />

        {/* ── Google Analytics ───────────────────────────────────── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W5QBJSXND1"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5QBJSXND1', { page_path: window.location.pathname });
          `}
        </Script>
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider>
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
          <SpeedInsights />
          <WhatsAppChat />
          <CopyProtection />
        </ThemeProvider>
      </body>
    </html>
  );
}