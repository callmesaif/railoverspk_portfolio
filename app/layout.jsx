import './globals.css';
import Script from 'next/script';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import WhatsAppChat from '@/components/WhatsAppChat';
import CopyProtection from '@/components/CopyProtection';
import PageTracker from '@/components/PageTracker';


/* Fonts live in /public/fonts. The "Fallback" faces are Arial resized to match each font's metrics,
   so when the real font arrives the text doesn't jump (that jump is what Lighthouse reports as layout shift). */
const FONT_CSS = `
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-latin-wght-normal.woff2') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-latin-ext-wght-normal.woff2') format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Bebas Neue';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/bebas-neue-latin-400-normal.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Bebas Neue';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/bebas-neue-latin-ext-400-normal.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:107.12%;ascent-override:90.44%;descent-override:22.52%;line-gap-override:0%}
@font-face{font-family:'Bebas Neue Fallback';src:local('Arial');size-adjust:76.72%;ascent-override:117.32%;descent-override:39.11%;line-gap-override:0%}
`;

export const metadata = {
  title: 'RaiLoversPK | Pakistan Railway Vlogger & Filmmaker',
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
    title: 'RaiLoversPK | Pakistan Railway Vlogger & Filmmaker',
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* ── Fonts — self-hosted (no extra connections, no render-blocking CSS) ── */}
        <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/bebas-neue-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />

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
          <PageTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}