import { describe, expect, it } from "@effect/vitest";
import { render, screen } from "@testing-library/react";
import { Specimen } from "../../domain/src/index.js";
import { SpecimenDetail } from "../src/index.js";

describe("Specimen UI fixture", () => {
  it("renders the specimen status", () => {
    render(<SpecimenDetail specimen={new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })} />);

    expect(screen.getByText("observed")).toBeDefined();
  });
});
