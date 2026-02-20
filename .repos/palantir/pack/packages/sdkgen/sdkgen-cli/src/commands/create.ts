/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from "fs-extra";
import path from "path";
import { ContextBuilder } from "../core/contextBuilder.js";
import { Generator } from "../core/generator.js";
import { SchemaParser } from "../core/schemaParser.js";
import { TemplateLoader } from "../core/templateLoader.js";
import type { CreateCommandOptions, TemplateUtils } from "../types/index.js";
import { Logger } from "../utils/logger.js";
import { promptUser } from "../utils/prompts.js";

export async function createCommand(
  projectName: string,
  options: CreateCommandOptions,
): Promise<void> {
  const logger = new Logger(options.verbose);

  try {
    logger.info(`Creating SDK project: ${projectName}`);

    // Set output path
    const outputPath = path.resolve(projectName);

    // Check if directory already exists
    if (await fs.pathExists(outputPath)) {
      if (options.overwrite) {
        logger.info(`Directory ${projectName} exists, continuing with overwrite`);
      } else {
        throw new Error(`Directory ${projectName} already exists`);
      }
    }

    // Load template
    const templateLoader = new TemplateLoader(logger);
    const templateName = options.template || "default";
    logger.debug(`Loading template: ${templateName}`);

    const { config: templateConfig, templateDir } = await templateLoader.loadTemplate(templateName);
    logger.success(`Template loaded: ${templateConfig.name}`);

    // Load schema
    const schemaParser = new SchemaParser(logger);
    const schema = await schemaParser.loadSchema(options.schema);
    if (options.schema) {
      logger.success("Schema loaded successfully");
    }

    // Prompt user for additional configuration
    let answers: Record<string, unknown> = {};

    // Load config from file or object if provided
    if (options.config) {
      if (typeof options.config === "string") {
        // Load from file path
        try {
          const configPath = path.resolve(options.config);
          const configContent = await fs.readFile(configPath, "utf-8");
          answers = JSON.parse(configContent) as Record<string, unknown>;
          logger.debug(`Using config from ${configPath}: ${JSON.stringify(answers)}`);
        } catch (error) {
          throw new Error(
            `Failed to load config file: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      } else {
        // Use provided object directly
        answers = options.config;
        logger.debug(`Using config object: ${JSON.stringify(answers)}`);
      }
    }

    // Transform schema if transformer is defined
    let transformedSchema = schema;
    if (templateConfig.transformers?.default) {
      logger.debug("Applying schema transformer");
      const transformer = templateConfig.transformers.default;

      if (typeof transformer === "string") {
        // Load transformer from file
        const transformerPath = path.join(templateDir, transformer);
        const { default: transformFn } = await import(transformerPath) as {
          default: (schema: unknown, context: unknown) => Promise<unknown>;
        };
        transformedSchema = await transformFn(schema, {
          projectName,
          schema,
          answers,
          templateConfig,
          schemaPath: options.schema,
          outputPath,
          options: {
            skipInstall: options.skipInstall,
            verbose: options.verbose,
            dryRun: options.dryRun,
          },
          utils: {} as TemplateUtils,
        });
      } else if (typeof transformer === "function") {
        transformedSchema = await transformer(schema, {
          projectName,
          schema,
          answers,
          templateConfig,
          schemaPath: options.schema,
          outputPath,
          options: {
            skipInstall: options.skipInstall,
            verbose: options.verbose,
            dryRun: options.dryRun,
          },
          utils: {} as TemplateUtils,
        });
      }
    }

    if (templateConfig.prompts && templateConfig.prompts.length > 0) {
      if (options.nonInteractive || process.env.CI) {
        // Use default values from prompts for missing answers
        for (const prompt of templateConfig.prompts) {
          if (!(prompt.name in answers) && prompt.default !== undefined) {
            answers[prompt.name] = prompt.default;
          }
        }
        logger.debug("Running in non-interactive mode with defaults");
      } else {
        // Filter out prompts that already have answers
        const unansweredPrompts = templateConfig.prompts.filter(
          prompt => !(prompt.name in answers),
        );
        if (unansweredPrompts.length > 0) {
          logger.info("Please answer the following questions:");
          const newAnswers = await promptUser(unansweredPrompts);
          answers = { ...answers, ...newAnswers };
        }
      }
    }

    // Build generator context
    const contextBuilder = new ContextBuilder();
    const context = contextBuilder.build(
      projectName,
      transformedSchema,
      answers,
      templateConfig,
      outputPath,
      {
        skipInstall: options.skipInstall,
        verbose: options.verbose,
        dryRun: options.dryRun,
      },
      options.schema,
    );

    // Generate SDK
    const generator = new Generator(context, templateDir, logger);
    await generator.generate();

    if (!options.dryRun) {
      logger.success(`🎉 SDK project created successfully!`);
      logger.info(`Next steps:`);
      logger.info(`  cd ${projectName}`);
      if (options.skipInstall) {
        logger.info(`  npm install`);
      }
      logger.info(`  npm run build`);
    } else {
      logger.success("✨ Dry run completed. No files were written.");
    }
  } catch (error) {
    logger.error(`Failed to create SDK: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
