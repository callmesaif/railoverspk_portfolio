import './globals.css';
import Script from 'next/script';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'RaiLoversPK — Pakistan Railway Vlogger & Filmmaker',
  description: "Pakistan's leading railway vlogger. Cinematic train reviews, journey guides, and railway documentation by RaiLoversPK.",
  keywords: 'Pakistan Railways, train vlog, railway review, Pakistan travel, RaiLoversPK',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/railoverspk_logo.webp', type: 'image/webp', sizes: '512x512' },
    ],
    apple: '/railoverspk_logo.webp',
    shortcut: '/favicon.ico',
  },
  metadataBase: new URL('https://therails.pk'),
  openGraph: {
    title: 'RaiLoversPK',
    description: "Pakistan's leading railway vlogger and filmmaker — cinematic train reviews and journey vlogs from Pakistan.",
    url: 'https://therails.pk',
    siteName: 'RaiLoversPK',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'RaiLoversPK' }],
    type: 'website',
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
        </ThemeProvider>
      </body>
    </html>
  );
}