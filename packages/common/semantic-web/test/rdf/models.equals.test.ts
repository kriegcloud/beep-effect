import { describe, expect, it } from "bun:test";

import { BlankNode } from "@beep/semantic-web/rdf/models/BlankNode";
import { DefaultGraph } from "@beep/semantic-web/rdf/models/DefaultGraph";
import { Literal } from "@beep/semantic-web/rdf/models/Literal";
import { NamedNode } from "@beep/semantic-web/rdf/models/NamedNode";
import { Quad } from "@beep/semantic-web/rdf/models/Quad";
import { Variable } from "@beep/semantic-web/rdf/models/Variable";

describe("rdf/models equals", () => {
  it("NamedNode.equals uses schema-derived equivalence", () => {
    const a = NamedNode.new("https://example.com/a");
    const b = NamedNode.new("https://example.com/a");
    const c = NamedNode.new("https://example.com/c");

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(NamedNode.Equivalence(a, b)).toBe(true);
    expect(NamedNode.Equivalence(a, c)).toBe(false);
  });

  it("Different RDF term types are not equivalent", () => {
    const iri = "https://example.com/a";

    const namedNode = NamedNode.new(iri);
    const blankNode = BlankNode.new(iri);
    const literal = Literal.new(iri);
    const variable = Variable.new(iri);
    const quad = Quad.new(iri);
    const defaultGraph = DefaultGraph.new(iri);

    // Sanity: self-equality
    expect(namedNode.equals(NamedNode.new(iri))).toBe(true);
    expect(blankNode.equals(BlankNode.new(iri))).toBe(true);
    expect(literal.equals(Literal.new(iri))).toBe(true);
    expect(variable.equals(Variable.new(iri))).toBe(true);
    expect(quad.equals(Quad.new(iri))).toBe(true);
    expect(defaultGraph.equals(DefaultGraph.new(iri))).toBe(true);

    // Cross-type comparisons should be false even if the `value` matches.
    expect(NamedNode.Equivalence(namedNode, blankNode as unknown as NamedNode)).toBe(false);
    expect(NamedNode.Equivalence(namedNode, literal as unknown as NamedNode)).toBe(false);
    expect(NamedNode.Equivalence(namedNode, variable as unknown as NamedNode)).toBe(false);
    expect(NamedNode.Equivalence(namedNode, quad as unknown as NamedNode)).toBe(false);
    expect(NamedNode.Equivalence(namedNode, defaultGraph as unknown as NamedNode)).toBe(false);
  });
});

