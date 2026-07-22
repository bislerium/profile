import { SITE, LINKS, PERSON, PAGE, STACK } from '../constants';

export async function GET() {
  const body = `# ${PERSON.fullName}

> ${PERSON.jobTitle} · ${PERSON.location}, ${PERSON.countryName}

## About

${PERSON.fullName} (${PERSON.shortName}) is a ${PERSON.jobTitle.toLowerCase()} — ${PAGE.tagline.toLowerCase()}.

## Stack

${STACK.map(e => `- ${e.name}\n${e.items.map(s => `  - ${s}`).join('\n')}`).join('\n')}

## Connect

- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}
- CV: ${SITE.url}${LINKS.cv}

## Policies

- No AI training on personal data without explicit consent.
- Contact via LinkedIn for professional inquiries.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
