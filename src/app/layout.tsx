import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmartFlash AI – Intelligent Flashcard Engine',
  description:
    'Turn any PDF into intelligent, spaced-repetition flashcards powered by AI. Study smarter, retain more.',
  keywords: ['flashcards', 'AI', 'spaced repetition', 'study', 'PDF', 'learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <div className="page-wrapper">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
