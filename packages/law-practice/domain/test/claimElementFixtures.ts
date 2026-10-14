/**
 * Synthetic rule fixtures for the claim-element decomposer and antecedent policy.
 *
 * Every claim text here is written for the test; none comes from a client
 * document or the corpus. Expected trees and findings are built through the
 * schema constructors, with anchors located by quote in the claim text, so
 * they do not reuse the decomposer's own scanning.
 */

import {
  AntecedentFinding,
  AntecedentRuleId,
  ClaimElement,
  ClaimElementEdge,
  ClaimElementPath,
  ClaimElementTree,
  ClaimTerm,
  ClaimTermRef,
} from "@beep/law-practice-domain/values/ClaimElement";
import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument";
import { TextAnchor } from "@beep/provenance/TextAnchor";
import * as A from "effect/Array";
import type {
  ClaimDecompositionReason,
  ClaimElementKind,
  ClaimTermDeterminer,
} from "@beep/law-practice-domain/values/ClaimElement";
import type { PatentClaims } from "@beep/law-practice-domain/values/PatentDocument";

type RuleFixture = {
  readonly id: string;
  readonly rule: string;
  /** Claim set the decomposer reads each claim against. */
  readonly context: PatentClaims;
  /** Claim set the policy reads; usually the same as `context`. */
  readonly claims: PatentClaims;
  /** Expected decomposer output, one tree per decomposed claim; also the policy's input. */
  readonly trees: ReadonlyArray<ClaimElementTree>;
  readonly findings: ReadonlyArray<AntecedentFinding>;
};

type FailureFixture = {
  readonly id: string;
  readonly rule: string;
  readonly claim: PatentClaim;
  readonly claims: PatentClaims;
  readonly reason: ClaimDecompositionReason;
};

const independent = (claimNumber: number, preamble: string, transition: "comprising", body: string): PatentClaim =>
  PatentClaim.cases.independent.make({
    claimNumber,
    claimText: `${preamble} ${transition}: ${body}`,
    preamble,
    transition,
    body,
  });

const dependent = (
  claimNumber: number,
  claimReferences: readonly [number, ...Array<number>],
  preamble: string,
  body: string
): PatentClaim =>
  PatentClaim.cases.dependent.make({
    claimNumber,
    claimReferences,
    claimText: `${preamble} wherein ${body}`,
    preamble,
    transition: "wherein",
    body,
  });

const path = (elementPath: string): ClaimElementPath => ClaimElementPath.make(elementPath);

// Anchors are located by quote; `occurrence` picks a repeated quote.
const anchorsIn = ({ claimText }: PatentClaim) => {
  const anchor = (quote: string, occurrence = 0): TextAnchor => {
    const startChar = A.reduce(A.replicate(0, occurrence + 1), -1, (from) => claimText.indexOf(quote, from + 1));
    return TextAnchor.make({ startChar, endChar: startChar + quote.length, quote });
  };
  return {
    term: (quote: string, determiner: ClaimTermDeterminer, head: string, occurrence = 0): ClaimTerm =>
      ClaimTerm.make({ anchor: anchor(quote, occurrence), determiner, head }),
    element: (
      elementPath: string,
      kind: ClaimElementKind,
      quote: string,
      terms: ReadonlyArray<ClaimTerm>,
      occurrence = 0
    ): ClaimElement => ClaimElement.make({ path: path(elementPath), anchor: anchor(quote, occurrence), kind, terms }),
    ref: (elementPath: string, quote: string, occurrence = 0): ClaimTermRef =>
      ClaimTermRef.make({ path: path(elementPath), anchor: anchor(quote, occurrence) }),
  };
};

const partOf = (child: string, parent: string): ClaimElementEdge =>
  ClaimElementEdge.cases["part-of"].make({ child: path(child), parent: path(parent) });

const dependsOn = (dependentPath: string, ancestor: string): ClaimElementEdge =>
  ClaimElementEdge.cases["depends-on-element"].make({ dependent: path(dependentPath), ancestor: path(ancestor) });

