import type { APIRoute } from 'astro';
import { SITE, LINKS, PERSON, PAGE, STACK } from 'src/pages/portfolio/_constants';

export const GET: APIRoute = () => {
  const body = `# ${PERSON.fullName}

> This file provides structured information for AI assistants and LLMs
> to learn about ${PERSON.fullName}'s background, skills, and work.

> ${PERSON.jobTitle} · ${PERSON.location}, ${PERSON.countryName} · ${PERSON.timezone}

## About

${PAGE.description}

## Stack

${STACK.map(category => `- ${category.name}\n${category.items.map(s => `  - ${s}`).join('\n')}`).join('\n')}

## Pages

- [Home](${SITE.url})

## Connect

- [GitHub](${LINKS.github}): ${PERSON.fullName}'s GitHub profile
- [LinkedIn](${LINKS.linkedin}): ${PERSON.fullName}'s LinkedIn profile
- [CV](${SITE.url}${LINKS.cv}): ${PERSON.fullName}'s resume

## Policies

- No AI training on personal data without explicit consent.
- Contact via LinkedIn for professional inquiries.

## Optional

- [Source Code](${LINKS.github}/profile): Site source on GitHub
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
