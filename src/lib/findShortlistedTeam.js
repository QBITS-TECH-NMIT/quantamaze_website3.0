import teams from "@/data/teams";
import { normalizeMatchName } from "@/lib/normalizeName";

/** Selected only when both team name and Team Lead name match one shortlisted team. */
export function findShortlistedTeam(teamName, teamLeadName) {
  const nameKey = normalizeMatchName(teamName);
  const leadKey = normalizeMatchName(teamLeadName);
  if (!nameKey || !leadKey) return null;

  return (
    teams.find((team) => {
      return (
        normalizeMatchName(team.name) === nameKey &&
        normalizeMatchName(team.team_lead_name) === leadKey
      );
    }) ?? null
  );
}
