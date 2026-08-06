/**
 * Cloudflare Worker — Markdown for Agents
 *
 * Intercepts GET requests with `Accept: text/markdown` and returns
 * a markdown-converted version of the HTML response via turndown + linkedom.
 *
 * Free-plan limits: 100,000 requests/day — far above this portfolio's traffic.
 */

import TurndownService from 'turndown';
import { parseHTML } from 'linkedom';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// Headers to forward from origin (security- and identity-relevant)
const FORWARD_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'cross-origin-opener-policy',
];

// ── Worker entrypoint ───────────────────────────────────────────────────────

export default {
  async fetch(request, _env, _ctx) {
    const accept = request.headers.get('Accept') ?? '';

    // Only intercept GET requests asking for markdown
    if (!accept.includes('text/markdown') || request.method !== 'GET') {
      return fetch(request);
    }

    // Fetch origin HTML (always GET so we have a body to convert)
    const originResponse = await fetch(new Request(request.url, { method: 'GET' }));
    const contentType = originResponse.headers.get('Content-Type') ?? '';

    if (!contentType.includes('text/html')) {
      return originResponse;
    }

    const html = await originResponse.text();
    const { document: doc, Node } = parseHTML(html);

    // Turndown needs Node.ELEMENT_NODE / Node.TEXT_NODE for nodeType checks.
    // Workers lack a native DOM, so shim from the linkedom parse (once per isolate).
    globalThis.Node ??= Node;

    const markdown = turndown.turndown(doc.body);

    const headers = new Headers();
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Vary', 'Accept');
    headers.set('x-markdown-tokens', String(Math.round(markdown.length / 4) || 1));

    for (const name of FORWARD_HEADERS) {
      const value = originResponse.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(markdown, {
      status: originResponse.status,
      headers,
    });
  },
};
