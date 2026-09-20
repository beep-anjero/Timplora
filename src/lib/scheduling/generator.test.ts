import { describe, expect, it } from "vitest";
import { generateSchedule } from "./generator";
import type { Employee, RestDayRequest } from "@/types";

const employees: Employee[] = ["A", "B", "C", "D", "E"].map((name, index) => ({ id: `e${index}`, name, email: `${name}@test.dev`, phone: "", role: "employee", classification: "FreeSched", position: "Crew", active: true }));
const days = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"].map((date, index) => ({ date, day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] }));

describe("generateSchedule", () => {
  it("protects approved requests and creates staggered overlapping shifts", () => {
    const requests: RestDayRequest[] = [{ id: "r", employeeId: "e0", date: days[1].date, reason: "Family", status: "approved", submittedAt: new Date().toISOString() }];
    const result = generateSchedule(employees, days, [], requests);
    expect(result.grid[`e0-${days[1].date}`]).toBe("Rest");
    for (const day of days) {
      const shifts = employees.map((employee) => result.grid[`${employee.id}-${day.date}`]);
      expect(shifts.filter((shift) => shift !== "Rest")).toHaveLength(4);
      expect(shifts).toContain("16:00–01:00");
      expect(shifts.some((shift) => shift === "04:00–13:00" || shift === "05:00–14:00")).toBe(true);
    }
    for (const employee of employees) expect(days.some((day) => result.grid[`${employee.id}-${day.date}`] === "Rest")).toBe(true);
  });
  it("uses manager-configured coverage and shift templates", () => {
    const result = generateSchedule(employees, days, [], [], ["06:00–14:00", "10:00–18:00", "15:00–23:00"], 3);
    for (const day of days) {
      const shifts = employees.map((employee) => result.grid[`${employee.id}-${day.date}`]);
      expect(shifts.filter((shift) => shift !== "Rest")).toHaveLength(3);
      expect(shifts.filter((shift) => shift !== "Rest").every((shift) => ["06:00–14:00", "10:00–18:00", "15:00–23:00"].includes(shift))).toBe(true);
    }
  });
});
