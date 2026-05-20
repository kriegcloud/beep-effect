import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const scenarios = ["law-patent-intake", "wealth-cash-request"];

const requiredJsonFiles = [
  "seed.json",
  "input.email.json",
  "expected.claims.json",
  "expected.tasks.json",
  "expected.drafts.json",
  "expected.approval-gates.json",
  "expected.context-packet.json",
];

const expectedSchemaVersions = {
  "expected.approval-gates.json": "runtime-data-loop.expected.approval-gates.v1",
  "expected.claims.json": "runtime-data-loop.expected.claims.v1",
  "expected.context-packet.json": "runtime-data-loop.expected.context-packet.v1",
  "expected.drafts.json": "runtime-data-loop.expected.drafts.v1",
  "expected.tasks.json": "runtime-data-loop.expected.tasks.v1",
};

const parseJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const assertRecord = (scenario, label, value) => {
  if (!isRecord(value)) {
    throw new Error(`${scenario}/${label}: expected object`);
  }
};

const assertArray = (scenario, label, value) => {
  if (!Array.isArray(value)) {
    throw new Error(`${scenario}/${label}: expected array`);
  }
};

const assertString = (scenario, label, value) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${scenario}/${label}: expected non-empty string`);
  }
};

const assertEnvelope = (scenario, fileName, value) => {
  assertRecord(scenario, fileName, value);
  assertString(scenario, `${fileName}.scenarioId`, value.scenarioId);
  assertString(scenario, `${fileName}.schemaVersion`, value.schemaVersion);

  if (value.scenarioId !== scenario) {
    throw new Error(`${scenario}/${fileName}: scenarioId ${value.scenarioId} does not match directory`);
  }

  if (value.schemaVersion !== expectedSchemaVersions[fileName]) {
    throw new Error(`${scenario}/${fileName}: unexpected schemaVersion ${value.schemaVersion}`);
  }
};

const extractSpanIds = (body) => {
  const matches = body.matchAll(/\[span:([a-z0-9-]+)]/g);
  return new Set(Array.from(matches, (match) => match[1]));
};

const collectSpanRefs = (value, refs = []) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSpanRefs(item, refs);
    }
    return refs;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "spanId" && typeof child === "string") {
        refs.push(child);
        continue;
      }

      if (key === "spanIds" && Array.isArray(child)) {
        for (const spanId of child) {
          if (typeof spanId === "string") {
            refs.push(spanId);
          }
        }
        continue;
      }

      if (key === "spanRefs" && Array.isArray(child)) {
        for (const spanRef of child) {
          if (spanRef && typeof spanRef === "object" && typeof spanRef.spanId === "string") {
            refs.push(spanRef.spanId);
          }
        }
        continue;
      }

      collectSpanRefs(child, refs);
    }
  }

  return refs;
};

const evidenceSpanIds = (evidence) => [
  ...(typeof evidence.spanId === "string" ? [evidence.spanId] : []),
  ...(Array.isArray(evidence.spanIds) ? evidence.spanIds.filter((spanId) => typeof spanId === "string") : []),
];

const assertEvidence = (scenario, label, evidence, sourceArtifactSpans) => {
  assertArray(scenario, label, evidence);

  for (const [index, ref] of evidence.entries()) {
    assertRecord(scenario, `${label}[${index}]`, ref);
    assertString(scenario, `${label}[${index}].artifactId`, ref.artifactId);

    const spanIds = evidenceSpanIds(ref);
    if (spanIds.length === 0) {
      throw new Error(`${scenario}/${label}[${index}]: evidence must reference spanId or spanIds`);
    }

    const knownSpans = sourceArtifactSpans.get(ref.artifactId);
    if (knownSpans === undefined) {
      throw new Error(`${scenario}/${label}[${index}]: unknown artifact ${ref.artifactId}`);
    }

    for (const spanId of spanIds) {
      if (!knownSpans.has(spanId)) {
        throw new Error(`${scenario}/${label}[${index}]: unknown span ${ref.artifactId}#${spanId}`);
      }
    }
  }
};

const assertOrderedRefs = (scenario, label, actual, expected) => {
  assertArray(scenario, label, actual);

  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`${scenario}/${label}: references do not match candidate outputs`);
  }
};

const collectSourceArtifactSpans = (scenario, contextPacket) => {
  assertArray(scenario, "expected.context-packet.json.sourceArtifacts", contextPacket.sourceArtifacts);

  return new Map(
    contextPacket.sourceArtifacts.map((artifact, index) => {
      assertRecord(scenario, `expected.context-packet.json.sourceArtifacts[${index}]`, artifact);
      assertString(scenario, `expected.context-packet.json.sourceArtifacts[${index}].artifactId`, artifact.artifactId);
      assertArray(scenario, `expected.context-packet.json.sourceArtifacts[${index}].spanRefs`, artifact.spanRefs);

      const spanIds = artifact.spanRefs.map((spanRef, spanIndex) => {
        assertRecord(
          scenario,
          `expected.context-packet.json.sourceArtifacts[${index}].spanRefs[${spanIndex}]`,
          spanRef
        );
        assertString(
          scenario,
          `expected.context-packet.json.sourceArtifacts[${index}].spanRefs[${spanIndex}].spanId`,
          spanRef.spanId
        );
        return spanRef.spanId;
      });

      return [artifact.artifactId, new Set(spanIds)];
    })
  );
};