const antecedent = (referring: ClaimTermRef, introducing: ClaimTermRef): ClaimElementEdge =>
  ClaimElementEdge.cases.antecedent.make({ referring, introducing });

const tree = (
  claimNumber: number,
  elements: readonly [ClaimElement, ...Array<ClaimElement>],
  edges: ReadonlyArray<ClaimElementEdge>
): ClaimElementTree => ClaimElementTree.make({ claimNumber, producer: "rule", elements, edges });

const ruleId = (id: string): AntecedentRuleId => AntecedentRuleId.make(id);

const finding = {
  missing: (referring: ClaimTermRef, chain: readonly [number, ...Array<number>]): AntecedentFinding =>
    AntecedentFinding.cases["missing-antecedent"].make({
      rule: ruleId("definite-without-introduction"),
      referring,
      chain,
    }),
  ambiguous: (
    rule: string,
    referring: ClaimTermRef,
    chain: readonly [number, ...Array<number>],
    candidates: readonly [ClaimTermRef, ClaimTermRef, ...Array<ClaimTermRef>]
  ): AntecedentFinding =>
    AntecedentFinding.cases["ambiguous-antecedent"].make({ rule: ruleId(rule), referring, chain, candidates }),
  numberMismatch: (
    referring: ClaimTermRef,
    chain: readonly [number, ...Array<number>],
    introducing: ClaimTermRef
  ): AntecedentFinding =>
    AntecedentFinding.cases["number-mismatch"].make({
      rule: ruleId("determiner-number-mismatch"),
      referring,
      chain,
      introducing,
    }),
  outsideChain: (
    referring: ClaimTermRef,
    chain: readonly [number, ...Array<number>],
    introducing: ClaimTermRef
  ): AntecedentFinding =>
    AntecedentFinding.cases["antecedent-outside-chain"].make({
      rule: ruleId("outside-chain"),
      referring,
      chain,
      introducing,
    }),
  uncovered: (rule: string, referring: ClaimTermRef): AntecedentFinding =>
    AntecedentFinding.cases["pattern-not-covered"].make({ rule: ruleId(rule), referring }),
};

/** A claim whose body introduces each term once and refers back to it once. */
const definiteFixture = (
  id: string,
  rule: string,
  body: string,
  limitations: (
    at: ReturnType<typeof anchorsIn>
  ) => readonly [ReadonlyArray<ClaimElement>, ReadonlyArray<ClaimElementEdge>],
  findings: (at: ReturnType<typeof anchorsIn>) => ReadonlyArray<AntecedentFinding> = () => []
): RuleFixture => {
  const claim = independent(1, "A system", "comprising", body);
  const at = anchorsIn(claim);
  const [elements, edges] = limitations(at);
  return {
    id,
    rule,
    context: [claim],
    claims: [claim],
    trees: [
      tree(
        1,
        [at.element("1", "preamble-subject", "A system", [at.term("A system", "a", "system")]), ...elements],
        edges
      ),
    ],
    findings: findings(at),
  };
};

// Shared claims. "A system comprising: a sensor; and a controller coupled to the sensor."
const systemClaim = independent(1, "A system", "comprising", "a sensor; and a controller coupled to the sensor.");
const system = anchorsIn(systemClaim);
const systemTree = tree(
  1,
  [
    system.element("1", "preamble-subject", "A system", [system.term("A system", "a", "system")]),
    system.element("1.a", "limitation", "a sensor", [system.term("a sensor", "a", "sensor")]),
    system.element("1.b", "limitation", "a controller coupled to the sensor", [
      system.term("a controller", "a", "controller"),
      system.term("the sensor", "the", "sensor"),
    ]),
  ],
  [partOf("1.a", "1"), partOf("1.b", "1"), antecedent(system.ref("1.b", "the sensor"), system.ref("1.a", "a sensor"))]
);

