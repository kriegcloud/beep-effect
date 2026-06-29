/* Data Model Interfaces */
/* https://rdf.js.org/data-model-spec/ */

/**
 * Contains an Iri, RDF blank Node, RDF literal, variable name, default graph, or a quad
 * @see NamedNode
 * @see BlankNode
 * @see Literal
 * @see Variable
 * @see DefaultGraph
 * @see BaseQuad
 */
export type Term = NamedNode | BlankNode | Literal | Variable | DefaultGraph | BaseQuad;

/**
 * Contains an IRI.
 */
export interface NamedNode<Iri extends string = string> {
    /**
     * Contains the constant "NamedNode".
     */
    termType: "NamedNode";
    /**
     * The IRI of the named node (example: `http://example.org/resource`)
     */
    value: Iri;

    /**
     * @param other The term to compare with.
     * @return True if and only if other has termType "NamedNode" and the same `value`.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * Contains an RDF blank node.
 */
export interface BlankNode {
    /**
     * Contains the constant "BlankNode".
     */
    termType: "BlankNode";
    /**
     * Blank node name as a string, without any serialization specific prefixes,
     * e.g. when parsing,
     * if the data was sourced from Turtle, remove _:,
     * if it was sourced from RDF/XML, do not change the blank node name (example: blank3).
     */
    value: string;

    /**
     * @param other The term to compare with.
     * @return True if and only if other has termType "BlankNode" and the same `value`.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * An RDF literal, containing a string with an optional language tag and/or datatype.
 */
export interface Literal {
    /**
     * Contains the constant "Literal".
     */
    termType: "Literal";
    /**
     * The text value, unescaped, without language or type (example: Brad Pitt).
     */
    value: string;
    /**
     * the language as lowercase BCP47 string (examples: en, en-gb)
     * or an empty string if the literal has no language.
     * @link http://tools.ietf.org/html/bcp47
     */
    language: string;
    /**
     * the direction of the language-tagged string.
     */
    direction?: 'ltr' | 'rtl' | '' | null;
    /**
     * A NamedNode whose IRI represents the datatype of the literal.
     */
    datatype: NamedNode;

    /**
     * @param other The term to compare with.
     * @return True if and only if other has termType "Literal"
     *                   and the same `value`, `language`, `direction`, and `datatype`.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * A variable name.
 */
export interface Variable {
    /**
     * Contains the constant "Variable".
     */
    termType: "Variable";
    /**
     * The name of the variable *without* leading ? (example: a).
     */
    value: string;

    /**
     * @param other The term to compare with.
     * @return True if and only if other has termType "Variable" and the same `value`.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
export interface DefaultGraph {
    /**
     * Contains the constant "DefaultGraph".
     */
    termType: "DefaultGraph";
    /**
     * Contains an empty string as constant value.
     */
    value: "";

    /**
     * @param other The term to compare with.
     * @return True if and only if other has termType "DefaultGraph".
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * The subject, which is a NamedNode, BlankNode or Variable.
 * @see NamedNode
 * @see BlankNode
 * @see Variable
 */
export type Quad_Subject = NamedNode | BlankNode | Quad | Variable;

/**
 * The predicate, which is a NamedNode or Variable.
 * @see NamedNode
 * @see Variable
 */
export type Quad_Predicate = NamedNode | Variable;

/**
 * The object, which is a NamedNode, Literal, BlankNode or Variable.
 * @see NamedNode
 * @see Literal
 * @see BlankNode
 * @see Variable
 */
export type Quad_Object = NamedNode | Literal | BlankNode | Quad | Variable;

/**
 * The named graph, which is a DefaultGraph, NamedNode, BlankNode or Variable.
 * @see DefaultGraph
 * @see NamedNode
 * @see BlankNode
 * @see Variable
 */
export type Quad_Graph = DefaultGraph | NamedNode | BlankNode | Variable;

/**
 * An RDF quad, taking any Term in its positions, containing the subject, predicate, object and graph terms.
 */
export interface BaseQuad {
    /**
     * Contains the constant "Quad".
     */
    termType: "Quad";
    /**
     * Contains an empty string as constant value.
     */
    value: "";

