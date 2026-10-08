import ResultsExperience from "@/components/ResultsExperience";

export const metadata = {
  title: { absolute: "Phase 1 Results | Q-Bits" },
  description: "View the Phase 1 selected teams for Quant-A-Maze 3.0.",
  openGraph: {
    title: "Phase 1 Results | Q-Bits",
    description: "The teams selected after Phase 1 of Quant-A-Maze 3.0.",
    type: "website",
  },
};

export default function ResultsPage() {
  return <ResultsExperience />;
}