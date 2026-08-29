// ---------------------------------------------------------------------------
// Public verification URL helpers.
//
// The public base URL is read from the configurable env var VITE_PUBLIC_URL
// (e.g. https://your-domain.com). We NEVER hard-code localhost into the QR.
// In local development, if no public URL is set, we fall back to the current
// window origin only so the QR can still be previewed — the issued certificate
// record itself never stores the URL.
// ---------------------------------------------------------------------------

export function publicBaseUrl() {
  return (import.meta.env.VITE_PUBLIC_URL || '').replace(/\/+$/, '');
}

// Build the public verification URL for a certificate number.
export function buildVerifyUrl(certNumber) {
  const base = publicBaseUrl() || window.location.origin;
  return `${base}/verify/${encodeURIComponent(certNumber)}`;
}
