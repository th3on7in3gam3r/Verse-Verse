/**
 * Content-Security-Policy for Verse Verse.
 *
 * Default: Content-Security-Policy-Report-Only (set CSP_ENFORCE=true to enforce).
 * Tune directives here after checking browser console / CSP reports.
 */

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  // Next.js App Router serves bundled scripts from 'self'; inline bootstraps need 'unsafe-inline'
  // until nonce-based CSP is added.
  'script-src': ["'self'", "'unsafe-inline'"],
  // React inline styles + component <style> blocks (overlays, onboarding, etc.)
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https://images.unsplash.com'],
  'media-src': ["'self'", 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
};

function buildContentSecurityPolicy(extraDirectives = {}) {
  const merged = { ...CSP_DIRECTIVES, ...extraDirectives };

  if (process.env.CSP_REPORT_URI) {
    merged['report-uri'] = [process.env.CSP_REPORT_URI];
  }

  return Object.entries(merged)
    .map(([directive, values]) =>
      values.length === 0 ? directive : `${directive} ${values.join(' ')}`,
    )
    .join('; ');
}

function isCspEnforced() {
  return process.env.CSP_ENFORCE === 'true';
}

/** Security headers applied to all routes via next.config.js */
function getSecurityHeaders() {
  const policy = buildContentSecurityPolicy();
  const cspHeaderName = isCspEnforced()
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';

  return [
    { key: cspHeaderName, value: policy },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
  ];
}

module.exports = {
  buildContentSecurityPolicy,
  getSecurityHeaders,
  isCspEnforced,
};
