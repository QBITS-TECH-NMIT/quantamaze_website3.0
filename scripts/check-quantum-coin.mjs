import assert from "node:assert/strict";
import { scorePrediction } from "../src/lib/quantumCoin.mjs";
assert.equal(scorePrediction("both"), "correct");
assert.equal(scorePrediction("heads"), "incorrect");
assert.equal(scorePrediction("tails"), "incorrect");
assert.equal(scorePrediction("split"), "unresolved");

const choices = ["both", "heads", "tails", "split", "heads", "both", "tails", "split", "both", "heads", "tails", "both", "split", "heads", "both"];
const scores = choices.map((choice) => scorePrediction(choice));

assert.equal(scores.filter((score) => score === "correct").length, 5);
assert.equal(scores.filter((score) => score === "incorrect").length, 7);
assert.equal(scores.filter((score) => score === "unresolved").length, 3);
assert.ok(choices.filter((choice) => choice === "both").every((choice) => scorePrediction(choice) === "correct"));
assert.ok(choices.filter((choice) => choice === "heads" || choice === "tails").every((choice) => scorePrediction(choice) === "incorrect"));

console.log("15 choice checks passed: BOTH is the only correct answer; HEADS and TAILS are incorrect; STAY is unresolved.");
