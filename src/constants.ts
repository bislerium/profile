export const SITE = {
  url: 'https://bishalgc.info.np',
  gaId: 'G-CGXSWDPMTW',
} as const;

export const LINKS = {
  github: 'https://github.com/bislerium',
  linkedin: 'https://www.linkedin.com/in/bishalgc/',
} as const;

export const PERSON = {
  fullName: 'Bishal Gharti Chhetri',
  firstName: 'Bishal',
  lastName: 'Gharti Chhetri',
  shortName: 'Bishal GC',
  jobTitle: 'Software Engineer',
  location: 'Kathmandu',
  country: 'NP',
} as const;

export const PAGE = {
  title: `${PERSON.fullName} • ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, Nepal. C#.NET, PostgreSQL, AWS, Docker, Git. Building scalable systems with precision, performance, and purpose.`,
} as const;

export const OG_IMAGE_ALT = `${PERSON.fullName} • ${PERSON.jobTitle} portfolio`;
