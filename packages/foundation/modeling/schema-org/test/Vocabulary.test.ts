import { decodeRow } from "@beep/schema-org/internal/rows";
import {
  DOMAIN_PROPERTIES,
  PROPERTY_NAMES,
  SUB_CLASS_OF,
  SUPERSEDED_PROPERTIES,
  SUPERSEDED_TYPES,
  TYPE_NAMES,
} from "@beep/schema-org/internal/vocabulary";
import { Vocabulary } from "@beep/schema-org/Vocabulary";
import { assert, describe, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as Str from "effect/String";
import { byteLengthOf } from "./sources.ts";

/** Whether `index` is a valid position in a table of `bound` entries. */
const isIndexBelow = (index: number, bound: number): boolean => Number.isInteger(index) && index >= 0 && index < bound;

/** Asserts every interned index in every encoded row addresses a table of `bound` entries. */
const assertRowIndicesBelow = (rows: ReadonlyArray<string>, bound: number, label: string): void => {
  for (const row of rows) {
    for (const index of decodeRow(row)) assert.isTrue(isIndexBelow(index, bound), `${label} index ${index}`);
  }
};

describe("the generated vocabulary table", () => {
  it("carries every schema-native term and nothing foreign", () => {
    assert.strictEqual(TYPE_NAMES.length, 933);
    assert.strictEqual(PROPERTY_NAMES.length, 1521);
    // Foreign alignment terms carry the same `@type` as native ones and are
    // filtered by id prefix; if that filter ever regresses the counts move.
    assert.isFalse(A.some(TYPE_NAMES, Str.includes(":")));
    assert.isFalse(A.some(PROPERTY_NAMES, Str.includes(":")));
  });

  it("keeps every interned index in range", () => {
    assert.strictEqual(SUB_CLASS_OF.length, TYPE_NAMES.length);
    assert.strictEqual(DOMAIN_PROPERTIES.length, TYPE_NAMES.length);
    assertRowIndicesBelow(SUB_CLASS_OF, TYPE_NAMES.length, "type");
    assertRowIndicesBelow(DOMAIN_PROPERTIES, PROPERTY_NAMES.length, "property");
    for (const row of [...SUPERSEDED_TYPES, ...SUPERSEDED_PROPERTIES]) {
      assert.strictEqual(decodeRow(row).length, 2);
    }
  });

  it("keeps the class and property namespaces disjoint", () => {
    // `Vocabulary.supersededBy` resolves a bare term against both tables in
    // one call, which is only unambiguous while this holds.
    const types = HashSet.fromIterable(TYPE_NAMES);
    assert.deepStrictEqual(
      A.filter(PROPERTY_NAMES, (name) => HashSet.has(types, name)),
      []
    );
  });

  it("stays within the size budget the entrypoint split is justified by", () => {
    // The whole table is what a graph-only consumer avoids by importing `.`
    // rather than `./conformance`; the ceiling is the number that decision
    // turns on. Measured 74,834 B at v30.0 — a regeneration that doubles it
    // is a design change, not a data refresh.
    const bytes = byteLengthOf("schema-org/src/internal/vocabulary.ts");
    assert.isBelow(bytes, 80_000, `vocabulary table is ${bytes} B`);
    assert.isAbove(bytes, 60_000, `vocabulary table is ${bytes} B — suspiciously small, did generation half-run?`);
  });
});

describe("Vocabulary", () => {
  it("returns Effect HashSets and exposes the original discovery order separately", () => {
    assert.isTrue(HashSet.isHashSet(Vocabulary.ancestorsOf("APIReference")));
    assert.isTrue(HashSet.isHashSet(Vocabulary.propertiesOf("SoftwareSourceCode")));
    assert.isTrue(HashSet.isHashSet(Vocabulary.ancestorsOf("NotAThing")));
    assert.deepStrictEqual(Vocabulary.ancestorsInOrder("APIReference"), [
      "TechArticle",
      "Article",
      "CreativeWork",
      "Thing",
    ]);
    assert.deepStrictEqual(Vocabulary.ancestorsInOrder("HowToStep"), [
      "ListItem",
      "Intangible",
      "Thing",
      "ItemList",
      "CreativeWork",
    ]);
    assert.deepStrictEqual(Vocabulary.propertiesInOrder("SoftwareSourceCode").slice(0, 8), [
      "codeRepository",
      "codeSampleType",
      "programmingLanguage",
      "runtime",
      "runtimePlatform",
      "sampleType",
      "targetProduct",
      "about",
    ]);
    assert.deepStrictEqual(Vocabulary.ancestorsInOrder("NotAThing"), []);
    assert.deepStrictEqual(Vocabulary.propertiesInOrder("NotAThing"), []);
  });

  it("reports the release it was generated from", () => {
    assert.strictEqual(Vocabulary.version, "30.0");
  });

  it("knows which terms exist", () => {
    assert.isTrue(Vocabulary.hasType("SoftwareSourceCode"));
    assert.isTrue(Vocabulary.hasType("Thing"));
    assert.isFalse(Vocabulary.hasType("SoftwareSourceCodeRepository"));
    assert.isTrue(Vocabulary.hasProperty("codeRepository"));
    assert.isFalse(Vocabulary.hasProperty("codeRepositoryUrl"));
    // Foreign terms are not ours to know about.
    assert.isFalse(Vocabulary.hasProperty("gs1:telephone"));
  });

  it("resolves the ancestor closure transitively, excluding the type itself", () => {
    const ancestors = Vocabulary.ancestorsOf("APIReference");
    assert.deepStrictEqual([...ancestors].sort(), ["Article", "CreativeWork", "TechArticle", "Thing"]);
    assert.isFalse(HashSet.has(ancestors, "APIReference"));
    assert.strictEqual(HashSet.size(Vocabulary.ancestorsOf("Thing")), 0);
    assert.strictEqual(HashSet.size(Vocabulary.ancestorsOf("NotAThing")), 0);
  });

  it("unions every arm of a multi-parent class", () => {
    // HowToStep is a ListItem AND a CreativeWork AND an ItemList; a
    // parent-chain walk would return only the first arm's ancestors.
    const ancestors = Vocabulary.ancestorsOf("HowToStep");
    assert.isTrue(HashSet.has(ancestors, "ListItem"));
    assert.isTrue(HashSet.has(ancestors, "CreativeWork"));
    assert.isTrue(HashSet.has(ancestors, "ItemList"));
  });

  it("terminates a branch at a foreign parent without losing its native sibling", () => {
    // Certification's parents are fibo-fnd-arr-doc:Certificate AND CreativeWork.
    const ancestors = Vocabulary.ancestorsOf("Certification");
    assert.isTrue(HashSet.has(ancestors, "CreativeWork"));
    assert.isTrue(HashSet.has(ancestors, "Thing"));
    assert.isFalse(A.some(A.fromIterable(ancestors), Str.includes(":")));
    // DataType's only parent is rdfs:Class — the walk terminates with nothing.
    assert.strictEqual(HashSet.size(Vocabulary.ancestorsOf("DataType")), 0);
    assert.isTrue(Vocabulary.hasType("DataType"));
  });

  it("resolves an inherited property, which is the whole point", () => {
    // `license` names exactly one domain, CreativeWork. A direct-membership
    // check rejects this, and it is in the consumer's first graph.
    assert.isTrue(Vocabulary.isPropertyOn("license", "SoftwareSourceCode"));
    assert.isTrue(Vocabulary.isPropertyOn("name", "APIReference"));
    // Four levels up: APIReference -> TechArticle -> Article -> CreativeWork.
    assert.isTrue(Vocabulary.isPropertyOn("license", "APIReference"));
  });

  it("resolves a direct property", () => {
    assert.isTrue(Vocabulary.isPropertyOn("codeRepository", "SoftwareSourceCode"));
  });

  it("matches a non-first entry of a many-domain property", () => {
    // sponsor: MedicalStudy, Event, Organization, Person, CreativeWork, Grant.
    assert.isTrue(Vocabulary.isPropertyOn("sponsor", "MedicalStudy"));
    assert.isTrue(Vocabulary.isPropertyOn("sponsor", "CreativeWork"));
    assert.isTrue(Vocabulary.isPropertyOn("sponsor", "Grant"));
    // telephone: Organization, Person, Place, ContactPoint.
    assert.isTrue(Vocabulary.isPropertyOn("telephone", "ContactPoint"));
  });

  it("inherits through a non-first parent of a multi-parent class", () => {
    // license arrives through CreativeWork, HowToStep's SECOND parent;
    // itemListElement through ItemList, its THIRD.
    assert.isTrue(Vocabulary.isPropertyOn("license", "HowToStep"));
    assert.isTrue(Vocabulary.isPropertyOn("itemListElement", "HowToStep"));
    assert.isTrue(Vocabulary.isPropertyOn("position", "HowToStep"));
  });

  it("rejects a real property on the wrong type", () => {
    // The authentic case: softwareVersion is defined on SoftwareApplication.
    assert.isTrue(Vocabulary.hasProperty("softwareVersion"));
    assert.isTrue(Vocabulary.isPropertyOn("softwareVersion", "SoftwareApplication"));
    assert.isFalse(Vocabulary.isPropertyOn("softwareVersion", "SoftwareSourceCode"));
  });

  it("carries pending terms, which is what the full table buys", () => {
    assert.isTrue(Vocabulary.hasProperty("yearBuilt"));
    assert.isTrue(Vocabulary.isPropertyOn("yearBuilt", "Accommodation"));
  });

  it("lists the properties of a type, inherited ones included", () => {
    const properties = Vocabulary.propertiesOf("SoftwareSourceCode");
    assert.isTrue(HashSet.has(properties, "codeRepository")); // its own
    assert.isTrue(HashSet.has(properties, "license")); // CreativeWork's
    assert.isTrue(HashSet.has(properties, "name")); // Thing's
    assert.isFalse(HashSet.has(properties, "softwareVersion"));
    assert.strictEqual(HashSet.size(Vocabulary.propertiesOf("NotAThing")), 0);
  });

  it("flags a deprecated term with its successor rather than rejecting it", () => {
    assertSome(Vocabulary.supersededBy("episodes"), "episode");
    assertNone(Vocabulary.supersededBy("license"));
    assertNone(Vocabulary.supersededBy("NotATerm"));
    // A superseded term stays a member of the vocabulary and stays legal.
    assert.isTrue(Vocabulary.hasProperty("episodes"));
    assert.isTrue(Vocabulary.isPropertyOn("episodes", "TVSeries"));
  });

  it("answers a property with no resolvable domain as legal nowhere", () => {
    // interactionCount is superseded and the document gives it no domain at
    // all. That is the document's answer, not a table defect.
    assert.isTrue(Vocabulary.hasProperty("interactionCount"));
    assert.isFalse(Vocabulary.isPropertyOn("interactionCount", "Thing"));
  });
});