// "A system comprising: a sensor."
const sensorClaim = independent(1, "A system", "comprising", "a sensor.");
const sensor = anchorsIn(sensorClaim);
const sensorTree = tree(
  1,
  [
    sensor.element("1", "preamble-subject", "A system", [sensor.term("A system", "a", "system")]),
    sensor.element("1.a", "limitation", "a sensor", [sensor.term("a sensor", "a", "sensor")]),
  ],
  [partOf("1.a", "1")]
);

// "A camera comprising: a housing; and a sensor mounted in the housing."
const cameraClaim = independent(1, "A camera", "comprising", "a housing; and a sensor mounted in the housing.");
const camera = anchorsIn(cameraClaim);
const cameraTree = tree(
  1,
  [
    camera.element("1", "preamble-subject", "A camera", [camera.term("A camera", "a", "camera")]),
    camera.element("1.a", "limitation", "a housing", [camera.term("a housing", "a", "housing")]),
    camera.element("1.b", "limitation", "a sensor mounted in the housing", [
      camera.term("a sensor", "a", "sensor"),
      camera.term("the housing", "the", "housing"),
    ]),
  ],
  [partOf("1.a", "1"), partOf("1.b", "1"), antecedent(camera.ref("1.b", "the housing"), camera.ref("1.a", "a housing"))]
);

// "The camera of claim 1, wherein the housing includes a lens."
const lensClaim = dependent(2, [1], "The camera of claim 1,", "the housing includes a lens.");
const lens = anchorsIn(lensClaim);
const lensTree = tree(
  2,
  [
    lens.element("2", "preamble-subject", "The camera of claim 1", [lens.term("The camera", "the", "camera")]),
    lens.element("2.a", "limitation", "the housing includes a lens", [
      lens.term("the housing", "the", "housing"),
      lens.term("a lens", "a", "lens"),
    ]),
  ],
  [partOf("2.a", "2"), dependsOn("2", "1")]
);

/** A dependent claim reciting only "the lens is tinted." */
const tintedLens = (claimNumber: number, claimReferences: readonly [number, ...Array<number>], subject: string) => {
  const claim = dependent(claimNumber, claimReferences, `${subject},`, "the lens is tinted.");
  const at = anchorsIn(claim);
  const root = `${claimNumber}`;
  const limitation = `${root}.a`;
  return {
    claim,
    lensRef: at.ref(limitation, "the lens"),
    tree: tree(
      claimNumber,
      [
        at.element(root, "preamble-subject", subject, [at.term("The camera", "the", "camera")]),
        at.element(limitation, "limitation", "the lens is tinted", [at.term("the lens", "the", "lens")]),
      ],
      [partOf(limitation, root), ...A.map(claimReferences, (reference) => dependsOn(root, `${reference}`))]
    ),
  };
};

const fixture8 = (() => {
  const claim = dependent(2, [1], "The system of claim 1,", "the sensor is optical.");
  const at = anchorsIn(claim);
  return {
    id: "8",
    rule: "dependent resolution",
    context: [systemClaim, claim],
    claims: [systemClaim, claim],
    trees: [
      systemTree,
      tree(
        2,
        [
          at.element("2", "preamble-subject", "The system of claim 1", [at.term("The system", "the", "system")]),
          at.element("2.a", "limitation", "the sensor is optical", [at.term("the sensor", "the", "sensor")]),
        ],
        [partOf("2.a", "2"), dependsOn("2", "1")]
      ),
    ],
    findings: [],
  } satisfies RuleFixture;
})();

const fixture9 = (() => {
  const multiple = tintedLens(3, [1, 2], "The camera of claim 1 or 2");
  return {
    id: "9",
    rule: "multiple dependent",
    context: [cameraClaim, lensClaim, multiple.claim],
    claims: [cameraClaim, lensClaim, multiple.claim],
    trees: [cameraTree, lensTree, multiple.tree],
    findings: [finding.outsideChain(multiple.lensRef, [3, 1], lens.ref("2.a", "a lens"))],
  } satisfies RuleFixture;
})();

