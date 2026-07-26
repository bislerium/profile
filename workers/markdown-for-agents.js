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

function htmlToMarkdown(html) {
  let md = html;

  // Remove <head> entirely
  md = md.replace(/<head[\s\S]*?<\/head>/gi, '');

  // Remove scripts, styles, svgs
  md = md.replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, '');
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // Remove HTML comments
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Convert headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, text) => `\n# ${stripTags(text).trim()}\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, text) => `\n## ${stripTags(text).trim()}\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, text) => `\n### ${stripTags(text).trim()}\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, text) => `\n#### ${stripTags(text).trim()}\n`);

  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const clean = stripTags(text).trim();
    return clean ? `[${clean}](${href})` : '';
  });

  // Convert bold/strong
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**');

  // Convert italic/em
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*');

  // Convert line items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `- ${stripTags(text).trim()}\n`);

  // Convert paragraphs and block elements to double-newline
  md = md.replace(/<(p|div|section|article|header|footer|main|nav|ul|ol|br)[^>]*>/gi, '\n');
  md = md.replace(/<\/(p|div|section|article|header|footer|main|nav|ul|ol)>/gi, '\n');

  // Convert <br> tags
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  md = stripTags(md);

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x2f;/g, '/');

  // Collapse whitespace (3+ newlines → 2)
  md = md.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace per line while preserving intentional blank lines
  md = md.split('\n').map(line => line.trimEnd()).join('\n');

  return md.trim() + '\n';
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '');
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
