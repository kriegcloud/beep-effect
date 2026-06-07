import { makeStorybookStackArgsFromConfigValues, StorybookPulumiConfigValues, StorybookStackArgs } from "@beep/infra";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("@beep/infra Storybook", () => {
  it("applies Vercel-only defaults for the public Storybook app", () => {
    const args = makeStorybookStackArgsFromConfigValues();

    expect(args.vercel.projectName).toBe("beep-storybook");
    expect(args.vercel.repository).toBe("kriegcloud/beep-effect");
    expect(args.vercel.rootDirectory).toBe("apps/storybook");
    expect(args.vercel.outputDirectory).toBe("storybook-static");
    expect(args.vercel.installCommand).toBe("cd ../.. && bun install");
    expect(args.vercel.buildCommand).toBe("cd ../.. && bun run storybook:build");
    expect(args.vercel.productionBranch).toBe("main");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("none");
  });

  it("maps Pulumi config overrides into Storybook Vercel args", () => {
    const args = makeStorybookStackArgsFromConfigValues({
      buildCommand: "cd ../.. && bun run storybook:build -- --force",
      installCommand: "cd ../.. && bun install --frozen-lockfile",
      outputDirectory: "storybook-static-preview",
      productionBranch: "staging",
      projectName: "beep-storybook-preview",
      repository: "kriegcloud/beep-effect-preview",
      rootDirectory: "apps/storybook-preview",
      vercelAuthenticationDeploymentType: "onlyPreviewDeployments",
      vercelTeamId: "team_123",
    });

    expect(args.vercel.projectName).toBe("beep-storybook-preview");
    expect(args.vercel.repository).toBe("kriegcloud/beep-effect-preview");
    expect(args.vercel.rootDirectory).toBe("apps/storybook-preview");
    expect(args.vercel.outputDirectory).toBe("storybook-static-preview");
    expect(args.vercel.installCommand).toBe("cd ../.. && bun install --frozen-lockfile");
    expect(args.vercel.buildCommand).toBe("cd ../.. && bun run storybook:build -- --force");
    expect(args.vercel.productionBranch).toBe("staging");
    expect(args.vercel.teamId).toBe("team_123");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("onlyPreviewDeployments");
  });

  it("rejects invalid Vercel authentication deployment config values", () => {
    expect(() =>
      makeStorybookStackArgsFromConfigValues({
        vercelAuthenticationDeploymentType: "invalid",
      })
    ).toThrow(/Invalid storybook:vercelAuthenticationDeploymentType/u);
  });

  it("keeps stack args import-safe", () => {
    const args = StorybookStackArgs.make({});

    expect(args.vercel.projectName).toBe("beep-storybook");
    expect(args.vercel.rootDirectory).toBe("apps/storybook");
  });

  it("decodes optional Pulumi config shape", () => {
    const decoded = Effect.runSync(
      S.decodeUnknownEffect(StorybookPulumiConfigValues)({
        outputDirectory: "storybook-static-preview",
        projectName: "beep-storybook-preview",
        vercelAuthenticationDeploymentType: "none",
      })
    );

    expect(decoded.outputDirectory).toBe("storybook-static-preview");
    expect(decoded.projectName).toBe("beep-storybook-preview");
    expect(decoded.vercelAuthenticationDeploymentType).toBe("none");
  });
});
