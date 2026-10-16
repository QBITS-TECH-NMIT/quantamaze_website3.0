// Groups a team member can belong to. Domain ids must match src/lib/teamMembers.js.
export const MEMBER_GROUPS = [
  { id: "faculty", label: "Faculty" },
  { id: "leadership", label: "Leadership" },
  { id: "technical", label: "Technical" },
  { id: "administration", label: "Administration" },
  { id: "design", label: "Design" },
  { id: "events", label: "Events" },
  { id: "hospitality", label: "Hospitality" },
  { id: "marketing-and-sponsorship", label: "Marketing & Sponsorship" },
  { id: "operations", label: "Operations" },
  { id: "rnd", label: "R&D" },
  { id: "social-media", label: "Social Media" },
];

export const MEMBER_GROUP_IDS = new Set(MEMBER_GROUPS.map(({ id }) => id));