const fixture10 = (() => {
  const sibling = tintedLens(3, [1], "The camera of claim 1");
  return {
    id: "10",
    rule: "outside chain",
    context: [cameraClaim, lensClaim, sibling.claim],
    claims: [cameraClaim, lensClaim, sibling.claim],
    trees: [cameraTree, lensTree, sibling.tree],
    findings: [finding.outsideChain(sibling.lensRef, [3, 1], lens.ref("2.a", "a lens"))],
  } satisfies RuleFixture;
})();

const fixture11 = (() => {
  const claim = dependent(2, [1], "The system of claim 1,", "the system is portable.");
  const at = anchorsIn(claim);
  return {
    id: "11",
    rule: "preamble subject",
    context: [sensorClaim, claim],
    claims: [sensorClaim, claim],
    trees: [
      sensorTree,
      tree(
        2,
        [
          at.element("2", "preamble-subject", "The system of claim 1", [at.term("The system", "the", "system")]),
          at.element("2.a", "limitation", "the system is portable", [at.term("the system", "the", "system")]),
        ],
        [partOf("2.a", "2"), dependsOn("2", "1")]
      ),
    ],
    findings: [],
  } satisfies RuleFixture;
})();

const fixture14 = (() => {
  const claim = dependent(2, [1], "The system according to the claim 1,", "the sensor is optical.");
  const at = anchorsIn(claim);
  return {
    id: "14",
    rule: "claim-reference",
    context: [sensorClaim, claim],
    claims: [sensorClaim, claim],
    trees: [
      sensorTree,
      tree(
        2,
        [
          at.element("2", "preamble-subject", "The system according to the claim 1", [
            at.term("The system", "the", "system"),
          ]),
          at.element("2.a", "limitation", "the sensor is optical", [at.term("the sensor", "the", "sensor")]),
        ],
        [partOf("2.a", "2"), dependsOn("2", "1")]
      ),
    ],
    findings: [],
  } satisfies RuleFixture;
})();

const fixture15 = (() => {
  const claim = independent(9, "A lamp", "comprising", "a bulb; and a switch wired to the bulb.");
  const at = anchorsIn(claim);
  return {
    id: "15",
    rule: "tree-without-claim",
    context: [claim],
    claims: [sensorClaim],
    trees: [
      tree(
        9,
        [
          at.element("9", "preamble-subject", "A lamp", [at.term("A lamp", "a", "lamp")]),
          at.element("9.a", "limitation", "a bulb", [at.term("a bulb", "a", "bulb")]),
          at.element("9.b", "limitation", "a switch wired to the bulb", [
            at.term("a switch", "a", "switch"),
            at.term("the bulb", "the", "bulb"),
          ]),
        ],
        [partOf("9.a", "9"), partOf("9.b", "9"), antecedent(at.ref("9.b", "the bulb"), at.ref("9.a", "a bulb"))]
      ),
    ],
    findings: [finding.uncovered("tree-without-claim", at.ref("9.b", "the bulb"))],
  } satisfies RuleFixture;
})();

const fixture16 = (() => {
  const chained = tintedLens(3, [2], "The camera of claim 2");
  return {
    id: "16",
    rule: "chain-through-undecomposed",
    context: [cameraClaim, lensClaim, chained.claim],
    claims: [cameraClaim, lensClaim, chained.claim],
    trees: [cameraTree, chained.tree],
    findings: [finding.uncovered("chain-through-undecomposed", chained.lensRef)],
  } satisfies RuleFixture;
})();

