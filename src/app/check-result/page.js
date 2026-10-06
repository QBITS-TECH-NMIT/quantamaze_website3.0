import CheckResultExperience from "@/components/CheckResultExperience";

export const metadata = {
  title: { absolute: "Check Your Result | Q-Bits" },
  description: "Check whether your team was shortlisted for Phase 2 of Quant-A-Maze 3.0.",
  openGraph: {
    title: "Check Your Result | Q-Bits",
    description: "Check whether your team was shortlisted for Phase 2 of Quant-A-Maze 3.0.",
    type: "website",
  },
};

export default function CheckResultPage() {
  return <CheckResultExperience />;
}
