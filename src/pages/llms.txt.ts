import type { APIRoute } from 'astro';
import { SITE, LINKS, PERSON, PAGE, STACK } from 'src/pages/portfolio/_constants';

export const GET: APIRoute = () => {
  const body = `# ${PERSON.fullName}

> ${PERSON.jobTitle} · ${PERSON.location}, ${PERSON.countryName} · ${PERSON.timezone}

## About

${PAGE.description}

## Stack

${STACK.map(e => `- ${e.name}\n${e.items.map(s => `  - ${s}`).join('\n')}`).join('\n')}

## Pages

- [Home](${SITE.url})

## Connect

- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}

## Policies

- No AI training on personal data without explicit consent.
- Contact via LinkedIn for professional inquiries.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
