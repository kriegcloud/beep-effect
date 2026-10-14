import {
  AutomaticRemediation,
  CheckBlocked,
  CheckProbed,
  HumanRemediation,
  PendingHumanStep,
  ProbeMissing,
  ProbeSatisfied,
  SetupReport,
  SetupRequirementId,
} from "@beep/law-practice-domain";
import { requirementFromCatalog } from "@beep/practice-gateway/Requirements";
import { repairableRequirements, SetupToolkit, summarizeReport } from "@beep/practice-gateway/SetupTools";
import { describe, expect, it } from "@effect/vitest";
import * as R from "effect/Record";

const id = SetupRequirementId.make;

describe("setup tools", () => {
  it("serves exactly the five designed tools", () => {
    expect(R.keys(SetupToolkit.tools)).toEqual([
      "setup_onboarding_guide",
      "setup_profile_get",
      "setup_profile_save",
      "setup_status",
      "setup_repair",
    ]);
  });

  it("summarizes passing checks, the lawyer's steps, approvable repairs and blocked checks", () => {
    const requirements = [
      requirementFromCatalog("claude-signed-in", "workstation"),
      requirementFromCatalog("box-drive-installed", "documents"),
      requirementFromCatalog("box-drive-signed-in", "documents"),
      requirementFromCatalog("bitlocker-on", "workstation"),
    ];
    const signIn = HumanRemediation.make({ step: "sign-in", instruction: "Open Claude and sign in." });
    const report = SetupReport.make({
      checks: [
        CheckProbed.make({ requirement: id("claude-signed-in"), result: ProbeMissing.make({ detail: "no session" }) }),
        CheckProbed.make({ requirement: id("box-drive-installed"), result: ProbeMissing.make({ detail: "absent" }) }),
        CheckBlocked.make({ requirement: id("box-drive-signed-in"), waitingOn: [id("box-drive-installed")] }),
        CheckProbed.make({ requirement: id("bitlocker-on"), result: ProbeSatisfied.make({}) }),
      ],
      humanSteps: [PendingHumanStep.make({ requirement: id("claude-signed-in"), remediation: signIn })],
      complete: false,
    });
    expect(summarizeReport(report, requirements)).toBe(
      [
        "1 of 4 checks pass.",
        "You need to: Open Claude and sign in.",
        `I can do this for you once you approve it: ${AutomaticRemediation.make({ summary: "Install Box Drive for your Windows account." }).summary}`,
        "1 more checks wait on the steps above.",
      ].join("\n")
    );
  });

  it("lists only unsatisfied automatic repairs whose dependencies hold as repairable", () => {
    const requirements = [
      requirementFromCatalog("box-drive-installed", "documents"),
      requirementFromCatalog("m365-consented", "mail-calendar"),
      requirementFromCatalog("bitlocker-on", "workstation"),
    ];
    const report = SetupReport.make({
      checks: [
        CheckProbed.make({ requirement: id("box-drive-installed"), result: ProbeSatisfied.make({}) }),
        CheckProbed.make({ requirement: id("m365-consented"), result: ProbeMissing.make({ detail: "not connected" }) }),
        CheckProbed.make({ requirement: id("bitlocker-on"), result: ProbeMissing.make({ detail: "off" }) }),
      ],
      humanSteps: [],
      complete: false,
    });
    expect(repairableRequirements(report, requirements).map((requirement) => requirement.id)).toEqual([
      "m365-consented",
    ]);
  });

  it("calls a complete report complete", () => {
    expect(summarizeReport([])(SetupReport.make({ checks: [], humanSteps: [], complete: true }))).toBe(
      "Setup is complete: all 0 checks pass."
    );
  });
});
