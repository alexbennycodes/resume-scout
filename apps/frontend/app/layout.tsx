import type { Metadata } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import './(default)/css/globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Resume Matcher',
  description: 'Build your resume with Resume Matcher',
  applicationName: 'Resume Matcher',
  keywords: ['resume', 'matcher', 'job', 'application'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="h-full" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