    /**
     * The subject.
     * @see Quad_Subject
     */
    subject: Term;
    /**
     * The predicate.
     * @see Quad_Predicate
     */
    predicate: Term;
    /**
     * The object.
     * @see Quad_Object
     */
    object: Term;
    /**
     * The named graph.
     * @see Quad_Graph
     */
    graph: Term;

    /**
     * @param other The term to compare with.
     * @return True if and only if the argument is a) of the same type b) has all components equal.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * An RDF quad, containing the subject, predicate, object and graph terms.
 */
export interface Quad extends BaseQuad {
    /**
     * The subject.
     * @see Quad_Subject
     */
    subject: Quad_Subject;
    /**
     * The predicate.
     * @see Quad_Predicate
     */
    predicate: Quad_Predicate;
    /**
     * The object.
     * @see Quad_Object
     */
    object: Quad_Object;
    /**
     * The named graph.
     * @see Quad_Graph
     */
    graph: Quad_Graph;

    /**
     * @param other The term to compare with.
     * @return True if and only if the argument is a) of the same type b) has all components equal.
     */
    equals(other: Term | null | undefined): boolean;
}

/**
 * A factory for instantiating RDF terms and quads.
 */
export interface DataFactory<OutQuad extends BaseQuad = Quad, InQuad extends BaseQuad = OutQuad> {
    /**
     * @param value The IRI for the named node.
     * @return A new instance of NamedNode.
     * @see NamedNode
     */
    namedNode<Iri extends string = string>(value: Iri): NamedNode<Iri>;

    /**
     * @param value The optional blank node identifier.
     * @return A new instance of BlankNode.
     *                         If the `value` parameter is undefined a new identifier
     *                         for the blank node is generated for each call.
     * @see BlankNode
     */
    blankNode(value?: string): BlankNode;

    /**
     * @param value              The literal value.
     * @param languageOrDatatype The optional language, datatype, or directional language.
     *                           If `languageOrDatatype` is a NamedNode,
     *                           then it is used for the value of `Literal.datatype`.
     *                           If `languageOrDatatype` is a string, it is used for the value
     *                           of `Literal.language`.
     *                           Otherwise, it is used as a directional language,
     *                           from which the language is set to `languageOrDatatype.language`
     *                           and the direction to `languageOrDatatype.direction`.
     * @return A new instance of Literal.
     * @see Literal
     */
    literal(value: string, languageOrDatatype?: string | NamedNode | DirectionalLanguage): Literal;

    /**
     * This method is optional.
     * @param value The variable name
     * @return A new instance of Variable.
     * @see Variable
     */
    variable?(value: string): Variable;

    /**
     * @return An instance of DefaultGraph.
     */
    defaultGraph(): DefaultGraph;

    /**
     * @param subject   The quad subject term.
     * @param predicate The quad predicate term.
     * @param object    The quad object term.
     * @param graph     The quad graph term.
     * @return A new instance of Quad.
     * @see Quad
     */
    quad(subject: InQuad['subject'], predicate: InQuad['predicate'], object: InQuad['object'], graph?: InQuad['graph']): OutQuad;

    /**
     * @param original The original term.
     * @return A new instance of the term such that newTermInstance.equals(original) returns true.
     * @see Term
     */
    fromTerm(original: NamedNode): NamedNode;
    fromTerm(original: BlankNode): BlankNode;
    fromTerm(original: Literal): Literal;
    fromTerm(original: Variable): Variable;
    fromTerm(original: DefaultGraph): DefaultGraph;
    fromTerm(original: BaseQuad): OutQuad;

    /**
     * @param original The original quad.
     * @return A new instance of the quad such that newQuadInstance.equals(original) returns true.
     * @see Quad
     */
    fromQuad(original: InQuad): OutQuad;
}

export interface DirectionalLanguage {
    language: string;
    direction?: 'ltr' | 'rtl' | '' | null;
}
