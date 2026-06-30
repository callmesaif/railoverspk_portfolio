import './globals.css';
import Script from 'next/script';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'RaiLoversPK — Pakistan Railway Vlogger & Filmmaker',
  description:
    "Pakistan's leading railway vlogger. Cinematic train reviews, journey guides, and railway documentation by RaiLoversPK.",
  keywords: 'Pakistan Railways, train vlog, railway review, Pakistan travel, RaiLoversPK',
  icons: {
    icon: '/railoverspk_logo.webp',
    apple: '/railoverspk_logo.webp',
  },
  openGraph: {
    title: 'RaiLoversPK',
    description: "Pakistan's leading railway vlogger and filmmaker.",
    url: 'https://therails.pk',
    siteName: 'RaiLoversPK',
    images: [{ url: '/railoverspk_logo.webp', width: 512, height: 512 }],
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ── Google Analytics (gtag.js) ──────────────────────────── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W5QBJSXND1"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5QBJSXND1');
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
