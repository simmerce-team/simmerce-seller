import { Metadata, Viewport } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://simmerce.app';

/**
 * Default metadata configuration for the application
 */
export const defaultMetadata: Metadata = {
  title: {
    default: 'Simmerce Seller - Your Online Selling Platform',
    template: '%s | Simmerce Seller',
  },
  description: 'Streamline your B2B lead management with Simmerce Seller. Connect with potential business clients, manage leads, and grow your B2B sales pipeline efficiently.',
  keywords: ['B2B', 'lead management', 'business leads', 'sales pipeline', 'enterprise sales', 'business development'],
  authors: [{ name: 'Simmerce' }],
  creator: 'Simmerce Team',
  publisher: 'Simmerce',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'Simmerce Seller - B2B Lead Management System',
    description: 'Powerful B2B lead management solution to help you track, manage, and convert business leads effectively.',
    url: baseUrl,
    siteName: 'Simmerce Seller - B2B Platform',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Simmerce Seller Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simmerce Seller - B2B Lead Management System',
    description: 'Streamline your B2B sales process with our powerful lead management solution. Track, manage, and convert business leads efficiently.',
    images: ['/icon-512.png'],
    creator: '@getsimmerce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

/**
 * Viewport configuration for the application
 * Required by Next.js for viewport and theme color settings
 */
export const viewportConfig: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// Helper function to extend default metadata
export const getMetadata = (metadata: Partial<Metadata> = {}): Metadata => {
  return {
    ...defaultMetadata,
    ...metadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...(metadata.openGraph || {}),
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...(metadata.twitter || {}),
    },
  };
};
