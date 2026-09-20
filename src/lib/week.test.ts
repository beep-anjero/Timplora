import { describe, expect, it } from "vitest";
import { addDays, mondayOf, upcomingMonday, weekDays, weekRangeLabel } from "./week";

describe("week helpers", () => {
  it("builds a Monday through Sunday week", () => {
    const start = mondayOf(new Date("2026-09-23T12:00:00+08:00"));
    expect(start).toBe("2026-09-21");
    expect(weekDays(start).map((day) => day.date)).toEqual(["2026-09-21","2026-09-22","2026-09-23","2026-09-24","2026-09-25","2026-09-26","2026-09-27"]);
  });
  it("moves to the next request and planning week", () => {
    expect(upcomingMonday(new Date("2026-09-21T08:00:00+08:00"))).toBe("2026-09-28");
    expect(addDays("2026-09-28", 6)).toBe("2026-10-04");
    expect(weekRangeLabel("2026-09-28")).toContain("October 4, 2026");
  });
});
