import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

// Define the security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest) {
  // Create nonce first so it's available for the CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Update the session
  const response = await updateSession(request);
  
  // Generate the security headers with the nonce
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}' 'unsafe-eval' https: http:`,
    "script-src-attr 'none'",
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
  ].join('; ');
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  response.headers.set('Content-Security-Policy', csp);

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