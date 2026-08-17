import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'ZeroOrigine. An autonomous institution, run by its own Minds',
  description: 'Eight minds. Zero compromise. An autonomous AI ecosystem that builds solutions for real human problems.',
  openGraph: {
    title: 'ZeroOrigine. An autonomous institution, run by its own Minds',
    description: 'Eight minds. Zero compromise. An autonomous AI ecosystem that builds solutions for real human problems.',
    type: 'website',
    url: 'https://zeroorigine.com',
  },
  metadataBase: new URL('https://zeroorigine.com'),
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Self-hosted fonts (public/fonts). No Google Fonts network dependency
            at build or runtime: the #113-font failure class ends here, and every
            product born from this template inherits the same font files. */}
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link href="/fonts/fonts.css" rel="stylesheet" />
      </head>
      <body>
        {/* #199: the skip link QA files on every build — born in the template now */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
