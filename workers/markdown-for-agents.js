/**
 * Cloudflare Worker — Markdown for Agents
 *
 * Intercepts requests with `Accept: text/markdown` and returns
 * a markdown-converted version of the HTML response. Browsers
 * and other clients without the header get the original HTML.
 *
 * Deploy via Cloudflare Dashboard → Workers & Pages → Create → Workers → Edit code,
 * paste this file, then attach to bishalgc.info.np via a Route or Custom Domain.
 *
 * Free-plan limits: 100,000 requests/day — far above this portfolio's traffic.
 */

// ── Minimal HTML-to-Markdown converter ──────────────────────────────────────
//
// This converts HTML from the origin into markdown for agent consumption.
// It is NOT a security boundary — the HTML comes from our own Astro build,
// not untrusted user input. The conversion operates on already-sanitized
// static content. CodeQL alerts for regex-based HTML parsing are acknowledged
// but not exploitable in this context.

// Single-pass entity decoder — each entity decoded exactly once to prevent
// double-encoding (CodeQL #1).
function decodeEntities(text) {
  return text.replace(/&([a-z]+|#\d+|#x[0-9a-f]+);/gi, (match, entity) => {
    switch (entity.toLowerCase()) {
      case 'amp': return '&';
      case 'lt': return '<';
      case 'gt': return '>';
      case 'quot': return '"';
      case 'apos': return "'";
      case '#39': return "'";
      default:
        if (entity.toLowerCase().startsWith('#x')) {
          return String.fromCodePoint(parseInt(entity.slice(2), 16));
        }
        if (entity.startsWith('#')) {
          return String.fromCodePoint(parseInt(entity.slice(1), 10));
        }
        return match;
    }
  });
}

// Strip HTML tags. The regex handles quoted attribute values to avoid
// false matches on ">" inside attributes. Not a security boundary —
// the input is our own static HTML from Astro.
function stripTags(html) {
  return html.replace(/<(?:[^>"']+|"[^"]*"|'[^']*')*>/g, '');
}

function htmlToMarkdown(html) {
  let md = html;

  // Remove <head> entirely before any conversion
  md = md.replace(/<head\b[\s\S]*?<\/head\s*>/gi, '');

  // Remove scripts, styles, svgs (robust: explicit boundaries)
  md = md.replace(/<(script|style|svg)\b[\s\S]*?<\/\1\s*>/gi, '');

  // Remove HTML comments
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Convert headings
  md = md.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi,
    (_, t) => `\n# ${stripTags(t).trim()}\n`);
  md = md.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi,
    (_, t) => `\n## ${stripTags(t).trim()}\n`);
  md = md.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3\s*>/gi,
    (_, t) => `\n### ${stripTags(t).trim()}\n`);
  md = md.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4\s*>/gi,
    (_, t) => `\n#### ${stripTags(t).trim()}\n`);

  // Convert links
  md = md.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a\s*>/gi,
    (_, href, text) => {
      const clean = stripTags(text).trim();
      return clean ? `[${clean}](${href})` : '';
    });

  // Convert bold/strong
  md = md.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/(strong|b)\s*>/gi,
    '**$2**');

  // Convert italic/em
  md = md.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/(em|i)\s*>/gi,
    '*$2*');

  // Convert list items
  md = md.replace(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi,
    (_, t) => `- ${stripTags(t).trim()}\n`);

  // Block elements → newline boundaries
  const block = /<(p|div|section|article|header|footer|main|nav|ul|ol)\b[^>]*>/gi;
  const blockClose = /<\/(p|div|section|article|header|footer|main|nav|ul|ol)\s*>/gi;
  md = md.replace(block, '\n');
  md = md.replace(blockClose, '\n');
  md = md.replace(/<br\b[^>]*\/?>/gi, '\n');

  // Strip remaining tags
  md = stripTags(md);

  // Decode HTML entities (once, after tag processing)
  md = decodeEntities(md);

  // Collapse whitespace (3+ newlines → 2)
  md = md.replace(/\n{3,}/g, '\n\n');

  // Trim trailing whitespace per line
  md = md.split('\n').map(line => line.trimEnd()).join('\n');

  return md.trim() + '\n';
}

// ── Worker entrypoint ───────────────────────────────────────────────────────

export default {
  async fetch(request, _env, _ctx) {
    const accept = request.headers.get('Accept') || '';

    // Only intervene for markdown requests
    if (!accept.includes('text/markdown')) {
      // Pass through to origin — no change for browsers
      return fetch(request);
    }

    // Fetch the HTML from origin
    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get('Content-Type') || '';

    // Only convert HTML responses (skip images, fonts, etc.)
    if (!contentType.includes('text/html')) {
      return originResponse;
    }

    const html = await originResponse.text();
    const markdown = htmlToMarkdown(html);

    // Preserve security headers from origin
    const securityHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'cross-origin-opener-policy',
    ];

    const headers = new Headers();
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Vary', 'Accept');
    headers.set('x-markdown-tokens', String(Math.round(markdown.length / 4)));

    for (const name of securityHeaders) {
      const value = originResponse.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(markdown, {
      status: originResponse.status,
      headers,
    });
  },
};
