#!/usr/bin/env node
import * as crypto from "node:crypto";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as O from "effect/Option";
import * as Random from "effect/Random";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

/** Tagged error for secret generation failures. */
class SecretGenerationError extends S.TaggedError<SecretGenerationError>()("SecretGenerationError", {
  message: S.String,
}) {}

/**
 * Generate a secure random secret using Effect's Random service
 * Equivalent to crypto.randomBytes(32).toString('base64')
 */
const generateSecret = Effect.gen(function* () {
  yield* Effect.log("Generating secure random secret (32 bytes)");

  // Generate 32 random bytes using Random.nextIntBetween for each byte
  const randomBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    randomBytes[i] = yield* Random.nextIntBetween(0, 256);
  }

  const base64Secret = Encoding.encodeBase64(randomBytes);

  yield* Effect.log(`Generated secret: ${base64Secret.slice(0, 8)}...`);
  return base64Secret;
});

/**
 * Generate a secure UUID using Node's crypto wrapped in Effect
 */
const generateUUID = Effect.gen(function* () {
  yield* Effect.log("Generating secure UUID");

  const uuid = yield* Effect.sync(() => `user__${crypto.randomUUID()}`);

  yield* Effect.log(`Generated UUID: ${uuid}`);
  return uuid;
});

/**
 * Generate all auto-fill values for environment variables
 */
const generateAutoFillValues = Effect.gen(function* () {
  yield* Console.log("\n🔐 Generating secure secrets for .env file...");
  yield* Effect.log("Starting auto-fill values generation");

  // Generate secrets in parallel for better performance
  const [redisPassword, betterAuthSecret, adminUserId1, adminUserId2] = yield* Effect.all(
    [generateSecret, generateSecret, generateUUID, generateUUID],
    { concurrency: "unbounded" }
  );

  const autoFillValues = {
    BETTER_AUTH_SECRET: betterAuthSecret,
    KV_REDIS_PASSWORD: redisPassword,
    APP_ADMIN_USER_IDS: `${adminUserId1},${adminUserId2}`,
  };

  yield* Console.log("\n✅ Generated secure values:");
  yield* Console.log(`🔧 BETTER_AUTH_SECRET: ${betterAuthSecret.slice(0, 8)}... (${betterAuthSecret.length} chars)`);
  yield* Console.log(`🗄️  KV_REDIS_PASSWORD: ${redisPassword.slice(0, 8)}... (${redisPassword.length} chars)`);
  yield* Console.log(`👥 APP_ADMIN_USER_IDS: ${adminUserId1},${adminUserId2}`);

  yield* Effect.log("Auto-fill values generation completed successfully");
  return autoFillValues;
});

/**
 * Read an existing .env file and return its raw content
 */
const readEnvFileRaw = Effect.fn("readEnvFileRaw")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const pathService = yield* Path.Path;
  const resolvedPath = pathService.resolve(filePath);

  yield* Effect.log(`Reading env file: ${resolvedPath}`);

  const exists = yield* fs.exists(resolvedPath);
  if (!exists) {
    yield* Console.log(`📄 File ${filePath} does not exist, will create new one`);
    return "";
  }

  const content = yield* fs.readFileString(resolvedPath, "utf8");

  const lineCount = content.split("\n").length;
  yield* Console.log(`📖 Read ${lineCount} lines from ${filePath}`);
  return content;
});

/**
 * Update specific environment variables in the raw .env content while preserving all formatting
 */
const updateEnvVariablesInContent: (content: string, updates: Record<string, string>) => Effect.Effect<string> =
  Effect.fn(function* (content, updates) {
    yield* Effect.log("Updating environment variables in content while preserving formatting");

    const lines = content.length === 0 ? [] : content.split("\n");
    const updatedLines: string[] = [];
    const remainingKeys = new Set(Struct.keys(updates));

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines - preserve as-is
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        updatedLines.push(line);
        continue;
      }

      // Check if this line defines one of our target variables
      let lineUpdated = false;
      for (const [key, newValue] of Struct.entries(updates)) {
        // Match patterns like: KEY="value" or KEY=value or KEY=${VAR}
        const keyPattern = new RegExp(`^(\\s*${key}\\s*=)(.*)$`);
        const match = line.match(keyPattern);

        if (match) {
          const prefix = match[1]; // "KEY=" part with any whitespace
          const oldValue = match[2]; // Current value part

          // Always wrap generated values in double quotes for consistency
          const quotedNewValue = `"${newValue}"`;

          const updatedLine = `${prefix}${quotedNewValue}`;
          yield* Console.log(`🔄 Updated ${key}: ${oldValue} → ${quotedNewValue}`);
          updatedLines.push(updatedLine);
          lineUpdated = true;
          remainingKeys.delete(key);
          break; // Found and updated, no need to check other keys
        }
      }

      // If no updates were made, keep the original line
      if (!lineUpdated) {
        updatedLines.push(line);
      }
    }

    if (remainingKeys.size > 0) {
      const needsSeparator =
        A.isNonEmptyArray(updatedLines) &&
        A.get(A.length(updatedLines) - 1)(updatedLines).pipe(
          O.match({
            onNone: () => false,
            onSome: (line) => line.trim().length > 0,
          })
        );

      if (needsSeparator) {
        updatedLines.push("");
      }

      for (const key of remainingKeys) {
        const value = updates[key];
        const quotedNewValue = `"${value}"`;
        const newLine = `${key}=${quotedNewValue}`;
        yield* Console.log(`➕ Added ${key}: ${quotedNewValue}`);
        updatedLines.push(newLine);
      }
    }

    return updatedLines.join("\n");
  });

