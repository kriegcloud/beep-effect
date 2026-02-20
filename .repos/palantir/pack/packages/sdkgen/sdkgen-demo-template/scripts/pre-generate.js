export default async function preGenerate(context) {
  const { projectName, schema, answers, templateConfig } = context;

  console.log(`🚀 Preparing to generate ${projectName}`);
  console.log(`📋 Using template: ${templateConfig.name}`);
  console.log(`👤 Author: ${answers.author}`);

  // Validate schema
  if (!schema || Object.keys(schema).length === 0) {
    console.warn("⚠️  Warning: Schema is empty or not provided");
  }

  // Add additional data to context
  context.additionalData = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    templateVersion: "1.0.0",
  };

  return context;
}
