import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { SpecimenDetail } from "@beep/fixture-lab-specimen-ui";
import { describe, expect, it } from "@effect/vitest";
import { render, screen } from "@testing-library/react";

describe("Specimen UI fixture", () => {
  it("renders the specimen status", () => {
    render(<SpecimenDetail specimen={new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })} />);

    expect(screen.getByText("observed")).toBeDefined();
  });
});
