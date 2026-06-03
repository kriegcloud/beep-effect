import { Button } from "@beep/ui/components/ui/button";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("@beep/codedank-web", () => {
  it("renders a shared @beep/ui button", () => {
    render(<Button>Shared UI Button</Button>);

    expect(screen.getByRole("button", { name: "Shared UI Button" })).toBeDefined();
  });

  it("exports the main page as a valid React element", () => {
    expect(React.isValidElement(<Home />)).toBe(true);
  });
});
