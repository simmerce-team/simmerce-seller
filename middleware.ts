import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

// Define the security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
    "style-src 'self' 'unsafe-inline' https: http:",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https: http: data:",
    "connect-src 'self' https: http: wss:",
    "media-src 'self' https: http: data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ')
};

export async function middleware(request: NextRequest) {
  // Update the session first
  const response = await updateSession(request);
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add nonce to CSP for inline scripts if needed
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = response.headers.get('content-security-policy') || '';
  
  // Update CSP with nonce for scripts
  response.headers.set(
    'Content-Security-Policy',
    cspHeader
      .replace(/script-src[^;]*/, `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https: http:`)
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (Supabase auth callbacks)
     * - health (health check endpoint)
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|health|robots\.txt|sitemap\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};