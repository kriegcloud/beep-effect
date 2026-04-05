import { describe, expect, it } from "@effect/vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorWorkspaceApp } from "../src/EditorWorkspaceApp.tsx";
import { VERSION } from "../src/index.ts";

describe("@beep/editor-app", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("renders the editor workspace shell instead of a placeholder route", () => {
    const markup = renderToStaticMarkup(createElement(EditorWorkspaceApp));

    expect(markup).toContain("New page");
    expect(markup).toContain("Select or create a page to begin.");
  });
});
