export const SITE = {
  url: 'https://bishalgc.info.np',
  gaId: 'G-CGXSWDPMTW',
  themeColor: '#512bd4',
} as const;

export const LINKS = {
  github: 'https://github.com/bislerium',
  linkedin: 'https://www.linkedin.com/in/bishalgc/',
  cv: '/assets/cv.pdf',
} as const;

export const PERSON = {
  fullName: 'Bishal Gharti Chhetri',
  firstName: 'Bishal',
  lastName: 'Gharti Chhetri',
  nameParts: ['Bishal', 'Gharti', 'Chhetri'],
  shortName: 'Bishal GC',
  jobTitle: 'Software Engineer',
  location: 'Kathmandu',
  country: 'NP',
  countryName: 'Nepal',
  timezone: 'Asia/Kathmandu',
  clockLabel: 'Kathmandu, Nepal',
} as const;

// Ecosystem — hierarchical structure drives Ecosystem.astro, JSON-LD knowsAbout, PAGE.description, llms.txt
export const ECOSYSTEM = [
  {
    name: 'C#',
    items: ['ASP.NET Core', 'Blazor', 'Entity Framework Core', 'LINQ', 'Async / Await', 'CQRS / MediatR'],
  },
  {
    name: '.NET',
    items: ['.NET 9', 'CLR / GC Internals', 'Middleware Pipeline', 'Dependency Injection', 'Options Pattern', 'Minimal APIs'],
  },
  {
    name: 'PostgreSQL',
    items: ['EF Core Provider', 'Dapper', 'Indexing Strategies', 'Migrations', 'JSONB Queries', 'Performance Tuning'],
  },
  {
    name: 'AWS',
    items: ['EC2 / ECS', 'RDS', 'S3', 'Lambda', 'CloudFormation / CDK', 'IAM Security'],
  },
  {
    name: 'Docker',
    items: ['Multi-stage Builds', 'Docker Compose', 'Healthchecks', 'Volume Management', 'Container Networking'],
  },
  {
    name: 'Git',
    items: ['Branch Strategies', 'Rebase / Merge', 'GitHub Actions CI/CD', 'Hooks', 'Cherry-pick / Bisect'],
  },
] as const;

export const ECOSYSTEM_NAMES = ECOSYSTEM.map(e => e.name);

export const PAGE = {
  title: `${PERSON.fullName} • ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, ${PERSON.countryName}. ${ECOSYSTEM_NAMES.join(', ')}. Building scalable systems with precision, performance, and purpose.`,
  tagline: 'Optimizing code and architecture. Building scalable systems with precision, performance, and purpose.',
  taglineHighlights: ['code', 'architecture'],
} as const;

export const OG_IMAGE_ALT = `${PERSON.fullName} • ${PERSON.jobTitle} portfolio`;
