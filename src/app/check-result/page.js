import CheckResultExperience from "@/components/CheckResultExperience";

export const metadata = {
  title: { absolute: "Check Your Result | Q-Bits" },
  description: "Check your team's Phase 1 result for Quant-A-Maze 3.0.",
  openGraph: {
    title: "Check Your Result | Q-Bits",
    description: "Check your team's Phase 1 result for Quant-A-Maze 3.0.",
    type: "website",
  },
};

export default function CheckResultPage() {
  return <CheckResultExperience />;
}
