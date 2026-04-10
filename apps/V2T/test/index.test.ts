import { AppThemeProvider } from "@beep/ui/themes";
import { describe, expect, it } from "@effect/vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TwoTvPage } from "../src/components/two-tv.tsx";
import { VERSION } from "../src/index.ts";

describe("@beep/V2T", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("renders the V2T workspace shell", () => {
    const markup = renderToStaticMarkup(createElement(AppThemeProvider, null, createElement(TwoTvPage)));

    expect(markup).toContain("V2T");
    expect(markup).toContain("V2T workspace shell");
  });
});
