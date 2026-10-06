import ResultsExperience from "@/components/ResultsExperience";

export const metadata = {
  title: { absolute: "Phase 2 Results | Q-Bits" },
  description: "View the teams shortlisted for Phase 2 of Quant-A-Maze 3.0.",
  openGraph: {
    title: "Phase 2 Results | Q-Bits",
    description: "The teams shortlisted for Phase 2 of Quant-A-Maze 3.0.",
    type: "website",
  },
};

export default function ResultsPage() {
  return <ResultsExperience />;
}