import './globals.css';
import { Inter, Lora } from 'next/font/google';
import PulsePageview from './components/PulsePageview';

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Declaring fonts here lets Next.js preload them correctly and eliminates the
// "preloaded but not used" console warnings caused by unregistered font hints.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: 'Verse Verse',
  description: 'A mindful space to reflect, meditate, and grow through scripture.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <head>
        {/* Pulse Growth Intelligence — must be server-rendered in <head> (not afterInteractive) */}
        <script
          defer
          src="https://pulse-5o1m.onrender.com/pulse.js"
          data-site="site_mt9nnl7q"
          data-host="https://pulse-5o1m.onrender.com"
        />
      </head>
      <body className={inter.className}>
        {children}
        <PulsePageview />
      </body>
    </html>
  );
}
