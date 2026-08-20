// Minimal Vercel serverless function that returns static HTML with Open Graph meta tags.
// Isolated endpoint for social crawler previews of the DescribeAI login page.

import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.protocol as string) || 'https';
  const host = req.headers.host || 'descriptaai.example.com';
  const base = `${proto}://${host}`;
  const pageUrl = `${base}/login`;
  // If you have a hosted image, replace this with the absolute URL. Otherwise place an image at /assets/og-login.png
  const imageUrl = `${base}/assets/og-login.png`;

  const title = 'DescribeAI — Login';
  const description = 'Sign in to DescribeAI to generate AI-powered product descriptions at scale for your e-commerce catalog.';

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Short caching for crawlers; adjust if you prefer different TTLs
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  res.status(200).send(html);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
