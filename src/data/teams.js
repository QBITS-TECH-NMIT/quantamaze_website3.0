const teams = [
  {
    id: 1,
    name: "Encrypted",
    members: [
      { name: "Vemala Prajwal", role: "Team Lead" },
      { name: "Aarav Mehta", role: "Member" },
      { name: "Ishita Rao", role: "Member" },
      { name: "Rohan Kulkarni", role: "Member" },
    ],
  },
];

if (process.env.NODE_ENV !== "production") {
  teams.forEach((team) => {
    if (team.members.length > 4) {
      console.warn(`Team "${team.name}" has more than 4 members.`);
    }
  });
}

export default teams;