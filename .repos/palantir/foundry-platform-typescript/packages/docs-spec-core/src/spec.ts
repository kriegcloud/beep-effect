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

// Spec types
export type SnippetVariables = {
  [VariableName: string]: "required" | "optional";
};

export type DocsSnippetsSpec = {
  version: 1;
  snippets: {
    [SnippetName: string]: {
      variables: SnippetVariables;
    };
  };
};

export type SnippetNames<S extends DocsSnippetsSpec> = keyof S["snippets"];

export type VariablesForSnippet<
  S extends DocsSnippetsSpec,
  T extends SnippetNames<S>,
> =
  & {
    [
      K in keyof VariablesForSnippetConfig<
        S,
        T
      > as VariablesForSnippetConfig<S, T>[K] extends "required" ? K : never
    ]: any;
  }
  & {
    [
      K in keyof VariablesForSnippetConfig<
        S,
        T
      > as VariablesForSnippetConfig<S, T>[K] extends "optional" ? K : never
    ]?: any;
  };

type VariablesForSnippetConfig<
  S extends DocsSnippetsSpec,
  T extends SnippetNames<S>,
> = S["snippets"][T]["variables"];

// For implementers

export interface BaseSnippet {
  title?: string;
  status?: "ga" | "public-beta";
  computedVariables?: string[];
}

export type SdkSnippet = BaseSnippet & {
  template: string;
};

// Distributive conditional type to extract keys from a union type
type UnionKeys<T> = T extends Record<infer Keys, any> ? Keys : never;

type ComputedVariablesType<S extends DocsSnippetsSpec> = Record<
  string,
  (
    args: Partial<
      Record<
        UnionKeys<S["snippets"][SnippetNames<S>]["variables"]>,
        any
      >
    >,
  ) => any
>;

export type SdkSnippets<S extends DocsSnippetsSpec> = {
  kind: "sdk";
  versions: {
    [version: string]: {
      snippets:
        & {
          [KnownSnippet in SnippetNames<S>]?: SdkSnippet[];
        }
        & {
          [UnknownSnippet: string]: SdkSnippet[];
        };
    };
  };
  computedVariables?: ComputedVariablesType<S>;
};

export type ApiSnippet = BaseSnippet & {
  endpoint: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "WebSocket";
    path: string;
    headers: Record<string, string>;
  };
  body?: string;
  response?: string;
};

export type ApiSnippets<S extends DocsSnippetsSpec> = {
  kind: "api";
  versions: {
    [version: string]: {
      snippets:
        & {
          [KnownSnippet in SnippetNames<S>]?: ApiSnippet[];
        }
        & {
          [UnknownSnippet: string]: ApiSnippet[];
        };
    };
  };
  computedVariables?: ComputedVariablesType<S>;
};

export type DocsSnippets<S extends DocsSnippetsSpec> =
  | SdkSnippets<S>
  | ApiSnippets<S>;