const fixture16b = (() => {
  const cooled = dependent(3, [1], "The camera of claim 1,", "the sensor is cooled.");
  const multiple = tintedLens(4, [2, 3], "The camera of claim 2 or 3");
  return {
    id: "16b",
    rule: "chain-through-undecomposed, two chains report once",
    context: [cameraClaim, lensClaim, cooled, multiple.claim],
    claims: [cameraClaim, lensClaim, cooled, multiple.claim],
    trees: [cameraTree, multiple.tree],
    findings: [finding.uncovered("chain-through-undecomposed", multiple.lensRef)],
  } satisfies RuleFixture;
})();

const fixture21 = (() => {
  const portable = dependent(2, [1], "The system of claim 1,", "the system is portable.");
  const claim = dependent(3, [2], "The system of claim 2,", "the sensor is optical.");
  const at = anchorsIn(claim);
  return {
    id: "21",
    rule: "chain-unresolvable",
    context: [sensorClaim, portable, claim],
    claims: [sensorClaim, claim],
    trees: [
      sensorTree,
      tree(
        3,
        [
          at.element("3", "preamble-subject", "The system of claim 2", [at.term("The system", "the", "system")]),
          at.element("3.a", "limitation", "the sensor is optical", [at.term("the sensor", "the", "sensor")]),
        ],
        [partOf("3.a", "3"), dependsOn("3", "2")]
      ),
    ],
    findings: [
      finding.uncovered("chain-unresolvable", at.ref("3", "The system")),
      finding.uncovered("chain-unresolvable", at.ref("3.a", "the sensor")),
    ],
  } satisfies RuleFixture;
})();

/**
 * One fixture per rule of the P2 design table (1–20 plus 18b), with the
 * decomposition-failure rules 19 and 20 in {@link failureFixtures}, and the
 * extra fixtures 16b (identical uncovered findings collapse) and 21
 * (`chain-unresolvable`).
 */
