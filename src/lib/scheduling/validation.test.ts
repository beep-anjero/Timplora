import { describe, expect, it } from "vitest";
import { validateSchedule, type AvailabilityBlock } from "./validation";

const employeeId = "employee-1";
const monday = "2026-09-21";

function classBlock(overrides: Partial<AvailabilityBlock> = {}): AvailabilityBlock {
  return { employeeId, weekday: 1, start: "10:00", end: "12:00", label: "Accounting", ...overrides };
}

describe("validateSchedule", () => {
  it("ignores rest entries", () => {
    expect(validateSchedule([{ employeeId, date: monday, value: "Rest" }], [classBlock()], [])).toEqual([]);
  });

  it("rejects malformed and zero-length shifts", () => {
    const conflicts = validateSchedule([
      { employeeId, date: monday, value: "9am–5pm" },
      { employeeId, date: monday, value: "09:00–09:00" },
    ], [], []);
    expect(conflicts.map((item) => item.kind)).toEqual(["invalid", "invalid"]);
  });

  it("flags approved rest days", () => {
    const conflicts = validateSchedule(
      [{ employeeId, date: monday, value: "09:00–17:00" }],
      [],
      [{ employeeId, date: monday }],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].kind).toBe("rest-day");
  });

  it("detects class overlap but allows touching boundaries", () => {
    expect(validateSchedule([{ employeeId, date: monday, value: "09:00–11:00" }], [classBlock()], [])[0].kind).toBe("class");
    expect(validateSchedule([{ employeeId, date: monday, value: "06:00–10:00" }], [classBlock()], [])).toEqual([]);
  });

  it("detects next-day classes during overnight shifts", () => {
    const tuesdayClass = classBlock({ weekday: 2, start: "00:30", end: "02:00", label: "Night class" });
    const conflicts = validateSchedule(
      [{ employeeId, date: monday, value: "18:00–01:00" }],
      [tuesdayClass],
      [],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].message).toContain("Night class");
  });
});
