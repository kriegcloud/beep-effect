/**
 * Setup requirement value objects: one checkable condition a lawyer's
 * workstation must meet, how it is repaired, and what a probe found.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit, Slug } from "@beep/schema";
import * as S from "effect/Schema";
import { LawPracticeText } from "../../entities/LawPracticeEntity.fields.ts";
import { PracticeCapability, PracticeProvider } from "../PracticeProfile/PracticeProfile.model.ts";

const $I = $LawPracticeDomainId.create("values/SetupRequirement/SetupRequirement.model");

/**
 * Stable kebab-case identifier of a setup requirement.
 *
 * **Example** (Decode a requirement id)
 *
 * ```ts
 * import { SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = S.decodeUnknownEffect(SetupRequirementId)("box-drive-signed-in")
 * Effect.runPromise(program).then(console.log)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SetupRequirementId = Slug.pipe(
  S.brand("SetupRequirementId"),
  $I.annoteSchema("SetupRequirementId", {
    description: "Stable kebab-case identifier of a setup requirement.",
  })
);

/**
 * Decoded type of {@link SetupRequirementId}.
 *
 * **Example** (Type a requirement id)
 *
 * ```ts
 * import type { SetupRequirementId } from "@beep/law-practice-domain"
 *
 * const describe = (id: SetupRequirementId): string => `requirement ${id}`
 * console.log(typeof describe)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SetupRequirementId = typeof SetupRequirementId.Type;

/**
 * A step only the lawyer can perform.
 *
 * **Details**
 *
 * Agents never create accounts or type credentials. These are the only
 * interruptions setup may ask of the lawyer, and the doctor batches them.
 *
 * **Example** (Check a human step)
 *
 * ```ts
 * import { HumanStep } from "@beep/law-practice-domain"
 *
 * console.log(HumanStep.is.consent("consent")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const HumanStep = LiteralKit([
  "sign-in",
  "consent",
  "password",
  "mfa",
  "admin-prompt",
  "reboot",
  "account-creation",
]).pipe(
  $I.annoteSchema("HumanStep", {
    description: "A step only the lawyer can perform during setup.",
  })
);

/**
 * Decoded type of {@link HumanStep}.
 *
 * **Example** (Type a human step)
 *
 * ```ts
 * import type { HumanStep } from "@beep/law-practice-domain"
 *
 * const step: HumanStep = "admin-prompt"
 * console.log(step)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HumanStep = typeof HumanStep.Type;

/**
 * A repair the gateway performs itself after the lawyer approves it.
 *
 * **Example** (Describe an automatic repair)
 *
 * ```ts
 * import { AutomaticRemediation } from "@beep/law-practice-domain"
 *
 * const repair = AutomaticRemediation.make({ summary: "Install Box Drive" })
 * console.log(repair.kind) // "automatic"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AutomaticRemediation extends S.Class<AutomaticRemediation>($I`AutomaticRemediation`)(
  {
    kind: S.tag("automatic"),
    summary: LawPracticeText.annotateKey({
      description: "Plain-language description of the repair, shown before approval.",
    }),
  },
  $I.annote("AutomaticRemediation", {
    description: "A repair the gateway performs after the lawyer approves it.",
  })
) {}

/**
 * A repair that needs the lawyer to act.
 *
 * **Example** (Ask the lawyer to sign in to Box Drive)
 *
 * ```ts
 * import { HumanRemediation } from "@beep/law-practice-domain"
 *
 * const repair = HumanRemediation.make({
 *   step: "sign-in",
 *   instruction: "Open Box Drive and sign in with your Box account.",
 * })
 * console.log(repair.kind) // "needs-human"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HumanRemediation extends S.Class<HumanRemediation>($I`HumanRemediation`)(
  {
    kind: S.tag("needs-human"),
    step: HumanStep.annotateKey({ description: "The kind of step the lawyer performs." }),
    instruction: LawPracticeText.annotateKey({
      description: "Plain-language instruction for the lawyer.",
    }),
  },
  $I.annote("HumanRemediation", {
    description: "A repair that needs the lawyer to act.",
  })
) {}

/**
 * How a requirement is repaired, discriminated on `kind`.
 *
 * **Example** (Branch on a remediation)
 *
 * ```ts
 * import { AutomaticRemediation, Remediation } from "@beep/law-practice-domain"
 *
 * const repair: Remediation = AutomaticRemediation.make({ summary: "Install Box Drive" })
 * console.log(Remediation.guards.automatic(repair)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Remediation = S.Union([AutomaticRemediation, HumanRemediation]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("Remediation", {
    description: "How a setup requirement is repaired.",
  })
);

/**
 * Decoded type of {@link Remediation}.
 *
 * **Example** (Type a human remediation)
 *
 * ```ts
 * import { HumanRemediation, type Remediation } from "@beep/law-practice-domain"
 *
 * const repair: Remediation = HumanRemediation.make({ step: "reboot", instruction: "Restart the computer." })
 * console.log(repair.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Remediation = typeof Remediation.Type;

/**
 * One checkable condition a lawyer's workstation must meet.
 *
 * **Details**
 *
 * The practice profile selects which requirements apply. Requirements form a
 * dependency graph through `dependsOn`; the doctor probes them in dependency
 * order. The probe itself is behavior and lives on the doctor service, not in
 * this data.
 *
 * **Example** (Require a Box Drive sign-in)
 *
 * ```ts
 * import { HumanRemediation, SetupRequirement, SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id = yield* S.decodeUnknownEffect(SetupRequirementId)("box-drive-signed-in")
 *   const installed = yield* S.decodeUnknownEffect(SetupRequirementId)("box-drive-installed")
 *   return SetupRequirement.make({
 *     id,
 *     capability: "documents",
 *     provider: "box-drive",
 *     dependsOn: [installed],
 *     remediation: HumanRemediation.make({
 *       step: "sign-in",
 *       instruction: "Open Box Drive and sign in with your Box account.",
 *     }),
 *     explain: "Box Drive must be signed in so your documents are available.",
 *   })
 * })
 * Effect.runPromise(program).then((requirement) => console.log(requirement.id))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SetupRequirement extends S.Class<SetupRequirement>($I`SetupRequirement`)(
  {
    id: SetupRequirementId.annotateKey({ description: "Stable identifier of the requirement." }),
    capability: PracticeCapability.annotateKey({ description: "The capability this requirement serves." }),
    provider: PracticeProvider.annotateKey({ description: "The provider adapter this requirement belongs to." }),
    dependsOn: S.Array(SetupRequirementId).annotateKey({
      description: "Requirements that must be satisfied before this one is probed.",
    }),
    remediation: Remediation.annotateKey({ description: "How the requirement is repaired." }),
    explain: LawPracticeText.annotateKey({
      description: "Plain-language reason the lawyer sees for this requirement.",
    }),
  },
  $I.annote("SetupRequirement", {
    description: "One checkable condition a lawyer's workstation must meet.",
  })
) {}

/**
 * The requirement holds.
 *
 * **Example** (Report a satisfied probe)
 *
 * ```ts
 * import { ProbeSatisfied } from "@beep/law-practice-domain"
 *
 * console.log(ProbeSatisfied.make({}).status) // "satisfied"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProbeSatisfied extends S.Class<ProbeSatisfied>($I`ProbeSatisfied`)(
  {
    status: S.tag("satisfied"),
  },
  $I.annote("ProbeSatisfied", {
    description: "The requirement holds.",
  })
) {}

/**
 * The requirement is not set up yet.
 *
 * **Example** (Report a missing install)
 *
 * ```ts
 * import { ProbeMissing } from "@beep/law-practice-domain"
 *
 * console.log(ProbeMissing.make({ detail: "Box Drive is not installed." }).status) // "missing"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProbeMissing extends S.Class<ProbeMissing>($I`ProbeMissing`)(
  {
    status: S.tag("missing"),
    detail: LawPracticeText.annotateKey({ description: "What is missing, in plain language." }),
  },
  $I.annote("ProbeMissing", {
    description: "The requirement is not set up yet.",
  })
) {}

/**
 * The requirement was set up but no longer works.
 *
 * **Example** (Report an expired sign-in)
 *
 * ```ts
 * import { ProbeBroken } from "@beep/law-practice-domain"
 *
 * console.log(ProbeBroken.make({ detail: "Your Microsoft 365 sign-in expired." }).status) // "broken"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProbeBroken extends S.Class<ProbeBroken>($I`ProbeBroken`)(
  {
    status: S.tag("broken"),
    detail: LawPracticeText.annotateKey({ description: "What broke, in plain language." }),
  },
  $I.annote("ProbeBroken", {
    description: "The requirement was set up but no longer works.",
  })
) {}

/**
 * What a probe found, discriminated on `status`.
 *
 * **Example** (Branch on a probe result)
 *
 * ```ts
 * import { ProbeResult, ProbeSatisfied } from "@beep/law-practice-domain"
 *
 * const result: ProbeResult = ProbeSatisfied.make({})
 * console.log(ProbeResult.guards.satisfied(result)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ProbeResult = S.Union([ProbeSatisfied, ProbeMissing, ProbeBroken]).pipe(
  S.toTaggedUnion("status"),
  $I.annoteSchema("ProbeResult", {
    description: "What a setup probe found.",
  })
);

/**
 * Decoded type of {@link ProbeResult}.
 *
 * **Example** (Type a missing result)
 *
 * ```ts
 * import { ProbeMissing, type ProbeResult } from "@beep/law-practice-domain"
 *
 * const result: ProbeResult = ProbeMissing.make({ detail: "Not installed." })
 * console.log(result.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ProbeResult = typeof ProbeResult.Type;

/**
 * A requirement the doctor probed, with what the probe found.
 *
 * **Example** (Record a probed requirement)
 *
 * ```ts
 * import { CheckProbed, ProbeSatisfied, SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.map(S.decodeUnknownEffect(SetupRequirementId)("box-drive-installed"), (id) =>
 *   CheckProbed.make({ requirement: id, result: ProbeSatisfied.make({}) })
 * )
 * Effect.runPromise(program).then((check) => console.log(check.state)) // "probed"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CheckProbed extends S.Class<CheckProbed>($I`CheckProbed`)(
  {
    state: S.tag("probed"),
    requirement: SetupRequirementId.annotateKey({ description: "The requirement that was probed." }),
    result: ProbeResult.annotateKey({ description: "What the probe found." }),
  },
  $I.annote("CheckProbed", {
    description: "A requirement the doctor probed, with what the probe found.",
  })
) {}

/**
 * A requirement the doctor did not probe because a dependency is not satisfied.
 *
 * **Example** (Record a blocked requirement)
 *
 * ```ts
 * import { CheckBlocked, SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const id = S.decodeUnknownEffect(SetupRequirementId)
 * const program = Effect.map(Effect.all([id("box-drive-signed-in"), id("box-drive-installed")]), ([requirement, dep]) =>
 *   CheckBlocked.make({ requirement, waitingOn: [dep] })
 * )
 * Effect.runPromise(program).then((check) => console.log(check.state)) // "blocked"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CheckBlocked extends S.Class<CheckBlocked>($I`CheckBlocked`)(
  {
    state: S.tag("blocked"),
    requirement: SetupRequirementId.annotateKey({ description: "The requirement that was not probed." }),
    waitingOn: S.NonEmptyArray(SetupRequirementId).annotateKey({
      description: "Unsatisfied requirements this one depends on.",
    }),
  },
  $I.annote("CheckBlocked", {
    description: "A requirement not probed because a dependency is not satisfied.",
  })
) {}

/**
 * The doctor's verdict for one requirement, discriminated on `state`.
 *
 * **Example** (Branch on a requirement check)
 *
 * ```ts
 * import { CheckProbed, ProbeSatisfied, RequirementCheck, SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.map(S.decodeUnknownEffect(SetupRequirementId)("practice-kg-ready"), (requirement) =>
 *   RequirementCheck.guards.probed(CheckProbed.make({ requirement, result: ProbeSatisfied.make({}) }))
 * )
 * Effect.runPromise(program).then(console.log) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RequirementCheck = S.Union([CheckProbed, CheckBlocked]).pipe(
  S.toTaggedUnion("state"),
  $I.annoteSchema("RequirementCheck", {
    description: "The doctor's verdict for one setup requirement.",
  })
);

/**
 * Decoded type of {@link RequirementCheck}.
 *
 * **Example** (Accept any check)
 *
 * ```ts
 * import type { RequirementCheck } from "@beep/law-practice-domain"
 *
 * const stateOf = (check: RequirementCheck) => check.state
 * console.log(typeof stateOf)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RequirementCheck = typeof RequirementCheck.Type;

/**
 * A step the lawyer must take, tied to the requirement it repairs.
 *
 * **Example** (Ask for a Microsoft 365 consent)
 *
 * ```ts
 * import { HumanRemediation, PendingHumanStep, SetupRequirementId } from "@beep/law-practice-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.map(S.decodeUnknownEffect(SetupRequirementId)("m365-consented"), (requirement) =>
 *   PendingHumanStep.make({
 *     requirement,
 *     remediation: HumanRemediation.make({ step: "consent", instruction: "Approve access to your mail and calendar." }),
 *   })
 * )
 * Effect.runPromise(program).then((step) => console.log(step.remediation.step)) // "consent"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PendingHumanStep extends S.Class<PendingHumanStep>($I`PendingHumanStep`)(
  {
    requirement: SetupRequirementId.annotateKey({ description: "The requirement the step repairs." }),
    remediation: HumanRemediation.annotateKey({ description: "What the lawyer must do." }),
  },
  $I.annote("PendingHumanStep", {
    description: "A step the lawyer must take, tied to the requirement it repairs.",
  })
) {}

/**
 * One doctor pass: a verdict per requirement in dependency order, the human
 * steps that can be asked for now, and whether setup is complete.
 *
 * **Details**
 *
 * The doctor keeps no state of its own: each pass re-probes the machine, so a
 * reboot mid-setup resumes from whatever is actually true. `humanSteps` only
 * lists steps whose requirements are probed and not satisfied, so every batch
 * is actionable.
 *
 * **Example** (A complete report)
 *
 * ```ts
 * import { SetupReport } from "@beep/law-practice-domain"
 *
 * const report = SetupReport.make({ checks: [], humanSteps: [], complete: true })
 * console.log(report.complete) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SetupReport extends S.Class<SetupReport>($I`SetupReport`)(
  {
    checks: S.Array(RequirementCheck).annotateKey({
      description: "A verdict per requirement, in dependency order.",
    }),
    humanSteps: S.Array(PendingHumanStep).annotateKey({
      description: "Human steps that can be asked for now, batched.",
    }),
    complete: S.Boolean.annotateKey({ description: "True when every requirement is satisfied." }),
  },
  $I.annote("SetupReport", {
    description: "One setup doctor pass over a practice's requirements.",
  })
) {}
