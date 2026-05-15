import { makeOpipWebStackArgsFromConfigValues, OpipWebPulumiConfigValues } from "@beep/infra";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("@beep/infra OpipWeb", () => {
  it("applies production-safe defaults for OPIP web infrastructure", () => {
    const args = makeOpipWebStackArgsFromConfigValues();

    expect(args.state.bucketName).toBe("opip-law-pulumi-state");
    expect(args.state.createDynamoDbLockTable).toBe(false);
    expect(args.state.protect).toBe(true);
    expect(args.dns.attachProductionDomains).toBe(false);
    expect(args.dns.attachStagingDomain).toBe(true);
    expect(args.assets.bucketName).toBe("assets.opip.law");
    expect(args.assets.protect).toBe(true);
    expect(args.dns.productionDomain).toBe("opip.law");
    expect(args.dns.stagingDomain).toBe("staging.opip.law");
    expect(args.vercel.projectName).toBe("opip-web");
    expect(args.vercel.repository).toBe("kriegcloud/beep-effect");
    expect(args.vercel.rootDirectory).toBe("apps/opip-web");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("none");
  });

  it("maps Pulumi config overrides into state, DNS, and Vercel args", () => {
    const args = makeOpipWebStackArgsFromConfigValues({
      assetsBucketName: "assets.example.com",
      attachProductionDomains: true,
      attachStagingDomain: false,
      awsRegion: "us-west-2",
      cloudflareZoneId: "zone_123",
      createDynamoDbLockTable: true,
      hubSpotAccountId: "12345",
      hubSpotFormGuid: "form-guid",
      pulumiStateBucketName: "example-pulumi-state",
      sanityDataset: "production",
      sanityProjectId: "sanity-id",
      stagingBranch: "develop",
      stagingDomain: "preview.example.com",
      vercelAuthenticationDeploymentType: "onlyPreviewDeployments",
      vercelTeamId: "team_123",
    });

    expect(args.state.bucketName).toBe("example-pulumi-state");
    expect(args.state.lockTableName).toBe("example-pulumi-state-locks");
    expect(args.state.createDynamoDbLockTable).toBe(true);
    expect(args.state.region).toBe("us-west-2");
    expect(args.assets.bucketName).toBe("assets.example.com");
    expect(args.assets.region).toBe("us-west-2");
    expect(args.dns.attachProductionDomains).toBe(true);
    expect(args.dns.attachStagingDomain).toBe(false);
    expect(args.dns.cloudflareZoneId).toBe("zone_123");
    expect(args.dns.stagingDomain).toBe("preview.example.com");
    expect(args.vercel.hubSpotAccountId).toBe("12345");
    expect(args.vercel.hubSpotFormGuid).toBe("form-guid");
    expect(args.vercel.sanityDataset).toBe("production");
    expect(args.vercel.sanityProjectId).toBe("sanity-id");
    expect(args.vercel.stagingBranch).toBe("develop");
    expect(args.vercel.teamId).toBe("team_123");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("onlyPreviewDeployments");
  });

  it("decodes optional Pulumi config shape", () => {
    const decoded = Effect.runSync(
      S.decodeUnknownEffect(OpipWebPulumiConfigValues)({
        attachProductionDomains: true,
        attachStagingDomain: false,
        createDynamoDbLockTable: true,
        pulumiStateBucketName: "opip-state",
      })
    );

    expect(decoded.attachProductionDomains).toBe(true);
    expect(decoded.attachStagingDomain).toBe(false);
    expect(decoded.createDynamoDbLockTable).toBe(true);
    expect(decoded.pulumiStateBucketName).toBe("opip-state");
  });
});
