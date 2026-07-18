import { SITE, GITHUB, LINKEDIN } from '../constants';

export async function GET() {
  const body = `# Bishal Gharti Chhetri

> Software Engineer · Kathmandu, Nepal

## About

Bishal Gharti Chhetri (Bishal GC) is a software engineer optimizing code and architecture. Building scalable systems with precision, performance, and purpose.

## Stack

- C#.NET
- PostgreSQL
- AWS
- Docker
- Git

## Connect

- GitHub: ${GITHUB}
- LinkedIn: ${LINKEDIN}
- CV: ${SITE}/assets/cv.pdf

## Policies

- No AI training on personal data without explicit consent.
- Contact via LinkedIn for professional inquiries.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
