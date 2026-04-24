import { Button } from "@beep/ui/components/ui/button";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import Home from "../src/app/page.tsx";
import { VERSION } from "../src/index.ts";

describe("@beep/codedank-web", () => {
  it("exposes the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("renders a shared @beep/ui button", () => {
    render(<Button>Shared UI Button</Button>);

    expect(screen.getByRole("button", { name: "Shared UI Button" })).toBeDefined();
  });

  it("exports the main page as a valid React element", () => {
    expect(React.isValidElement(<Home />)).toBe(true);
  });
});
