const effectImportPathOverrides = new Map<string, string>([
  ["effect/encoding", "effect/Encoding"],
  ["effect/encoding/Base64", "effect/Encoding"],
  ["effect/encoding/Base64Url", "effect/Encoding"],
  ["effect/encoding/EncodingError", "effect/Encoding"],
  ["effect/encoding/Hex", "effect/Encoding"],
  ["effect/PartitionedSemaphore", "effect/Semaphore"],
]);

export const resolveModuleImportPath = (packageName: string, moduleName: string): string => {
  const sourceImportPath = `${packageName}/${moduleName}`;
  return effectImportPathOverrides.get(sourceImportPath) ?? sourceImportPath;
};
