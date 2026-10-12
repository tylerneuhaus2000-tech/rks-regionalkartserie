export type Driver = {
  name: string;
  slug: string;
  points: number;
  position: number;
  qualifying?: number;
  tags?: string[];
};

export const drivers: Driver[] = [
  { name: "Tyler", slug: "tyler", points: 45, position: 1, qualifying: 2, tags: ["Championship leader", "Fastest lap"] },
  { name: "Jonah", slug: "jonah", points: 43, position: 2, qualifying: 3, tags: ["Last race winner"] },
  { name: "Lennard F.", slug: "lennard-f", points: 27, position: 3, qualifying: 1 },
  { name: "Louis", slug: "louis", points: 20, position: 4, qualifying: 4 },
  { name: "Lennaed W.", slug: "lennaed-w", points: 15, position: 5 },
  { name: "Elijah", slug: "elijah", points: 14, position: 6, qualifying: 6 },
  { name: "Jean-Luca", slug: "jean-luca", points: 12, position: 7, qualifying: 5 },
  { name: "Markus", slug: "markus", points: 8, position: 8 },
  { name: "Fabian", slug: "fabian", points: 6, position: 9, qualifying: 8 },
  { name: "Kilian", slug: "kilian", points: 4, position: 10, qualifying: 7 },
  { name: "Jona Oestermann", slug: "jona-oestermann", points: 4, position: 10, qualifying: 9 },
  { name: "Peter", slug: "peter", points: 4, position: 10 },
  { name: "Marco", slug: "marco", points: 1, position: 13 },
  { name: "Henry", slug: "henry", points: 0, position: 14 },
  { name: "Jona T.", slug: "jona-t", points: 0, position: 14 },
];

export const latestQualifying = ["Lennard F.", "Tyler", "Jonah", "Louis", "Jean-Luca", "Elijah", "Kilian", "Fabian", "Jona Oestermann"];

export const latestRace = {
  winner: "Jonah",
  fastestLap: "Tyler",
  round: "Latest round",
  date: "Track and date not yet published",
  status: "Complete",
};

export const primaryNav = [
  ["Home", "/"], ["Championship", "/championship"], ["Drivers", "/drivers"], ["Teams", "/teams"],
  ["Calendar", "/calendar"], ["RaceHub", "/racehub"], ["Statistics", "/statistics"], ["Media", "/media"], ["Regulations", "/regulations"],
] as const;

export const allSections = [
  ["Head to head", "/head-to-head"], ["Achievements", "/achievements"], ["Race center", "/race-center"], ["Administration", "/admin"],
] as const;

export function getDriver(slug: string) {
  return drivers.find((driver) => driver.slug === slug);
}
