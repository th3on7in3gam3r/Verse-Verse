import './globals.css';
import { Inter, Lora } from 'next/font/google';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
