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

// Stack — hierarchical structure drives Ecosystem.astro, JSON-LD knowsAbout, PAGE.description, llms.txt
export const STACK = [
  {
    name: 'Backend',
    items: [
      'C#, .NET 6/7/8/9/10',
      'ASP.NET Core (Web APIs, Minimal APIs)',
      'gRPC, SignalR, .NET Aspire',
    ],
  },
  {
    name: 'Databases',
    items: [
      'PostgreSQL, MongoDB',
      'Common Table Expressions (CTEs), Recursive CTEs',
      'Table-Valued Functions (TVFs), Stored Procedures',
      'Views, Materialized Views',
      'Full-Text Search (FTS: tsvector, tsquery), pg_trgm',
      'Scheduled Jobs (pg_cron)',
    ],
  },
  {
    name: 'Frontend',
    items: [
      'Blazor, .NET MAUI Blazor Hybrid',
      'HTML, CSS, JavaScript, TypeScript',
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    items: [
      'AWS: S3, Lambda, SQS, SNS, EventBridge, DynamoDB, RDS, EC2, Fargate, EFS, DMS, CloudWatch, Systems Manager Parameter Store',
      'Docker, Docker Compose',
      'Git, GitHub, GitLab',
    ],
  },
  {
    name: 'Architecture & Design',
    items: [
      'Clean Architecture, Domain-Driven Design (DDD), CQRS',
      'Dependency Injection',
      'Repository & Unit of Work',
      'Saga, Outbox',
      'SOLID, DRY, KISS, YAGNI, Separation of Concerns (SoC)',
    ],
  },
  {
    name: 'Observability',
    items: [
      'OpenTelemetry',
      'Prometheus',
      'Grafana (Loki, Tempo)',
      'Jaeger',
    ],
  },
] as const;

export const STACK_NAMES = STACK.map(e => e.name);

export const PAGE = {
  title: `${PERSON.fullName} • ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, ${PERSON.countryName}. ${STACK_NAMES.join(', ')}. Building scalable systems with precision, performance, and purpose.`,
  tagline: 'Optimizing code and architecture. Building scalable systems with precision, performance, and purpose.',
  taglineHighlights: ['code', 'architecture'],
} as const;

export const OG_IMAGE_ALT = `${PERSON.fullName} • ${PERSON.jobTitle} portfolio`;
