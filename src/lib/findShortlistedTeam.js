import teams from "@/data/teams";
import { normalizeMatchName } from "@/lib/normalizeName";

function getTeamLead(team) {
  return team.members.find((member) => member.role === "Team Lead") ?? team.members[0];
}

/** Selected only when both team name and Team Lead name match one shortlisted team. */
export function findShortlistedTeam(teamName, teamLeadName) {
  const nameKey = normalizeMatchName(teamName);
  const leadKey = normalizeMatchName(teamLeadName);
  if (!nameKey || !leadKey) return null;

  return (
    teams.find((team) => {
      const lead = getTeamLead(team);
      return (
        normalizeMatchName(team.name) === nameKey &&
        normalizeMatchName(lead?.name ?? "") === leadKey
      );
    }) ?? null
  );
}
