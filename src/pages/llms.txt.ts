import { SITE, LINKS, PERSON } from '../constants';

export async function GET() {
  const body = `# ${PERSON.fullName}

> ${PERSON.jobTitle} · ${PERSON.location}, ${PERSON.country === 'NP' ? 'Nepal' : PERSON.country}

## About

${PERSON.fullName} (${PERSON.shortName}) is a ${PERSON.jobTitle.toLowerCase()} optimizing code and architecture. Building scalable systems with precision, performance, and purpose.

## Stack

- C#.NET
- PostgreSQL
- AWS
- Docker
- Git

## Connect

- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}
- CV: ${SITE.url}/assets/cv.pdf

## Policies

- No AI training on personal data without explicit consent.
- Contact via LinkedIn for professional inquiries.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
