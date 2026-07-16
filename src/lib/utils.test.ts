import { describe, it, expect } from "vitest";
import {
  getCrowdDensityStatus,
  getGateCapacityPercent,
  classifyIncidentSeverity,
  sanitizeBroadcastMessage,
} from "./utils";

describe("StadiumSaathi Core Utilities", () => {
  describe("getCrowdDensityStatus", () => {
    it("should return GREEN when occupancy ratio is below 50%", () => {
      expect(getCrowdDensityStatus(4999, 10000)).toBe("GREEN");
      expect(getCrowdDensityStatus(0, 10000)).toBe("GREEN");
    });

    it("should return YELLOW when occupancy ratio is between 50% and 85%", () => {
      expect(getCrowdDensityStatus(5000, 10000)).toBe("YELLOW");
      expect(getCrowdDensityStatus(8499, 10000)).toBe("YELLOW");
    });

    it("should return RED when occupancy ratio is 85% or above", () => {
      expect(getCrowdDensityStatus(8500, 10000)).toBe("RED");
      expect(getCrowdDensityStatus(9500, 10000)).toBe("RED");
    });

    it("should return GREEN if capacity is invalid (<= 0)", () => {
      expect(getCrowdDensityStatus(100, 0)).toBe("GREEN");
      expect(getCrowdDensityStatus(100, -10)).toBe("GREEN");
    });
  });

  describe("getGateCapacityPercent", () => {
    it("should clamp values between 0 and 100", () => {
      expect(getGateCapacityPercent(-15)).toBe(0);
      expect(getGateCapacityPercent(120)).toBe(100);
    });

    it("should round values to the nearest integer", () => {
      expect(getGateCapacityPercent(45.2)).toBe(45);
      expect(getGateCapacityPercent(72.8)).toBe(73);
    });
  });

  describe("classifyIncidentSeverity", () => {
    it("should return correct urgency labels for predefined severities", () => {
      expect(classifyIncidentSeverity("CRITICAL")).toBe("Immediate response required");
      expect(classifyIncidentSeverity("HIGH")).toBe("Urgent attention needed");
      expect(classifyIncidentSeverity("MEDIUM")).toBe("Monitor and respond soon");
      expect(classifyIncidentSeverity("LOW")).toBe("Low priority — log and review");
    });

    it("should handle unknown severity gracefully", () => {
      // @ts-expect-error - testing invalid severity input
      expect(classifyIncidentSeverity("UNKNOWN")).toBe("Unknown severity");
    });
  });

  describe("sanitizeBroadcastMessage", () => {
    it("should strip HTML and script tags", () => {
      const input = "Attention <script>alert('XSS')</script>fans, please use <b>Gate D</b>.";
      expect(sanitizeBroadcastMessage(input)).toBe("Attention fans, please use Gate D.");
    });

    it("should enforce a maximum length limit of 300 characters", () => {
      const longMessage = "A".repeat(350);
      const sanitized = sanitizeBroadcastMessage(longMessage);
      expect(sanitized.length).toBe(300);
      expect(sanitized).toBe("A".repeat(300));
    });

    it("should trim surrounding whitespace", () => {
      expect(sanitizeBroadcastMessage("   Attention fans   ")).toBe("Attention fans");
    });
  });
});
