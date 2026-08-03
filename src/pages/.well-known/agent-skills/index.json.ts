import type { APIRoute } from 'astro';
import { SITE } from 'src/pages/portfolio/_constants';

export const GET: APIRoute = () => {
  const body = JSON.stringify({
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'llms-txt',
        type: 'skill-md',
        description: 'Structured information for AI assistants and LLMs about this site',
        url: `${SITE.url}/llms.txt`,
      },
      {
        name: 'api-catalog',
        type: 'skill-md',
        description: 'API catalog describing available endpoints (RFC 9727 linkset)',
        url: `${SITE.url}/.well-known/api-catalog`,
      },
    ],
  });

  return new Response(body, {
    headers: { 'Content-Type': 'application/json' },
  });
};
