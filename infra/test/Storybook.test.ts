import {
  makeStorybookStackArgsFromConfigValues,
  StorybookDnsConfig,
  StorybookPulumiConfigValues,
  StorybookStackArgs,
} from "@beep/infra";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("@beep/infra Storybook", () => {
  it("applies deploy defaults for the @beep/ui Storybook stack", () => {
    const args = makeStorybookStackArgsFromConfigValues();

    expect(args.vercel.projectName).toBe("beep-storybook");
    expect(args.vercel.repository).toBe("kriegcloud/beep-effect");
    expect(args.vercel.rootDirectory).toBe("packages/foundation/ui-system/ui");
    expect(args.vercel.productionBranch).toBe("main");
    expect(args.vercel.buildCommand).toBe("cd ../../../.. && bun run storybook:build");
    expect(args.vercel.installCommand).toBe("cd ../../../.. && bun install");
    expect(args.vercel.outputDirectory).toBe("storybook-static");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("none");
    expect(args.dns.attachDomain).toBe(true);
    expect(args.dns.domain).toBe("storybook.yeebois.com");
    expect(args.dns.vercelCnameTarget).toBe("cname.vercel-dns.com");
  });

  it("maps Pulumi config overrides into Vercel and DNS args", () => {
    const args = makeStorybookStackArgsFromConfigValues({
      attachDomain: false,
      buildCommand: "cd ../.. && bun run build:sb",
      cloudflareZoneId: "zone_456",
      dnsRecordImportId: "zone_456/storybook_record",
      domain: "storybook.example.com",
      installCommand: "cd ../.. && bun install",
      outputDirectory: "dist",
      projectName: "storybook-preview",
      productionBranch: "develop",
      repository: "example/repo",
      rootDirectory: "packages/ui",
      vercelAuthenticationDeploymentType: "standardProtection",
      vercelCnameTarget: "cname.example.com",
      vercelTeamId: "team_456",
    });

    expect(args.vercel.projectName).toBe("storybook-preview");
    expect(args.vercel.repository).toBe("example/repo");
    expect(args.vercel.rootDirectory).toBe("packages/ui");
    expect(args.vercel.productionBranch).toBe("develop");
    expect(args.vercel.buildCommand).toBe("cd ../.. && bun run build:sb");
    expect(args.vercel.installCommand).toBe("cd ../.. && bun install");
    expect(args.vercel.outputDirectory).toBe("dist");
    expect(args.vercel.teamId).toBe("team_456");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("standardProtection");
    expect(args.dns.attachDomain).toBe(false);
    expect(args.dns.cloudflareZoneId).toBe("zone_456");
    expect(args.dns.dnsRecordImportId).toBe("zone_456/storybook_record");
    expect(args.dns.domain).toBe("storybook.example.com");
    expect(args.dns.vercelCnameTarget).toBe("cname.example.com");
  });

  it("defaults attachDomain to true when only a custom domain is given", () => {
    const dns = StorybookDnsConfig.make({ domain: "sb.example.com" });
    const args = StorybookStackArgs.make({ dns });

    expect(dns.attachDomain).toBe(true);
    expect(args.dns.domain).toBe("sb.example.com");
  });

  it("decodes optional Pulumi config shape", () => {
    const decoded = Effect.runSync(
      S.decodeUnknownEffect(StorybookPulumiConfigValues)({
        attachDomain: true,
        cloudflareZoneId: "zone_456",
        domain: "storybook.yeebois.com",
        projectName: "beep-storybook",
      })
    );

    expect(decoded.attachDomain).toBe(true);
    expect(decoded.cloudflareZoneId).toBe("zone_456");
    expect(decoded.domain).toBe("storybook.yeebois.com");
    expect(decoded.projectName).toBe("beep-storybook");
  });
});
