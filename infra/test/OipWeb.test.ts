import {
  makeOipWebStackArgsFromConfigValues,
  OipPulumiStateBackendConfig,
  OipWebPulumiConfigValues,
  OipWebStackArgs,
} from "@beep/infra";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("@beep/infra OipWeb", () => {
  it("applies production-safe defaults for OIP web infrastructure", () => {
    const args = makeOipWebStackArgsFromConfigValues();

    expect(args.state.bucketName).toBe("oip-law-pulumi-state");
    expect(args.state.createDynamoDbLockTable).toBe(false);
    expect(args.state.protect).toBe(true);
    expect(args.dns.attachProductionDomains).toBe(false);
    expect(args.dns.attachStagingDomain).toBe(true);
    expect(args.assets.bucketName).toBe("assets.oip.law");
    expect(args.assets.protect).toBe(true);
    expect(args.dns.productionDomain).toBe("oip.law");
    expect(args.dns.stagingDomain).toBe("staging.oip.law");
    expect(args.dns.vercelApexTarget).toBe("76.76.21.21");
    expect(args.dns.legacyProductionDomain).toBe("opip.law");
    expect(args.dns.legacyStagingDomain).toBe("staging.opip.law");
    expect(args.dns.legacyWwwDomain).toBe("www.opip.law");
    expect(args.vercel.projectName).toBe("oip-web");
    expect(args.vercel.repository).toBe("beep-effect/beep-effect");
    expect(args.vercel.rootDirectory).toBe("apps/oip-web");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("none");
  });

  it("maps Pulumi config overrides into state, DNS, and Vercel args", () => {
    const args = makeOipWebStackArgsFromConfigValues({
      assetsBucketName: "assets.example.com",
      attachProductionDomains: true,
      attachStagingDomain: false,
      awsRegion: "us-west-2",
      cloudflareZoneId: "zone_123",
      createDynamoDbLockTable: true,
      hubSpotAccountId: "12345",
      hubSpotFormGuid: "form-guid",
      legacyCloudflareZoneId: "legacy_zone_123",
      legacyProductionDnsRecordImportId: "legacy_zone_123/legacy_apex_record",
      legacyProductionDomain: "old.example.com",
      legacyStagingDomain: "old-preview.example.com",
      legacyWwwDnsRecordImportId: "legacy_zone_123/legacy_www_record",
      legacyWwwDomain: "www.old.example.com",
      productionDnsRecordImportId: "zone_123/apex_record",
      pulumiStateBucketName: "example-pulumi-state",
      sanityDataset: "production",
      sanityProjectId: "sanity-id",
      stagingBranch: "develop",
      stagingDomain: "preview.example.com",
      vercelApexTarget: "192.0.2.1",
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
    expect(args.dns.legacyCloudflareZoneId).toBe("legacy_zone_123");
    expect(args.dns.legacyProductionDnsRecordImportId).toBe("legacy_zone_123/legacy_apex_record");
    expect(args.dns.legacyProductionDomain).toBe("old.example.com");
    expect(args.dns.legacyStagingDomain).toBe("old-preview.example.com");
    expect(args.dns.legacyWwwDnsRecordImportId).toBe("legacy_zone_123/legacy_www_record");
    expect(args.dns.legacyWwwDomain).toBe("www.old.example.com");
    expect(args.dns.productionDnsRecordImportId).toBe("zone_123/apex_record");
    expect(args.dns.stagingDomain).toBe("preview.example.com");
    expect(args.dns.vercelApexTarget).toBe("192.0.2.1");
    expect(args.vercel.hubSpotAccountId).toBe("12345");
    expect(args.vercel.hubSpotFormGuid).toBe("form-guid");
    expect(args.vercel.sanityDataset).toBe("production");
    expect(args.vercel.sanityProjectId).toBe("sanity-id");
    expect(args.vercel.stagingBranch).toBe("develop");
    expect(args.vercel.teamId).toBe("team_123");
    expect(args.vercel.vercelAuthenticationDeploymentType).toBe("onlyPreviewDeployments");
  });

  it("derives lock table defaults from custom state bucket names", () => {
    const state = OipPulumiStateBackendConfig.make({
      bucketName: "custom-pulumi-state",
      createDynamoDbLockTable: true,
    });
    const args = OipWebStackArgs.make({ state });

    expect(state.lockTableName).toBe("custom-pulumi-state-locks");
    expect(args.state.lockTableName).toBe("custom-pulumi-state-locks");
  });

  it("decodes optional Pulumi config shape", () => {
    const decoded = Effect.runSync(
      S.decodeUnknownEffect(OipWebPulumiConfigValues)({
        attachProductionDomains: true,
        attachStagingDomain: false,
        createDynamoDbLockTable: true,
        productionDnsRecordImportId: "zone_123/apex_record",
        pulumiStateBucketName: "oip-state",
      })
    );

    expect(decoded.attachProductionDomains).toBe(true);
    expect(decoded.attachStagingDomain).toBe(false);
    expect(decoded.createDynamoDbLockTable).toBe(true);
    expect(decoded.productionDnsRecordImportId).toBe("zone_123/apex_record");
    expect(decoded.pulumiStateBucketName).toBe("oip-state");
  });
});
