#!/usr/bin/env bun

// cspell:words cuda dtos uncapitalize

import { Str as BeepStr, Struct } from "@beep/utils";
import { Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";

type JsonSchema = {
  readonly $ref?: string;
  readonly type?: string | readonly string[];
  readonly format?: string;
  readonly enum?: readonly unknown[];
  readonly items?: JsonSchema;
  readonly nullable?: boolean;
  readonly properties?: Record<string, JsonSchema>;
  readonly required?: readonly string[];
  readonly additionalProperties?: JsonSchema | boolean;
};

type OpenApiParameter = {
  readonly name: string;
  readonly in: "path" | "query" | "header" | "cookie";
  readonly required?: boolean;
  readonly schema?: JsonSchema;
};

type OpenApiMedia = {
  readonly schema?: JsonSchema;
};

type OpenApiRequestBody = {
  readonly content?: Record<string, OpenApiMedia>;
  readonly required?: boolean;
};

type OpenApiResponse = {
  readonly content?: Record<string, OpenApiMedia>;
};

type OpenApiOperation = {
  readonly operationId: string;
  readonly summary?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly parameters?: readonly OpenApiParameter[];
  readonly requestBody?: OpenApiRequestBody;
  readonly responses?: Record<string, OpenApiResponse>;
  readonly security?: readonly Record<string, readonly string[]>[];
};

type OpenApiPathItem = Partial<Record<Lowercase<HttpMethod>, OpenApiOperation>>;

type OpenApiDocument = {
  readonly openapi: string;
  readonly paths: Record<string, OpenApiPathItem>;
  readonly components?: {
    readonly schemas?: Record<string, JsonSchema>;
  };
  readonly security?: readonly Record<string, readonly string[]>[];
};

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type Operation = {
  readonly descriptorName: string;
  readonly hasRequiredRequest: boolean;
  readonly method: HttpMethod;
  readonly methodName: string;
  readonly operationId: string;
  readonly path: string;
  readonly requestClassName: string;
  readonly requestFields: readonly RequestField[];
  readonly responseBody: "json" | "none" | "text";
  readonly responseSchemaExpression?: string;
  readonly responseSchemaName?: string;
  readonly responseTypeExpression: string;
  readonly status: string;
  readonly summary?: string;
};

type RequestField = {
  readonly name: string;
  readonly required: boolean;
  readonly schemaExpression: string;
};

type Component = {
  readonly code: string;
  readonly name: string;
};

const repoRoot = new URL("../../..", import.meta.url);
const packageRoot = new URL("../", import.meta.url);
const openApiPath = new URL("openapi.json", packageRoot);
const generatedPath = new URL("src/_generated/Runpod.generated.ts", packageRoot);

const HTTP_METHODS = ["get", "post", "patch", "put", "delete"] as const;
const DYNAMIC_ENUM_HINTS = [
  "accelerator",
  "cpuFlavor",
  "cuda",
  "dataCenter",
  "dataCenterId",
  "gpuType",
  "gpuTypeId",
] as const;

let advisoryEnums: Record<string, readonly string[]> = {};

const main = async (): Promise<void> => {
  const raw = await Bun.file(openApiPath).text();
  const document = JSON.parse(raw) as OpenApiDocument;
  const components = document.components?.schemas ?? {};
  const operations = buildOperations(document);
  const code = renderGeneratedFile({
    components: pipe(
      Struct.entries(components),
      A.map(([name, schema]) => renderComponent(name, schema))
    ),
    operations,
  });

  await Bun.write(generatedPath, code);
  console.log(
    `Generated ${A.length(operations)} Runpod operations at ${pipe(generatedPath.pathname, Str.replace(repoRoot.pathname, ""))}`
  );
};

const buildOperations = (document: OpenApiDocument): readonly Operation[] => {
  let methodCounts: Record<string, number> = {};
  const operations: Operation[] = [];

  for (const [path, pathItem] of Struct.entries(document.paths)) {
    for (const openApiMethod of HTTP_METHODS) {
      const operation = pathItem[openApiMethod];
      if (operation === undefined) {
        continue;
      }

      const method = Str.toUpperCase(openApiMethod) as HttpMethod;
      const baseMethodName = lowerFirst(operation.operationId);
      const disambiguated = disambiguateMethodName({
        baseMethodName,
        method,
        methodCounts,
        path,
      });
      methodCounts = disambiguated.methodCounts;
      const methodName = disambiguated.methodName;
      const requestClassName = `${upperFirst(methodName)}Request`;
      const descriptorName = `${methodName}Operation`;
      const parameters = operation.parameters ?? [];
      const bodySchema = operation.requestBody?.content?.["application/json"]?.schema;
      const requestFields = renderRequestFields(parameters, bodySchema);
      const response = chooseResponse(operation.responses ?? {});

      operations.push({
        descriptorName,
        hasRequiredRequest: pipe(
          requestFields,
          A.some((field) => field.required)
        ),
        method,
        methodName,
        operationId: operation.operationId,
        path,
        requestClassName,
        requestFields,
        responseBody: response.body,
        responseSchemaExpression: response.schemaExpression,
        responseSchemaName: response.schemaName,
        responseTypeExpression: response.typeExpression,
        status: response.status,
        summary: operation.summary,
      });
    }
  }

  return operations;
};

const disambiguateMethodName = (input: {
  readonly baseMethodName: string;
  readonly method: HttpMethod;
  readonly methodCounts: Record<string, number>;
  readonly path: string;
}): {
  readonly methodCounts: Record<string, number>;
  readonly methodName: string;
} => {
  const count = pipe(
    input.methodCounts,
    R.get(input.baseMethodName),
    O.getOrElse(() => 0)
  );
  const methodCounts = R.set(input.methodCounts, input.baseMethodName, count + 1);

  if (count === 0) {
    return {
      methodCounts,
      methodName: input.baseMethodName,
    };
  }

  if (input.method === "POST" && pipe(input.path, Str.endsWith("/update"))) {
    return {
      methodCounts,
      methodName: `${input.baseMethodName}ViaPost`,
    };
  }

  return {
    methodCounts,
    methodName: `${input.baseMethodName}${count + 1}`,
  };
};

const renderRequestFields = (
  parameters: readonly OpenApiParameter[],
  bodySchema?: JsonSchema
): readonly RequestField[] => {
  const fields: RequestField[] = [];

  for (const parameter of parameters) {
    if (parameter.in !== "path" && parameter.in !== "query") {
      continue;
    }

    fields.push({
      name: parameter.name,
      required: parameter.in === "path" || parameter.required === true,
      schemaExpression: schemaExpression(parameter.schema ?? { type: "string" }, parameter.name),
    });
  }

  if (bodySchema !== undefined) {
    fields.push({
      name: "body",
      required: true,
      schemaExpression: schemaExpression(bodySchema, "body"),
    });
  }

  return fields;
};

const chooseResponse = (
  responses: Record<string, OpenApiResponse>
): {
  readonly body: "json" | "none" | "text";
  readonly schemaExpression?: string;
  readonly schemaName?: string;
  readonly status: string;
  readonly typeExpression: string;
} => {
  const status = pipe(
    ["200", "201", "202", "204"],
    A.findFirst((candidate) => responses[candidate] !== undefined)
  );
  const selectedStatus = pipe(
    status,
    O.getOrElse(() =>
      pipe(
        Struct.keys(responses),
        A.head,
        O.getOrElse(() => "200")
      )
    )
  );
  const response = responses[selectedStatus];
  const content = response?.content ?? {};
  const jsonSchema = content["application/json"]?.schema;
  const textSchema = content["text/plain"]?.schema ?? content["text/html"]?.schema ?? content["text/markdown"]?.schema;

  if (jsonSchema !== undefined) {
    const refName = refNameFromSchema(jsonSchema);
    if (refName !== undefined) {
      return {
        body: "json",
        schemaExpression: refName,
        status: selectedStatus,
        typeExpression: refName,
      };
    }

    const schemaName = `Status${selectedStatus}Response`;
    return {
      body: "json",
      schemaExpression: schemaExpression(jsonSchema, schemaName),
      schemaName,
      status: selectedStatus,
      typeExpression: `typeof ${schemaName}.Type`,
    };
  }

  if (textSchema !== undefined || R.has(content, "text/html")) {
    return {
      body: "text",
      schemaExpression: "S.String",
      schemaName: `Status${selectedStatus}TextResponse`,
      status: selectedStatus,
      typeExpression: "string",
    };
  }

  return {
    body: "none",
    status: selectedStatus,
    typeExpression: "void",
  };
};

const renderGeneratedFile = (input: {
  readonly components: readonly Component[];
  readonly operations: readonly Operation[];
}): string => {
  let responseSchemas: Record<string, string> = {};
  for (const operation of input.operations) {
    if (operation.responseSchemaName !== undefined && operation.responseSchemaExpression !== undefined) {
      responseSchemas = R.set(responseSchemas, operation.responseSchemaName, operation.responseSchemaExpression);
    }
  }

  return `${renderHeader()}

${pipe(
  input.components,
  A.map((component) => component.code),
  A.join("\n\n")
)}

${renderAdvisoryEnums()}

${pipe(
  Struct.entries(responseSchemas),
  A.map(([name, expression]) => renderSchemaAlias(name, expression)),
  A.join("\n\n")
)}

${pipe(input.operations, A.map(renderRequestClass), A.join("\n\n"))}

${renderOperationDescriptorClass(input.operations)}

${pipe(input.operations, A.map(renderOperationDescriptor), A.join("\n\n"))}

${renderOperationSpecs(input.operations)}

${renderOperationsShape(input.operations)}
`;
};

const renderHeader = (): string => `/**
 * Generated Runpod REST schemas and operation descriptors.
 * Do not edit this file by hand.
 * cspell:words CUDA FHHL Mbps VCPU dtos vcpu
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { pipe, type Effect } from "effect";
import * as S from "effect/Schema";

import { $RunpodId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $RunpodId.create("Runpod.generated");
`;

const renderComponent = (name: string, schema: JsonSchema): Component => {
  if (schema.type === "object" || schema.properties !== undefined) {
    const required = schema.required ?? [];
    const properties = Struct.entries(schema.properties ?? {});
    const fields = pipe(
      properties,
      A.map(([propertyName, propertySchema]) => {
        const expression = schemaExpression(propertySchema, propertyName);
        const renderedExpression = pipe(required, A.contains(propertyName))
          ? expression
          : optionalExpression(expression);

        return `    ${propertyName}: ${renderedExpression},`;
      })
    );

    return {
      code: `/**
 * ${name} model returned by the Runpod REST API.
 *
 * @category models
 * @since 0.1.0
 */
export class ${name} extends S.Class<${name}>($I\`${name}\`)(
  {
${pipe(fields, A.join("\n"))}
  },
  $I.annote("${name}", {
    description: "${name} model returned by the Runpod REST API.",
  })
) {}`,
      name,
    };
  }

  return {
    code: renderSchemaAlias(name, schemaExpression(schema, name)),
    name,
  };
};

const renderSchemaAlias = (name: string, expression: string): string => {
  const annotation = `$I.annoteSchema("${name}", {
    description: "${name} schema generated from the Runpod OpenAPI document.",
  })`;
  const expressionWithAnnotation =
    pipe(expression, Str.endsWith(".pipe(S.Array)")) && pipe(expression, Str.includes("\n"))
      ? `pipe(
  ${Str.slice(0, -".pipe(S.Array)".length)(expression)},
  S.Array,
  ${annotation},
)`
      : pipeExpression(expression, annotation);

  return `/**
 * ${name} schema generated from the Runpod OpenAPI document.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ${name} = ${expressionWithAnnotation};

/**
 * ${name} value generated from the Runpod OpenAPI document.
 *
 * @category type-level
 * @since 0.1.0
 */
export type ${name} = typeof ${name}.Type;`;
};

const renderAdvisoryEnums = (): string => {
  const entries = pipe(
    Struct.entries(advisoryEnums),
    A.sort(([left], [right]) => left.localeCompare(right))
  );

  if (A.isReadonlyArrayEmpty(entries)) {
    return "";
  }

  return pipe(
    entries,
    A.map(([name, values]) => {
      const constantName = `RUNPOD_${BeepStr.screamingSnake(name)}_VALUES`;

      return `/**
 * Advisory ${name} values observed in the checked-in Runpod OpenAPI document.
 *
 * @category constants
 * @since 0.1.0
 */
export const ${constantName} = ${JSON.stringify(values)} as const;`;
    }),
    A.join("\n\n")
  );
};

const renderRequestClass = (operation: Operation): string => {
  const fields = pipe(
    operation.requestFields,
    A.map(
      (field) =>
        `    ${field.name}: ${field.required ? field.schemaExpression : optionalExpression(field.schemaExpression)},`
    )
  );

  return `/**
 * Request input for ${operation.operationId}.
 *
 * @category dtos
 * @since 0.1.0
 */
export class ${operation.requestClassName} extends S.Class<${operation.requestClassName}>($I\`${operation.requestClassName}\`)(
  {
${pipe(fields, A.join("\n"))}
  },
  $I.annote("${operation.requestClassName}", {
    description: "Request input for ${operation.operationId}.",
  })
) {}`;
};

const renderOperationDescriptorClass = (operations: readonly Operation[]): string => {
  const methods = unique(
    pipe(
      operations,
      A.map((operation) => operation.method)
    )
  );
  const operationIds = unique(
    pipe(
      operations,
      A.map((operation) => operation.operationId)
    )
  );

  return `/**
 * Supported Runpod HTTP methods.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RunpodHttpMethod = LiteralKit(${JSON.stringify(methods)});

/**
 * Supported Runpod HTTP method.
 *
 * @category type-level
 * @since 0.1.0
 */
export type RunpodHttpMethod = typeof RunpodHttpMethod.Type;

/**
 * Operation ids exposed by Runpod REST API v1.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RunpodOperationId = LiteralKit(${JSON.stringify(operationIds)});

/**
 * Operation id exposed by Runpod REST API v1.
 *
 * @category type-level
 * @since 0.1.0
 */
export type RunpodOperationId = typeof RunpodOperationId.Type;

/**
 * Request body encoding used by a Runpod operation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RunpodRequestBodyKind = LiteralKit(["json", "none"]);

/**
 * Request body encoding used by a Runpod operation.
 *
 * @category type-level
 * @since 0.1.0
 */
export type RunpodRequestBodyKind = typeof RunpodRequestBodyKind.Type;

/**
 * Response body decoding used by a Runpod operation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RunpodResponseBodyKind = LiteralKit(["json", "none", "text"]);

/**
 * Response body decoding used by a Runpod operation.
 *
 * @category type-level
 * @since 0.1.0
 */
export type RunpodResponseBodyKind = typeof RunpodResponseBodyKind.Type;

/**
 * Static metadata for one Runpod REST operation.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodOperationDescriptor extends S.Class<RunpodOperationDescriptor>($I\`RunpodOperationDescriptor\`)(
  {
  authenticated: S.Boolean,
  method: RunpodHttpMethod,
  methodName: S.String,
  operationId: RunpodOperationId,
  path: S.String,
  pathParams: S.Array(S.String),
  queryParams: S.Array(S.String),
  requestBody: RunpodRequestBodyKind,
  responseBody: RunpodResponseBodyKind,
  status: S.String,
  },
  $I.annote("RunpodOperationDescriptor", {
    description: "Static metadata for one Runpod REST operation.",
  })
) {}`;
};

const renderOperationDescriptor = (operation: Operation): string => {
  const pathParams = pipe(
    operation.requestFields,
    A.filter((field) => pipe(operation.path, Str.includes(`{${field.name}}`))),
    A.map((field) => field.name)
  );
  const queryParams = pipe(
    operation.requestFields,
    A.filter((field) => field.name !== "body" && !pipe(operation.path, Str.includes(`{${field.name}}`))),
    A.map((field) => field.name)
  );

  return `/**
 * Descriptor for ${operation.operationId}.
 *
 * @category constants
 * @since 0.1.0
 */
export const ${operation.descriptorName} = new RunpodOperationDescriptor({
  authenticated: ${operation.operationId === "GetOpenAPI" || operation.operationId === "GetDocs" ? "false" : "true"},
  method: "${operation.method}",
  methodName: "${operation.methodName}",
  operationId: "${operation.operationId}",
  path: "${operation.path}",
  pathParams: ${JSON.stringify(pathParams)},
  queryParams: ${JSON.stringify(queryParams)},
  requestBody: ${
    pipe(
      operation.requestFields,
      A.some((field) => field.name === "body")
    )
      ? '"json"'
      : '"none"'
  },
  responseBody: "${operation.responseBody}",
  status: "${operation.status}",
});`;
};

const renderOperationSpecs = (operations: readonly Operation[]): string => {
  const entries = pipe(
    operations,
    A.map((operation) => {
      const response = operation.responseSchemaName ?? operation.responseSchemaExpression;
      const responseField = response !== undefined ? `,\n    response: ${response}` : "";

      return `  ${operation.methodName}: {
    descriptor: ${operation.descriptorName},
    request: ${operation.requestClassName}${responseField},
  },`;
    })
  );

  return `/**
 * Generated operation spec table for Runpod service construction.
 *
 * @category constants
 * @since 0.1.0
 */
export const RUNPOD_OPERATION_SPECS = {
${pipe(entries, A.join("\n"))}
};`;
};

const renderOperationsShape = (operations: readonly Operation[]): string => {
  const methods = pipe(
    operations,
    A.map((operation) => {
      const requestParameter = operation.hasRequiredRequest
        ? `request: ${operation.requestClassName}`
        : `request?: ${operation.requestClassName}`;

      return `  readonly ${operation.methodName}: (${requestParameter}) => Effect.Effect<${operation.responseTypeExpression}, E>;`;
    })
  );

  return `/**
 * Typed method surface generated from Runpod REST API v1.
 *
 * @category services
 * @since 0.1.0
 */
export interface RunpodOperationsShape<E> {
${pipe(methods, A.join("\n"))}
}`;
};

const schemaExpression = (schema: JsonSchema, hint: string): string => {
  const refName = refNameFromSchema(schema);
  if (refName !== undefined) {
    return wrapNullable(schema, `S.suspend(() => ${refName})`);
  }

  if (schema.enum !== undefined) {
    const values = pipe(schema.enum, A.filter(P.isString));
    if (A.isReadonlyArrayNonEmpty(values) && shouldTrackAdvisoryEnum(hint)) {
      advisoryEnums = R.set(advisoryEnums, BeepStr.camelCase(hint), values);
    }

    return wrapNullable(schema, "S.String");
  }

  const type = A.isArray(schema.type) ? schema.type[0] : schema.type;

  return Match.type<string | undefined>().pipe(
    Match.when("array", () =>
      wrapNullable(schema, pipeExpression(schemaExpression(schema.items ?? { type: "unknown" }, hint), "S.Array"))
    ),
    Match.when("boolean", () => wrapNullable(schema, "S.Boolean")),
    Match.whenOr("integer", "number", () => wrapNullable(schema, "S.Number")),
    Match.when("object", () => {
      if (schema.properties !== undefined) {
        const required = schema.required ?? [];
        const properties = pipe(
          Struct.entries(schema.properties),
          A.map(([propertyName, propertySchema]) => {
            const expression = schemaExpression(propertySchema, propertyName);
            const renderedExpression = pipe(required, A.contains(propertyName))
              ? expression
              : optionalExpression(expression);

            return `    ${propertyName}: ${renderedExpression},`;
          })
        );

        return wrapNullable(schema, `S.Struct({\n${pipe(properties, A.join("\n"))}\n  })`);
      }

      if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
        const valueSchema =
          schema.additionalProperties === true ? "S.Unknown" : schemaExpression(schema.additionalProperties, hint);

        return wrapNullable(schema, `S.Record(S.String, ${valueSchema})`);
      }

      return wrapNullable(schema, "S.Record(S.String, S.Unknown)");
    }),
    Match.when("string", () => wrapNullable(schema, "S.String")),
    Match.orElse(() => wrapNullable(schema, "S.Unknown"))
  )(type);
};

const pipeExpression = (expression: string, operation: string): string => {
  const pipeMatch = /^([^\n]*\.pipe\()([\s\S]*)\)$/.exec(expression);

  return pipeMatch === null ? `${expression}.pipe(${operation})` : `${pipeMatch[1]}${pipeMatch[2]}, ${operation})`;
};

const optionalExpression = (expression: string): string => pipeExpression(expression, "S.optionalKey");

const wrapNullable = (schema: JsonSchema, expression: string): string =>
  schema.nullable === true ? pipeExpression(expression, "S.NullOr") : expression;

const refNameFromSchema = (schema: JsonSchema): string | undefined => {
  if (schema.$ref === undefined) {
    return undefined;
  }

  return pipe(schema.$ref, Str.replace("#/components/schemas/", ""));
};

const shouldTrackAdvisoryEnum = (hint: string): boolean =>
  pipe(
    DYNAMIC_ENUM_HINTS,
    A.some((dynamicHint) => pipe(hint, Str.toLowerCase, Str.includes(pipe(dynamicHint, Str.toLowerCase))))
  );

const lowerFirst = Str.uncapitalize;

const upperFirst = Str.capitalize;

const unique = <Value>(values: readonly Value[]): readonly Value[] => A.dedupe(values);

await main();