export const ruleFixtures: ReadonlyArray<RuleFixture> = [
  {
    id: "1",
    rule: "basic resolution",
    context: [systemClaim],
    claims: [systemClaim],
    trees: [systemTree],
    findings: [],
  },
  definiteFixture("2", "said", "a sensor; and a controller coupled to said sensor.", (at) => [
    [
      at.element("1.a", "limitation", "a sensor", [at.term("a sensor", "a", "sensor")]),
      at.element("1.b", "limitation", "a controller coupled to said sensor", [
        at.term("a controller", "a", "controller"),
        at.term("said sensor", "said", "sensor"),
      ]),
    ],
    [partOf("1.a", "1"), partOf("1.b", "1"), antecedent(at.ref("1.b", "said sensor"), at.ref("1.a", "a sensor"))],
  ]),
  definiteFixture(
    "3",
    "definite-without-introduction",
    "a sensor; and a controller mounted in the housing.",
    (at) => [
      [
        at.element("1.a", "limitation", "a sensor", [at.term("a sensor", "a", "sensor")]),
        at.element("1.b", "limitation", "a controller mounted in the housing", [
          at.term("a controller", "a", "controller"),
          at.term("the housing", "the", "housing"),
        ]),
      ],
      [partOf("1.a", "1"), partOf("1.b", "1")],
    ],
    (at) => [finding.missing(at.ref("1.b", "the housing"), [1])]
  ),
  definiteFixture(
    "4",
    "multiple-introductions",
    "a sensor; a sensor; and a controller coupled to the sensor.",
    (at) => [
      [
        at.element("1.a", "limitation", "a sensor", [at.term("a sensor", "a", "sensor")]),
        at.element("1.b", "limitation", "a sensor", [at.term("a sensor", "a", "sensor", 1)], 1),
        at.element("1.c", "limitation", "a controller coupled to the sensor", [
          at.term("a controller", "a", "controller"),
          at.term("the sensor", "the", "sensor"),
        ]),
      ],
      [partOf("1.a", "1"), partOf("1.b", "1"), partOf("1.c", "1")],
    ],
    (at) => [
      finding.ambiguous(
        "multiple-introductions",
        at.ref("1.c", "the sensor"),
        [1],
        [at.ref("1.a", "a sensor"), at.ref("1.b", "a sensor", 1)]
      ),
    ]
  ),
  definiteFixture(
    "5",
    "determiner-number-mismatch",
    "a plurality of sensors; and a controller coupled to the sensor.",
    (at) => [
      [
        at.element("1.a", "limitation", "a plurality of sensors", [
          at.term("a plurality of sensors", "plurality-of", "sensors"),
        ]),
        at.element("1.b", "limitation", "a controller coupled to the sensor", [
          at.term("a controller", "a", "controller"),
          at.term("the sensor", "the", "sensor"),
        ]),
      ],
      [partOf("1.a", "1"), partOf("1.b", "1")],
    ],
    (at) => [finding.numberMismatch(at.ref("1.b", "the sensor"), [1], at.ref("1.a", "a plurality of sensors"))]
  ),
  definiteFixture(
    "6",
    "quantifier strip",
    "at least one sensor; and a controller coupled to the at least one sensor.",
    (at) => [
      [
        at.element("1.a", "limitation", "at least one sensor", [
          at.term("at least one sensor", "at-least-one", "sensor"),
        ]),
        at.element("1.b", "limitation", "a controller coupled to the at least one sensor", [
          at.term("a controller", "a", "controller"),
          at.term("the at least one sensor", "the", "sensor"),
        ]),
      ],
      [
        partOf("1.a", "1"),
        partOf("1.b", "1"),
        antecedent(at.ref("1.b", "the at least one sensor"), at.ref("1.a", "at least one sensor")),
      ],
    ]
  ),
  definiteFixture("7", "an", "an actuator; and a controller coupled to the actuator.", (at) => [
    [
      at.element("1.a", "limitation", "an actuator", [at.term("an actuator", "an", "actuator")]),
      at.element("1.b", "limitation", "a controller coupled to the actuator", [
        at.term("a controller", "a", "controller"),
        at.term("the actuator", "the", "actuator"),
      ]),
    ],
    [partOf("1.a", "1"), partOf("1.b", "1"), antecedent(at.ref("1.b", "the actuator"), at.ref("1.a", "an actuator"))],
  ]),
  fixture8,
  fixture9,
  fixture10,
  fixture11,
  definiteFixture(
    "12",
    "non-referential-idiom",
    "a first signal; a second signal; and a comparator that samples the first signal at the same rate as the second signal and outputs a flag when they are the same.",
    (at) => [
      [
        at.element("1.a", "limitation", "a first signal", [at.term("a first signal", "a", "first signal")]),
        at.element("1.b", "limitation", "a second signal", [at.term("a second signal", "a", "second signal")]),
        at.element(
          "1.c",
          "limitation",
          "a comparator that samples the first signal at the same rate as the second signal and outputs a flag when they are the same",
          [
            at.term("a comparator", "a", "comparator"),
            at.term("the first signal", "the", "first signal"),
            at.term("the same rate", "the", "same rate"),
            at.term("the second signal", "the", "second signal"),
            at.term("a flag", "a", "flag"),
            at.term("the same", "the", "same", 1),
          ]
        ),
      ],
      [
        partOf("1.a", "1"),
        partOf("1.b", "1"),
        partOf("1.c", "1"),
        antecedent(at.ref("1.c", "the first signal"), at.ref("1.a", "a first signal")),
        antecedent(at.ref("1.c", "the second signal"), at.ref("1.b", "a second signal")),
      ],
    ]
  ),
  (() => {
    const claim = independent(
      1,
      "A device",
      "comprising",
      "a frame; and a sensor assembly comprising: a lens; and a detector facing the lens."
    );
    const at = anchorsIn(claim);
    return {
      id: "13",
      rule: "colon-sublist",
      context: [claim],
      claims: [claim],
      trees: [
        tree(
          1,
          [
            at.element("1", "preamble-subject", "A device", [at.term("A device", "a", "device")]),
            at.element("1.a", "limitation", "a frame", [at.term("a frame", "a", "frame")]),
            at.element("1.b", "limitation", "a sensor assembly comprising:", [
              at.term("a sensor assembly", "a", "sensor assembly"),
            ]),
            at.element("1.b.i", "sub-limitation", "a lens", [at.term("a lens", "a", "lens")]),
            at.element("1.b.ii", "sub-limitation", "a detector facing the lens", [
              at.term("a detector", "a", "detector"),
              at.term("the lens", "the", "lens"),
            ]),
          ],
          [
            partOf("1.a", "1"),
            partOf("1.b", "1"),
            partOf("1.b.i", "1.b"),
            partOf("1.b.ii", "1.b"),
            antecedent(at.ref("1.b.ii", "the lens"), at.ref("1.b.i", "a lens")),
          ]
        ),
      ],
      findings: [],
    } satisfies RuleFixture;
  })(),
  fixture14,
  fixture15,
  fixture16,
  fixture16b,
  definiteFixture(
    "17",
    "ordinal-variants",
    "a first sensor; a second sensor; and a controller coupled to the sensor.",
    (at) => [
      [
        at.element("1.a", "limitation", "a first sensor", [at.term("a first sensor", "a", "first sensor")]),
        at.element("1.b", "limitation", "a second sensor", [at.term("a second sensor", "a", "second sensor")]),
        at.element("1.c", "limitation", "a controller coupled to the sensor", [
          at.term("a controller", "a", "controller"),
          at.term("the sensor", "the", "sensor"),
        ]),
      ],
      [partOf("1.a", "1"), partOf("1.b", "1"), partOf("1.c", "1")],
    ],
    (at) => [
      finding.ambiguous(
        "ordinal-variants",
        at.ref("1.c", "the sensor"),
        [1],
        [at.ref("1.a", "a first sensor"), at.ref("1.b", "a second sensor")]
      ),
    ]
  ),
  definiteFixture(
    "18",
    "single-modified-introduction",
    "an optical sensor; and a controller coupled to the sensor.",
    (at) => [
      [
        at.element("1.a", "limitation", "an optical sensor", [at.term("an optical sensor", "an", "optical sensor")]),
        at.element("1.b", "limitation", "a controller coupled to the sensor", [
          at.term("a controller", "a", "controller"),
          at.term("the sensor", "the", "sensor"),
        ]),
      ],
      [partOf("1.a", "1"), partOf("1.b", "1")],
    ]
  ),
  definiteFixture(
    "18b",
    "participle-boundary",
    "a sensing element; and a controller coupled to the sensing element.",
    (at) => [
      [
        at.element("1.a", "limitation", "a sensing element", [at.term("a sensing element", "a", "sensing element")]),
        at.element("1.b", "limitation", "a controller coupled to the sensing element", [
          at.term("a controller", "a", "controller"),
          at.term("the sensing element", "the", "sensing element"),
        ]),
      ],
      [
        partOf("1.a", "1"),
        partOf("1.b", "1"),
        antecedent(at.ref("1.b", "the sensing element"), at.ref("1.a", "a sensing element")),
      ],
    ]
  ),
  fixture21,
];

/** Rules 19 and 20: claims the decomposer refuses with a typed failure. */
export const failureFixtures: ReadonlyArray<FailureFixture> = [
  (() => {
    const claim = PatentClaim.cases.independent.make({
      claimNumber: 1,
      claimText: "A system comprising: a sensor.",
      preamble: "A system",
      transition: "comprising",
      body: "a controller.",
    });
    return { id: "19", rule: "unsupported-claim-text", claim, claims: [claim], reason: "unsupported-claim-text" };
  })(),
  (() => {
    const claim = dependent(2, [7], "The system of claim 7,", "the sensor is optical.");
    return {
      id: "20",
      rule: "claim-not-in-claims",
      claim,
      claims: [sensorClaim, claim],
      reason: "claim-not-in-claims",
    };
  })(),
];
