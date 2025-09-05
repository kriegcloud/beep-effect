import { stringLiteralKit } from "@beep/schema/kits/stringLiteralKit";
import { describe, expect, it } from "vitest";

describe("stringLiteralKit with pick and omit", () => {
  it("should work with pick method returning filtered array", () => {
    const OrderStatus = stringLiteralKit("NEW", "PICKED", "INPROGRESS", "COMPLETE", "CANCELED", "PENDING");

    const pickedStatuses = OrderStatus.pick("NEW", "PENDING");

    expect(pickedStatuses).toEqual(["NEW", "PENDING"]);
  });

  it("should work with omit method returning filtered array", () => {
    const OrderStatus = stringLiteralKit("NEW", "PICKED", "INPROGRESS", "COMPLETE", "CANCELED", "PENDING");

    const omittedStatuses = OrderStatus.omit("NEW", "PENDING");

    expect(omittedStatuses).toEqual(["PICKED", "INPROGRESS", "COMPLETE", "CANCELED"]);
  });

  it("should work with chained usage pattern", () => {
    const LicensePlateStatus = stringLiteralKit(
      "AR", // Anticipated Receipt
      "HS", // In Hospital
      "IV", // Inventory
      "LO", // Loaded Order
      "RC", // Received
      "SO", // Staged Order
      "PK", // Packed
      "AL", // Allocated (ordered)
      "HO" // Hold
    );

    // Test the usage pattern from the user's example
    const ValidLicensePlateStatus = stringLiteralKit(...LicensePlateStatus.pick("AR", "HS", "IV", "RC", "PK"));

    expect(ValidLicensePlateStatus.Options).toEqual(["AR", "HS", "IV", "RC", "PK"]);
    expect(ValidLicensePlateStatus.Enum.AR).toBe("AR");
    expect(ValidLicensePlateStatus.Enum.HS).toBe("HS");
  });

  it("should work with enum mapping", () => {
    const ActionColorValue = stringLiteralKit(
      "primary.main",
      "secondary.main",
      "error.main",
      "warning.main",
      "info.main",
      "success.main",
      {
        enumMapping: [
          ["primary.main", "PRIMARY"],
          ["secondary.main", "SECONDARY"],
          ["error.main", "ERROR"],
          ["warning.main", "WARNING"],
          ["info.main", "INFO"],
          ["success.main", "SUCCESS"],
        ] as const,
      }
    );

    const pickedColors = ActionColorValue.pick("primary.main", "secondary.main");

    expect(pickedColors).toEqual(["primary.main", "secondary.main"]);

    // Test creating new stringLiteralKit with picked values
    const PrimaryColors = stringLiteralKit(...pickedColors);

    expect(PrimaryColors.Options).toEqual(["primary.main", "secondary.main"]);
    expect(PrimaryColors.Enum["primary.main"]).toBe("primary.main");
    expect(PrimaryColors.Enum["secondary.main"]).toBe("secondary.main");
  });

  it("should throw error when pick results in empty array", () => {
    const OrderStatus = stringLiteralKit("NEW", "PICKED");

    expect(() => {
      OrderStatus.pick("INVALID" as any);
    }).toThrow("pick operation must result in at least one literal");
  });

  it("should throw error when omit results in empty array", () => {
    const OrderStatus = stringLiteralKit("NEW", "PICKED");

    expect(() => {
      OrderStatus.omit("NEW", "PICKED");
    }).toThrow("omit operation must result in at least one literal");
  });
});