/**
 * Write updated content to the .env file
 */
const writeEnvFileRaw = Effect.fn("writeEnvFileRaw")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const pathService = yield* Path.Path;
  const resolvedPath = pathService.resolve(filePath);

  yield* Effect.log(`Writing env file: ${resolvedPath}`);

  yield* fs.writeFileString(resolvedPath, content);

  const lineCount = content.split("\n").length;
  yield* Console.log(`💾 Wrote ${lineCount} lines to ${filePath}`);
});

/**
 * Update or create .env file with generated secrets
 */
const updateEnvFile = Effect.fn(function* (filePath = ".env") {
  yield* Console.log(`\n🔄 Updating ${filePath} with generated secrets...`);

  const pathService = yield* Path.Path;
  const currentDir = process.cwd();
  const monorepoRoot = yield* findRepoRoot;
  const resolvedFilePath = pathService.isAbsolute(filePath) ? filePath : pathService.resolve(monorepoRoot, filePath);

  yield* Console.log(`📍 Current directory: ${currentDir}`);
  yield* Console.log(`📍 Monorepo root: ${monorepoRoot}`);
  yield* Console.log(`📍 Resolved path: ${resolvedFilePath}`);

  // Read existing .env file
  const existingContent = yield* readEnvFileRaw(resolvedFilePath);

  // Generate new secrets
  const autoFillValues = yield* generateAutoFillValues;

  // Update the environment variables in the content
  const updatedContent = yield* updateEnvVariablesInContent(existingContent, autoFillValues);

  // Write back to file
  yield* writeEnvFileRaw(resolvedFilePath, updatedContent);

  yield* Console.log(`\n🎉 Successfully updated ${resolvedFilePath}!`);
  yield* Console.log(`📊 Total variables: ${Struct.keys(autoFillValues).length}`);
  yield* Console.log(`🆕 Added/Updated: ${Struct.keys(autoFillValues).length}`);

  return {
    totalVariables: Struct.keys(autoFillValues).length,
    updatedVariables: Struct.keys(autoFillValues).length,
  };
});

const generateEnvSecrets = Effect.gen(function* () {
  yield* Console.log("🐝 BEEP Environment Secrets Generator");
  yield* Console.log("=====================================");
  yield* Effect.log("Starting environment secrets generation");

  // Check command line arguments for custom .env file path
  const args = process.argv.slice(2);
  const envFilePath = args[0] || ".env";

  yield* Console.log(`🎯 Target file: ${envFilePath}`);

  const result = yield* updateEnvFile(envFilePath).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.log(`Error occurred: ${String(error)}`);
        yield* Console.log(`❌ Failed to generate secrets: ${String(error)}`);
        return { error: String(error) };
      })
    )
  );

  if ("error" in result) {
    yield* Effect.log("Program completed with errors");
    return yield* new SecretGenerationError({ message: result.error });
  }

  yield* Console.log("\n✨ All secrets generated successfully!");
  yield* Console.log("🔐 Your .env file is now ready with secure random values.");
  yield* Console.log("\n💡 Next steps:");
  yield* Console.log("   1. Review the generated values in your .env file");
  yield* Console.log("   2. Add any additional configuration as needed");
  yield* Console.log("   3. Never commit your .env file to version control");

  yield* Effect.log("Program completed successfully");
  return result;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.log(`Fatal error: ${String(error)}`);
      yield* Console.log(`💥 Fatal error: ${String(error)}`);
      return yield* Effect.void; // This won't be reached due to process.exit
    })
  )
);
/**
 * Main program to generate and update .env secrets
 */

// Run the program
BunRuntime.runMain(generateEnvSecrets.pipe(Effect.provide(BunContext.layer)));

export { generateSecret, generateUUID, generateAutoFillValues, updateEnvFile, generateEnvSecrets };
