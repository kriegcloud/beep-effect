/**
 *  OpenAPI component schemas modeled with Effect Schema.
 *
 * @see https://folio.openlegalstandard.org/openapi.json
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $OntologyId.create("Ontology.models");

/**
 * Source type of the loaded  ontology.
 *
 * @example
 * ```ts
 * import { SourceType } from "@beep/ontology/Ontology.models"
 *
 * console.log(SourceType.is.github("github"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SourceType = LiteralKit(["http", "github"]).pipe(
  $I.annoteSchema("SourceType", {
    description: "Source type of the ontology graph.",
  })
);

/**
 * Runtime type for {@link SourceType}.
 *
 * @example
 * ```ts
 * import type { SourceType } from "@beep/ontology/Ontology.models"
 *
 * const sourceType: SourceType = "github"
 * console.log(sourceType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SourceType = typeof SourceType.Type;

/**
 * HTTP URL string metadata shape from the  OpenAPI document.
 *
 * @example
 * ```ts
 * import { HttpUrl } from "@beep/ontology/Ontology.models"
 *
 * console.log(HttpUrl.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HttpUrl = S.String.check(
  S.isMinLength(1, {
    identifier: $I`HttpUrlMinLengthCheck`,
    title: " HTTP URL Min Length",
    description: "HTTP URL values must contain at least one character.",
  }),
  S.isMaxLength(2083, {
    identifier: $I`HttpUrlMaxLengthCheck`,
    title: " HTTP URL Max Length",
    description: "HTTP URL values must not exceed 2083 characters.",
  })
).pipe(
  $I.annoteSchema("HttpUrl", {
    description: "HTTP URL of the ontology source when the source type is http.",
    format: "uri",
  })
);

/**
 * Runtime type for {@link HttpUrl}.
 *
 * @example
 * ```ts
 * import type { HttpUrl } from "@beep/ontology/Ontology.models"
 *
 * const url: HttpUrl = "https://example.com/ontology.owl"
 * console.log(url)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HttpUrl = typeof HttpUrl.Type;

/**
 * Information about the loaded  ontology graph.
 *
 * @example
 * ```ts
 * import { GraphInfo } from "@beep/ontology/Ontology.models"
 *
 * console.log(GraphInfo.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const GraphInfo = S.Struct({
  num_classes: S.Int.check(
    S.isGreaterThan(0, {
      identifier: $I`GraphInfoNumClassesPositiveCheck`,
      title: " Graph Class Count Positive",
      description: "The  graph class count must be greater than zero.",
    })
  ).annotateKey({
    title: "Num Classes",
    description: "Total number of ontology classes in the graph",
    examples: [1025],
  }),
  num_properties: S.Int.check(
    S.isGreaterThanOrEqualTo(0, {
      identifier: $I`GraphInfoNumPropertiesNonNegativeCheck`,
      title: " Graph Property Count Non-Negative",
      description: "The  graph object-property count must be zero or greater.",
    })
  ).annotateKey({
    title: "Num Properties",
    description: "Total number of OWL object properties in the graph",
    examples: [175],
  }),
  title: S.String.annotateKey({
    title: "Title",
    description: "Title of the  ontology",
    examples: [" Ontology"],
  }),
  description: S.String.annotateKey({
    title: "Description",
    description: "Description of the  ontology",
    examples: ["Federated Open Legal Information Ontology"],
  }),
  source_type: SourceType.annotateKey({
    title: "Source Type",
    description: "Source type of the ontology (http or github)",
    examples: ["github"],
  }),
  http_url: S.optionalKey(
    S.NullOr(HttpUrl).annotateKey({
      title: "Http Url",
      description: "HTTP URL of the ontology source (when source_type is 'http')",
    })
  ),
  github_repo_owner: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Github Repo Owner",
      description: "GitHub repository owner (when source_type is 'github')",
      examples: ["alea-institute"],
    })
  ),
  github_repo_name: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Github Repo Name",
      description: "GitHub repository name (when source_type is 'github')",
      examples: ["folio"],
    })
  ),
  github_repo_branch: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Github Repo Branch",
      description: "GitHub repository branch (when source_type is 'github')",
      examples: ["2.0.0"],
    })
  ),
}).pipe(
  $I.annoteSchema("GraphInfo", {
    description:
      'Information about the loaded  ontology graph.\n\nThis model contains metadata about the  ontology graph that is currently\nloaded in the API, including its size, source, and descriptive information.\n\nAttributes:\n    num_classes: Total number of ontology classes in the graph\n    title: Title of the  ontology\n    description: Description of the  ontology\n    source_type: Source type of the ontology (http or github)\n    http_url: HTTP URL of the ontology source (when source_type is \'http\')\n    github_repo_owner: GitHub repository owner (when source_type is \'github\')\n    github_repo_name: GitHub repository name (when source_type is \'github\')\n    github_repo_branch: GitHub repository branch (when source_type is \'github\')\n\nExample:\n    ```json\n    {\n      "num_classes": 1025,\n      "title": " Ontology",\n      "description": "Federated Open Legal Information Ontology",\n      "source_type": "github",\n      "http_url": null,\n      "github_repo_owner": "alea-institute",\n      "github_repo_name": "folio",\n      "github_repo_branch": "2.0.0"\n    }\n    ```',
  })
);

/**
 * Runtime type for {@link GraphInfo}.
 *
 * @example
 * ```ts
 * import type { GraphInfo } from "@beep/ontology/Ontology.models"
 *
 * type GraphInfo = GraphInfo
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type GraphInfo = typeof GraphInfo.Type;

/**
 * Health status of the  API.
 *
 * @example
 * ```ts
 * import { HealthStatus } from "@beep/ontology/Ontology.models"
 *
 * console.log(HealthStatus.is.healthy("healthy"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HealthStatus = LiteralKit(["healthy", "unhealthy"]).pipe(
  $I.annoteSchema("HealthStatus", {
    description: "Health status of the API.",
  })
);

/**
 * Runtime type for {@link HealthStatus}.
 *
 * @example
 * ```ts
 * import type { HealthStatus } from "@beep/ontology/Ontology.models"
 *
 * const status: HealthStatus = "healthy"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HealthStatus = typeof HealthStatus.Type;

/**
 * Response model for the health check endpoint.
 *
 * @example
 * ```ts
 * import { HealthResponse } from "@beep/ontology/Ontology.models"
 *
 * console.log(HealthResponse.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HealthResponse = S.Struct({
  status: HealthStatus.annotateKey({
    title: "Status",
    description: "Health status of the API",
    examples: ["healthy"],
  }),
  folio_graph: GraphInfo.annotateKey({
    description: "Information about the loaded  ontology graph",
  }),
}).pipe(
  $I.annoteSchema("HealthResponse", {
    description:
      'Response model for the health check endpoint.\n\nThis model contains information about the API\'s health status and\nmetadata about the loaded  ontology graph.\n\nAttributes:\n    status: Health status of the API ("healthy" when operational)\n    folio_graph: Information about the loaded  ontology graph\n\nExample:\n    ```json\n    {\n      "status": "healthy",\n      "folio_graph": {\n        "num_classes": 1025,\n        "title": " Ontology",\n        "description": "Federated Open Legal Information Ontology",\n        "source_type": "github",\n        "http_url": null,\n        "github_repo_owner": "alea-institute",\n        "github_repo_name": "folio",\n        "github_repo_branch": "2.0.0"\n      }\n    }\n    ```',
  })
);

/**
 * Runtime type for {@link HealthResponse}.
 *
 * @example
 * ```ts
 * import type { HealthResponse } from "@beep/ontology/Ontology.models"
 *
 * type Response = HealthResponse
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HealthResponse = typeof HealthResponse.Type;

/**
 * OWL class model for the  ontology.
 *
 * @example
 * ```ts
 * import { OWLClass } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLClass.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLClass = S.Struct({
  iri: S.String.annotateKey({
    title: "Iri",
    description: "{http://www.w3.org/2002/07/owl#}Class",
  }),
  label: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Label",
      description: "{http://www.w3.org/2000/01/rdf-schema#}label",
    })
  ),
  sub_class_of: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Sub Class Of",
      description: "{http://www.w3.org/2000/01/rdf-schema#}subClassOf",
    })
  ),
  parent_class_of: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Parent Class Of",
      description: "{http://www.w3.org/2000/01/rdf-schema#}subClassOf",
    })
  ),
  is_defined_by: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Is Defined By",
      description: "{http://www.w3.org/2000/01/rdf-schema#}isDefinedBy",
    })
  ),
  see_also: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "See Also",
      description: "{http://www.w3.org/2000/01/rdf-schema#}seeAlso",
    })
  ),
  comment: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Comment",
      description: "{http://www.w3.org/2000/01/rdf-schema#}comment",
    })
  ),
  deprecated: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)).annotateKey({
    title: "Deprecated",
    description: "{http://www.w3.org/2002/07/owl#}deprecated",
    default: false,
  }),
  preferred_label: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Preferred Label",
      description: "{http://www.w3.org/2004/02/skos/core#}prefLabel",
    })
  ),
  alternative_labels: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Alternative Labels",
      description: "{http://www.w3.org/2004/02/skos/core#}altLabel",
    })
  ),
  translations: S.optionalKey(
    S.Record(S.String, S.String).annotateKey({
      title: "Translations",
      description: "translations from other languages",
    })
  ),
  hidden_label: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Hidden Label",
      description: "{http://www.w3.org/2004/02/skos/core#}hiddenLabel",
    })
  ),
  definition: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Definition",
      description: "{http://www.w3.org/2004/02/skos/core#}definition",
    })
  ),
  examples: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Examples",
      description: "{http://www.w3.org/2004/02/skos/core#}example",
    })
  ),
  notes: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Notes",
      description: "{http://www.w3.org/2004/02/skos/core#}note",
    })
  ),
  history_note: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "History Note",
      description: "{http://www.w3.org/2004/02/skos/core#}historyNote",
    })
  ),
  editorial_note: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Editorial Note",
      description: "{http://www.w3.org/2004/02/skos/core#}editorialNote",
    })
  ),
  in_scheme: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "In Scheme",
      description: "{http://www.w3.org/2004/02/skos/core#}inScheme",
    })
  ),
  identifier: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Identifier",
      description: "{http://purl.org/dc/elements/1.1/}identifier",
    })
  ),
  description: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Description",
      description: "{http://purl.org/dc/elements/1.1/}description",
    })
  ),
  source: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Source",
      description: "{http://purl.org/dc/elements/1.1/}source",
    })
  ),
  country: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Country",
      description: "{http://www.loc.gov/mads/rdf/v1#}country",
    })
  ),
}).pipe(
  $I.annoteSchema("OWLClass", {
    description:
      "OWLClass model for the  package, which represents an OWL class in the \nontology/taxonomy style.\n\nTODO: think about future-proofing for next-gen roadmap.",
  })
);

/**
 * Runtime type for {@link OWLClass}.
 *
 * @example
 * ```ts
 * import type { OWLClass } from "@beep/ontology/Ontology.models"
 *
 * type Class = OWLClass
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLClass = typeof OWLClass.Type;

/**
 * OWL object property model for the  ontology.
 *
 * @example
 * ```ts
 * import { OWLObjectProperty } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLObjectProperty.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLObjectProperty = S.Struct({
  iri: S.String.annotateKey({
    title: "Iri",
    description: "{http://www.w3.org/2002/07/owl#}ObjectProperty",
  }),
  label: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Label",
      description: "{http://www.w3.org/2000/01/rdf-schema#}label",
    })
  ),
  sub_property_of: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Sub Property Of",
      description: "{http://www.w3.org/2000/01/rdf-schema#}subPropertyOf",
    })
  ),
  domain: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Domain",
      description: "{http://www.w3.org/2000/01/rdf-schema#}domain",
    })
  ),
  range: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Range",
      description: "{http://www.w3.org/2000/01/rdf-schema#}range",
    })
  ),
  inverse_of: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Inverse Of",
      description: "{http://www.w3.org/2002/07/owl#}inverseOf",
    })
  ),
  preferred_label: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Preferred Label",
      description: "{http://www.w3.org/2004/02/skos/core#}prefLabel",
    })
  ),
  alternative_labels: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Alternative Labels",
      description: "{http://www.w3.org/2004/02/skos/core#}altLabel",
    })
  ),
  definition: S.optionalKey(
    S.NullOr(S.String).annotateKey({
      title: "Definition",
      description: "{http://www.w3.org/2004/02/skos/core#}definition",
    })
  ),
  examples: S.optionalKey(
    S.Array(S.String).annotateKey({
      title: "Examples",
      description: "{http://www.w3.org/2004/02/skos/core#}example",
    })
  ),
}).pipe(
  $I.annoteSchema("OWLObjectProperty", {
    description:
      "OWLObjectProperty model for the  package, which represents an OWL object property\nthat connects two instances/classes in the ontology.",
  })
);

/**
 * Runtime type for {@link OWLObjectProperty}.
 *
 * @example
 * ```ts
 * import type { OWLObjectProperty } from "@beep/ontology/Ontology.models"
 *
 * type ObjectProperty = OWLObjectProperty
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLObjectProperty = typeof OWLObjectProperty.Type;

/**
 * A collection of OWL class objects from the  ontology.
 *
 * @example
 * ```ts
 * import { OWLClassList } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLClassList.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLClassList = S.Struct({
  classes: S.Array(OWLClass).annotateKey({
    title: "Classes",
    description: "List of OWLClass objects from the  ontology",
    examples: [
      [
        OWLClass.make({
          definition: "A party that grants a right to use something in return for payment.",
          iri: "R8pNPutX0TN6DlEqkyZuxSw",
          label: "Lessor",
        }),
      ],
    ],
  }),
  properties: S.optionalKey(
    S.Array(OWLObjectProperty).annotateKey({
      title: "Properties",
      description: "List of OWLObjectProperty objects matching the search",
    })
  ),
}).pipe(
  $I.annoteSchema("OWLClassList", {
    description:
      'A collection of OWLClass objects from the  ontology.\n\nThis model represents a list of ontology classes returned by various\nendpoints, particularly the taxonomy endpoints that return multiple\nclasses of a specific type.\n\nAttributes:\n    classes: A list of OWLClass objects representing  ontology classes\n\nExample:\n    ```json\n    {\n      "classes": [\n        {\n          "iri": "R8pNPutX0TN6DlEqkyZuxSw",\n          "label": "Lessor",\n          "definition": "A party that grants a right to use something in return for payment.",\n          "subClassOf": ["oS5FqyVBbOYQbhqb0G28oZR"],\n          ...\n        },\n        ...\n      ]\n    }\n    ```',
  })
);

/**
 * Runtime type for {@link OWLClassList}.
 *
 * @example
 * ```ts
 * import type { OWLClassList } from "@beep/ontology/Ontology.models"
 *
 * type ClassList = OWLClassList
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLClassList = typeof OWLClassList.Type;

/**
 * A collection of OWL object properties from the  ontology.
 *
 * @example
 * ```ts
 * import { OWLObjectPropertyList } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLObjectPropertyList.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLObjectPropertyList = S.Struct({
  properties: S.Array(OWLObjectProperty).annotateKey({
    title: "Properties",
    description: "List of OWLObjectProperty objects from the  ontology",
    examples: [
      [
        OWLObjectProperty.make({
          definition: "A relationship indicating that something was drafted.",
          iri: "R6qohvM786wjw0MNQJg9Dq",
          label: "drafted",
        }),
      ],
    ],
  }),
}).pipe(
  $I.annoteSchema("OWLObjectPropertyList", {
    description:
      "A collection of OWLObjectProperty objects from the  ontology.\n\nAttributes:\n    properties: A list of OWLObjectProperty objects representing  ontology object properties",
  })
);

/**
 * Runtime type for {@link OWLObjectPropertyList}.
 *
 * @example
 * ```ts
 * import type { OWLObjectPropertyList } from "@beep/ontology/Ontology.models"
 *
 * type PropertyList = OWLObjectPropertyList
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLObjectPropertyList = typeof OWLObjectPropertyList.Type;

/**
 * Relevance score attached to an OWL search result.
 *
 * @example
 * ```ts
 * import { OWLSearchScore } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLSearchScore.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLSearchScore = S.Union([
  S.Int.annotateKey({
    title: "Integer",
  }),
  S.Finite.annotateKey({
    title: "Number",
  }),
]).pipe(
  $I.annoteSchema("OWLSearchScore", {
    description: "Integer or number relevance score returned with an OWL class search result.",
  })
);

/**
 * Runtime type for {@link OWLSearchScore}.
 *
 * @example
 * ```ts
 * import type { OWLSearchScore } from "@beep/ontology/Ontology.models"
 *
 * const score: OWLSearchScore = 0.95
 * console.log(score)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLSearchScore = typeof OWLSearchScore.Type;

/**
 * Tuple containing an OWL class and its relevance score.
 *
 * @example
 * ```ts
 * import { OWLSearchResult } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLSearchResult.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLSearchResult = S.Tuple([OWLClass, OWLSearchScore]).pipe(
  $I.annoteSchema("OWLSearchResult", {
    description: "Tuple containing an OWLClass object and its relevance score.",
  })
);

/**
 * Runtime type for {@link OWLSearchResult}.
 *
 * @example
 * ```ts
 * import type { OWLSearchResult } from "@beep/ontology/Ontology.models"
 *
 * type Result = OWLSearchResult
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLSearchResult = typeof OWLSearchResult.Type;

/**
 * Search results containing  ontology classes with relevance scores.
 *
 * @example
 * ```ts
 * import { OWLSearchResults } from "@beep/ontology/Ontology.models"
 *
 * console.log(OWLSearchResults.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OWLSearchResults = S.Struct({
  results: S.Array(OWLSearchResult).annotateKey({
    title: "Results",
    description: "List of tuples containing OWLClass objects and their relevance scores",
    examples: [
      [
        [
          OWLClass.make({
            definition: "A party that grants a right to use something in return for payment.",
            iri: "R8pNPutX0TN6DlEqkyZuxSw",
            label: "Lessor",
          }),
          0.95,
        ],
      ],
    ],
  }),
}).pipe(
  $I.annoteSchema("OWLSearchResults", {
    description:
      'Search results containing  ontology classes with relevance scores.\n\nThis model represents the results of search operations that return ontology\nclasses along with relevance scores indicating how well each class matches\nthe search query.\n\nAttributes:\n    results: A list of tuples where each tuple contains an OWLClass and its\n            relevance score (higher scores indicate better matches)\n\nExample:\n    ```json\n    {\n      "results": [\n        [\n          {\n            "iri": "R8pNPutX0TN6DlEqkyZuxSw",\n            "label": "Lessor",\n            "definition": "A party that grants a right to use something in return for payment.",\n            ...\n          },\n          0.95\n        ],\n        ...\n      ]\n    }\n    ```',
  })
);

/**
 * Runtime type for {@link OWLSearchResults}.
 *
 * @example
 * ```ts
 * import type { OWLSearchResults } from "@beep/ontology/Ontology.models"
 *
 * type Results = OWLSearchResults
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OWLSearchResults = typeof OWLSearchResults.Type;

/**
 * Location segment in a  validation error.
 *
 * @example
 * ```ts
 * import { ValidationErrorLocationSegment } from "@beep/ontology/Ontology.models"
 *
 * console.log(ValidationErrorLocationSegment.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ValidationErrorLocationSegment = S.Union([S.String, S.Int]).pipe(
  $I.annoteSchema("ValidationErrorLocationSegment", {
    description: "String or integer segment in a validation error location path.",
  })
);

/**
 * Runtime type for {@link ValidationErrorLocationSegment}.
 *
 * @example
 * ```ts
 * import type { ValidationErrorLocationSegment } from "@beep/ontology/Ontology.models"
 *
 * const segment: ValidationErrorLocationSegment = "body"
 * console.log(segment)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ValidationErrorLocationSegment = typeof ValidationErrorLocationSegment.Type;

/**
 * Validation error detail emitted by the  API.
 *
 * @example
 * ```ts
 * import { ValidationError } from "@beep/ontology/Ontology.models"
 *
 * console.log(ValidationError.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ValidationError = S.Struct({
  loc: S.Array(ValidationErrorLocationSegment).annotateKey({
    title: "Location",
  }),
  msg: S.String.annotateKey({
    title: "Message",
  }),
  type: S.String.annotateKey({
    title: "Error Type",
  }),
  input: S.optionalKey(
    S.Unknown.annotateKey({
      title: "Input",
    })
  ),
  ctx: S.optionalKey(
    S.Record(S.String, S.Unknown).annotateKey({
      title: "Context",
    })
  ),
}).pipe(
  $I.annoteSchema("ValidationError", {
    description: "Validation error detail emitted by the  API.",
  })
);

/**
 * Runtime type for {@link ValidationError}.
 *
 * @example
 * ```ts
 * import type { ValidationError } from "@beep/ontology/Ontology.models"
 *
 * type ErrorDetail = ValidationError
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ValidationError = typeof ValidationError.Type;

/**
 * HTTP validation error response emitted by the  API.
 *
 * @example
 * ```ts
 * import { HTTPValidationError } from "@beep/ontology/Ontology.models"
 *
 * console.log(HTTPValidationError.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HTTPValidationError = S.Struct({
  detail: S.optionalKey(
    S.Array(ValidationError).annotateKey({
      title: "Detail",
    })
  ),
}).pipe(
  $I.annoteSchema("HTTPValidationError", {
    description: "HTTP validation error response emitted by the  API.",
  })
);

/**
 * Runtime type for {@link HTTPValidationError}.
 *
 * @example
 * ```ts
 * import type { HTTPValidationError } from "@beep/ontology/Ontology.models"
 *
 * type ValidationResponse = HTTPValidationError
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HTTPValidationError = typeof HTTPValidationError.Type;
