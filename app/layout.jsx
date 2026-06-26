import './globals.css';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'RaiLoversPK — Pakistan Railway Vlogger & Filmmaker',
  description:
    "Pakistan's leading railway vlogger. Cinematic train reviews, journey guides, and railway documentation by RaiLoversPK.",
  keywords: 'Pakistan Railways, train vlog, railway review, Pakistan travel, RaiLoversPK',
  icons: {
    icon: '/railoverspk_logo.png',
    apple: '/railoverspk_logo.png',
  },
  openGraph: {
    title: 'RaiLoversPK',
    description: "Pakistan's leading railway vlogger and filmmaker.",
    url: 'https://therails.pk',
    siteName: 'RaiLoversPK',
    images: [{ url: '/railoverspk_logo.png', width: 512, height: 512 }],
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider>
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