const assertCandidateContracts = (scenario, fixtures) => {
  const contextPacket = fixtures["expected.context-packet.json"];
  const claims = fixtures["expected.claims.json"].claims;
  const tasks = fixtures["expected.tasks.json"].tasks;
  const candidateProject = fixtures["expected.tasks.json"].candidateProject;
  const drafts = fixtures["expected.drafts.json"].drafts;
  const approvalGates = fixtures["expected.approval-gates.json"].approvalGates;
  const sourceArtifactSpans = collectSourceArtifactSpans(scenario, contextPacket);

  assertArray(scenario, "expected.context-packet.json.principals", contextPacket.principals);
  assertArray(scenario, "expected.claims.json.claims", claims);
  assertRecord(scenario, "expected.tasks.json.candidateProject", candidateProject);
  assertArray(scenario, "expected.tasks.json.tasks", tasks);
  assertArray(scenario, "expected.drafts.json.drafts", drafts);
  assertArray(scenario, "expected.approval-gates.json.approvalGates", approvalGates);

  const principals = new Set(contextPacket.principals);
  const candidateIds = new Set([
    ...claims.map((claim) => claim.claimId),
    ...tasks.map((task) => task.taskId),
    ...drafts.map((draft) => draft.draftId),
  ]);

  assertOrderedRefs(
    scenario,
    "expected.context-packet.json.candidateClaims",
    contextPacket.candidateClaims,
    claims.map((claim) => claim.claimId)
  );
  assertOrderedRefs(
    scenario,
    "expected.context-packet.json.candidateTasks",
    contextPacket.candidateTasks,
    tasks.map((task) => task.taskId)
  );
  assertOrderedRefs(
    scenario,
    "expected.context-packet.json.candidateDrafts",
    contextPacket.candidateDrafts,
    drafts.map((draft) => draft.draftId)
  );
  assertOrderedRefs(
    scenario,
    "expected.context-packet.json.approvalGates",
    contextPacket.approvalGates,
    approvalGates.map((gate) => gate.approvalGateId)
  );

  claims.forEach((claim, index) => {
    assertString(scenario, `expected.claims.json.claims[${index}].producedByPrincipalId`, claim.producedByPrincipalId);
    if (!principals.has(claim.producedByPrincipalId)) {
      throw new Error(
        `${scenario}/expected.claims.json.claims[${index}]: unknown producer ${claim.producedByPrincipalId}`
      );
    }
    assertEvidence(scenario, `expected.claims.json.claims[${index}].evidence`, claim.evidence, sourceArtifactSpans);
  });

  assertEvidence(
    scenario,
    "expected.tasks.json.candidateProject.evidence",
    candidateProject.evidence,
    sourceArtifactSpans
  );
  tasks.forEach((task, index) => {
    assertString(scenario, `expected.tasks.json.tasks[${index}].assigneePrincipalId`, task.assigneePrincipalId);
    if (!principals.has(task.assigneePrincipalId)) {
      throw new Error(`${scenario}/expected.tasks.json.tasks[${index}]: unknown assignee ${task.assigneePrincipalId}`);
    }
    assertEvidence(scenario, `expected.tasks.json.tasks[${index}].evidence`, task.evidence, sourceArtifactSpans);
  });

  drafts.forEach((draft, index) => {
    assertString(scenario, `expected.drafts.json.drafts[${index}].producedByPrincipalId`, draft.producedByPrincipalId);
    if (!principals.has(draft.producedByPrincipalId)) {
      throw new Error(
        `${scenario}/expected.drafts.json.drafts[${index}]: unknown producer ${draft.producedByPrincipalId}`
      );
    }
    assertEvidence(scenario, `expected.drafts.json.drafts[${index}].evidence`, draft.evidence, sourceArtifactSpans);
  });

  approvalGates.forEach((gate, index) => {
    assertString(
      scenario,
      `expected.approval-gates.json.approvalGates[${index}].reviewerPrincipalId`,
      gate.reviewerPrincipalId
    );
    if (!principals.has(gate.reviewerPrincipalId)) {
      throw new Error(
        `${scenario}/expected.approval-gates.json.approvalGates[${index}]: unknown reviewer ${gate.reviewerPrincipalId}`
      );
    }
    assertArray(scenario, `expected.approval-gates.json.approvalGates[${index}].candidateRefs`, gate.candidateRefs);
    for (const candidateRef of gate.candidateRefs) {
      if (!candidateIds.has(candidateRef)) {
        throw new Error(
          `${scenario}/expected.approval-gates.json.approvalGates[${index}]: unknown candidate ref ${candidateRef}`
        );
      }
    }
    assertEvidence(
      scenario,
      `expected.approval-gates.json.approvalGates[${index}].evidence`,
      gate.evidence,
      sourceArtifactSpans
    );
  });
};

for (const scenario of scenarios) {
  const scenarioRoot = join(root, scenario);
  const body = await readFile(join(scenarioRoot, "body.md"), "utf8");
  const spanIds = extractSpanIds(body);
  const fixtures = {};

  if (spanIds.size === 0) {
    throw new Error(`${scenario}: body.md does not define any spans`);
  }

  for (const fileName of requiredJsonFiles) {
    const parsed = await parseJson(join(scenarioRoot, fileName));
    fixtures[fileName] = parsed;

    if (fileName.startsWith("expected.")) {
      assertEnvelope(scenario, fileName, parsed);
    }
  }

  for (const fileName of requiredJsonFiles.filter((fileName) => fileName.startsWith("expected."))) {
    const json = fixtures[fileName];
    const refs = collectSpanRefs(json);
    const missing = refs.filter((spanId) => !spanIds.has(spanId));

    if (missing.length > 0) {
      throw new Error(`${scenario}/${fileName}: unknown span refs: ${missing.join(", ")}`);
    }
  }

  assertCandidateContracts(scenario, fixtures);
}

console.log(`Validated ${scenarios.length} runtime data loop fixture scenarios.`);
