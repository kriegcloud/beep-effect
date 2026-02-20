export default async function transform(schema, context) {
  // Transform the raw schema into a format the templates can use
  return {
    version: schema.version || "1.0.0",
    description: schema.description || "Auto-generated SDK",
    endpoints: extractEndpoints(schema),
    types: extractTypes(schema),
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceFile: context.schemaPath || "none",
      projectName: context.projectName,
    },
  };
}

function extractEndpoints(schema) {
  // Extract API endpoints from schema
  if (schema.endpoints) {
    return schema.endpoints;
  }

  if (schema.paths) {
    // OpenAPI style
    return Object.entries(schema.paths).map(([path, methods]) => ({
      path,
      methods: Object.keys(methods),
    }));
  }

  return [];
}

function extractTypes(schema) {
  // Extract type definitions from schema
  if (schema.types) {
    return schema.types;
  }

  if (schema.definitions) {
    // JSON Schema style
    return schema.definitions;
  }

  if (schema.components?.schemas) {
    // OpenAPI style
    return schema.components.schemas;
  }

  return {};
}
