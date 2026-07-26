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
        digest: 'sha256:3a7b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      },
      {
        name: 'api-catalog',
        type: 'skill-md',
        description: 'API catalog describing available endpoints (RFC 9727 linkset)',
        url: `${SITE.url}/.well-known/api-catalog`,
        digest: 'sha256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      },
    ],
  });

  return new Response(body, {
    headers: { 'Content-Type': 'application/json' },
  });
};
