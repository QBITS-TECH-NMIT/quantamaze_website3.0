export function scorePrediction(guess) {
  if (guess === "split") return "unresolved";
  return guess === "both" ? "correct" : "incorrect";
}
