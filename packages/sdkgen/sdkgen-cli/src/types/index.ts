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

export interface GeneratorContext {
  readonly projectName: string;
  readonly schema: unknown;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly templateConfig: TemplateConfig;
  readonly schemaPath?: string;
  readonly outputPath: string;
  readonly options: GeneratorOptions;
  readonly utils: TemplateUtils;
  readonly additionalData?: Readonly<Record<string, unknown>>;
}

export interface GeneratorOptions {
  readonly skipInstall?: boolean;
  readonly verbose?: boolean;
  readonly dryRun?: boolean;
}

export interface TemplateConfig {
  readonly name: string;
  readonly description?: string;
  readonly prompts?: PromptQuestion[];
  readonly templateFiles?: readonly string[];
  readonly staticFiles?: readonly string[];
  readonly hooks?: {
    readonly beforeGenerate?: string | ((context: GeneratorContext) => Promise<GeneratorContext>);
    readonly afterGenerate?:
      | string
      | ((context: GeneratorContext, outputPath: string) => Promise<void>);
    readonly beforeInstall?:
      | string
      | ((context: GeneratorContext, outputPath: string) => Promise<void>);
    readonly afterInstall?:
      | string
      | ((context: GeneratorContext, outputPath: string) => Promise<void>);
  };
  readonly transformers?: {
    readonly [key: string]:
      | string
      | ((schema: unknown, context: GeneratorContext) => Promise<unknown>);
  };
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
}

export interface PromptQuestion {
  readonly type: "input" | "number" | "confirm" | "list" | "checkbox" | "password";
  readonly name: string;
  readonly message: string;
  readonly default?: unknown;
  readonly choices?:
    | readonly string[]
    | readonly { readonly name: string; readonly value: unknown }[];
  readonly validate?: (input: unknown) => boolean | string;
  readonly when?: (answers: Readonly<Record<string, unknown>>) => boolean;
}

export interface TemplateUtils {
  readonly camelCase: (str: string) => string;
  readonly capitalize: (str: string) => string;
  readonly kebabCase: (str: string) => string;
  readonly lower: (str: string) => string;
  readonly pascalCase: (str: string) => string;
  readonly pluralize: (str: string) => string;
  readonly singularize: (str: string) => string;
  readonly snakeCase: (str: string) => string;
  readonly upper: (str: string) => string;
}

export interface CreateCommandOptions {
  readonly config?: string | Record<string, unknown>;
  readonly dryRun?: boolean;
  readonly nonInteractive?: boolean;
  readonly overwrite?: boolean;
  readonly schema?: string;
  readonly skipInstall?: boolean;
  readonly template?: string;
  readonly verbose?: boolean;
}
