/**
 * Cloudflare Worker — Markdown for Agents
 *
 * Intercepts requests with `Accept: text/markdown` and returns
 * a markdown-converted version of the HTML response. Uses `turndown`
 * and `linkedom` for robust, spec-compliant HTML-to-markdown conversion.
 *
 * Deployed via GitHub integration on push to main.
 * Free-plan limits: 100,000 requests/day — far above this portfolio's traffic.
 */

import TurndownService from 'turndown';
import { parseHTML } from 'linkedom';

// Shim DOM globals that turndown needs in the Workers runtime (no native DOM).
// Linkedom provides a lightweight, spec-compliant DOM implementation.
(function shimDOM() {
  if (!globalThis.document) {
    const { document, Node, DOMParser } = parseHTML('<!doctype html><html><head></head><body></body></html>');
    globalThis.document = document;
    globalThis.Node = Node;
    globalThis.DOMParser = DOMParser;
    // For turndown v7+ which checks globalThis.window
    globalThis.window = document.defaultView;
  }
})();

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  // Don't escape markdown characters in text nodes — the output is
  // markdown, so escaping would double-encode links, bold, etc.
  escapeMarkdown: false,
});

// ── Worker entrypoint ───────────────────────────────────────────────────────

export default {
  async fetch(request, _env, _ctx) {
    const accept = request.headers.get('Accept') || '';

    // Pass through for non-markdown requests
    if (!accept.includes('text/markdown')) {
      return fetch(request);
    }

    // Fetch the HTML from origin
    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get('Content-Type') || '';

    // Only convert HTML responses
    if (!contentType.includes('text/html')) {
      return originResponse;
    }

    const html = await originResponse.text();

    // Parse HTML and convert to markdown using turndown
    const { document: doc } = parseHTML(html);
    const markdown = turndown.turndown(doc.body);

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
    headers.set('x-markdown-tokens', String(Math.max(1, Math.round(markdown.length / 4))));

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
