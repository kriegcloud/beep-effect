/** Human-operated entrypoint; implementation owns its Effect dependency in repo-cli. */
const { startKnowledgeMintRegistration } = await import(
  "../../packages/tooling/tool/cli/scripts/CreateKnowledgeMintApp.ts"
);
await startKnowledgeMintRegistration();
