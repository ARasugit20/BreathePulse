import { describe, expect, it } from "vitest";

import {
  calculateSessionDuration,
  getNextPhase,
  getPhaseDuration,
  getPhaseLabel,
  PATTERN_TIMINGS,
} from "./breathing";

describe("breathing utils", () => {
  it("returns correct phase durations for box breathing", () => {
    const timing = PATTERN_TIMINGS.box;
    expect(getPhaseDuration(timing, "inhale")).toBe(4);
    expect(getPhaseDuration(timing, "hold")).toBe(4);
    expect(getPhaseDuration(timing, "exhale")).toBe(4);
    expect(getPhaseDuration(timing, "holdAfterExhale")).toBe(4);
  });

  it("advances through phases correctly", () => {
    const timing = PATTERN_TIMINGS.box;
    expect(getNextPhase("inhale", timing)).toBe("hold");
    expect(getNextPhase("hold", timing)).toBe("exhale");
    expect(getNextPhase("exhale", timing)).toBe("holdAfterExhale");
    expect(getNextPhase("holdAfterExhale", timing)).toBe("cycleComplete");
  });

  it("skips zero-duration phases for 4-7-8", () => {
    const timing = PATTERN_TIMINGS["4-7-8"];
    expect(getNextPhase("exhale", timing)).toBe("cycleComplete");
  });

  it("calculates session duration", () => {
    const timing = PATTERN_TIMINGS.box;
    expect(calculateSessionDuration(timing, 4)).toBe(64);
  });

  it("returns human-readable phase labels", () => {
    expect(getPhaseLabel("inhale")).toBe("Breathe In");
    expect(getPhaseLabel("exhale")).toBe("Breathe Out");
  });
});
