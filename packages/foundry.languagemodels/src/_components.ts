/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: SAFE
 */
export interface AnthropicAnyToolChoice {
  disableParallelToolUse?: AnthropicDisableParallelToolUse;
}

/**
 * Log Safety: SAFE
 */
export interface AnthropicAutoToolChoice {
  disableParallelToolUse?: AnthropicDisableParallelToolUse;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicBase64PdfDocumentSource {
  data: string;
}

/**
 * Log Safety: SAFE
 */
export type AnthropicCacheControl = {
  type: "ephemeral";
} & AnthropicEphemeralCacheControl;

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCharacterLocationCitation {
  citedText: string;
  documentIndex: number;
  documentTitle?: string;
  startCharIndex: number;
  endCharIndex: number;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicCompletionCitation = {
  type: "charLocation";
} & AnthropicCharacterLocationCitation;

/**
 * Log Safety: UNSAFE
 */
export type AnthropicCompletionContent =
  | ({ type: "toolUse" } & AnthropicCompletionToolUse)
  | ({ type: "text" } & AnthropicCompletionText)
  | ({ type: "thinking" } & AnthropicCompletionThinking)
  | ({ type: "redactedThinking" } & AnthropicCompletionRedactedThinking);

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCompletionRedactedThinking {
  data: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCompletionText {
  text: string;
  citations?: Array<AnthropicCompletionCitation>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCompletionThinking {
  signature: string;
  thinking: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCompletionToolUse {
  id: string;
  input: any;
  name: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicCustomTool {
  name: string;
  description?: string;
  inputSchema: JsonSchema;
}

/**
 * Log Safety: SAFE
 */
export interface AnthropicDisabledThinking {}

/**
   * Whether to disable parallel tool use. Defaults to false. If set to true, the model will output
exactly one tool use.
   *
   * Log Safety: SAFE
   */
export type AnthropicDisableParallelToolUse = boolean;

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicDocument {
  source: AnthropicDocumentSource;
  cacheControl?: AnthropicCacheControl;
  citations?: AnthropicDocumentCitations;
  context?: string;
  title?: string;
}

/**
 * Log Safety: SAFE
 */
export interface AnthropicDocumentCitations {
  enabled: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicDocumentSource =
  | ({ type: "pdf" } & AnthropicBase64PdfDocumentSource)
  | ({ type: "text" } & AnthropicTextDocumentSource);

/**
 * Log Safety: SAFE
 */
export interface AnthropicEnabledThinking {
  budgetTokens: number;
}

/**
 * This currently does not support the ttl field, but will in the future.
 *
 * Log Safety: SAFE
 */
export interface AnthropicEphemeralCacheControl {}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicImage {
  source: AnthropicImageSource;
  cacheControl?: AnthropicCacheControl;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicImageBase64Source {
  data: string;
  mediaType: AnthropicMediaType;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicImageSource = {
  type: "base64";
} & AnthropicImageBase64Source;

/**
 * Log Safety: SAFE
 */
export type AnthropicMediaType =
  | "IMAGE_JPEG"
  | "IMAGE_PNG"
  | "IMAGE_GIF"
  | "IMAGE_WEBP";

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicMessage {
  content: Array<AnthropicMessageContent>;
  role: AnthropicMessageRole;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicMessageContent =
  | ({ type: "image" } & AnthropicImage)
  | ({ type: "toolUse" } & AnthropicToolUse)
  | ({ type: "document" } & AnthropicDocument)
  | ({ type: "text" } & AnthropicText)
  | ({ type: "toolResult" } & AnthropicToolResult)
  | ({ type: "thinking" } & AnthropicThinking)
  | ({ type: "redactedThinking" } & AnthropicRedactedThinking);

/**
 * Log Safety: SAFE
 */
export type AnthropicMessageRole = "USER" | "ASSISTANT";

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicMessagesRequest {
  messages: Array<AnthropicMessage>;
  maxTokens: number;
  stopSequences?: Array<string>;
  system?: Array<AnthropicSystemMessage>;
  temperature?: number;
  thinking?: AnthropicThinkingConfig;
  toolChoice?: AnthropicToolChoice;
  tools?: Array<AnthropicTool>;
  topK?: number;
  topP?: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicMessagesResponse {
  content: Array<AnthropicCompletionContent>;
  id: string;
  model: string;
  role: AnthropicMessageRole;
  stopReason?: string;
  stopSequence?: string;
  usage: AnthropicTokenUsage;
}

/**
 * Log Safety: SAFE
 */
export interface AnthropicModel {
  modelId: LanguageModelApiName;
}

/**
 * Log Safety: SAFE
 */
export interface AnthropicNoneToolChoice {}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicRedactedThinking {
  data: string;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicSystemMessage = { type: "text" } & AnthropicText;

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicText {
  text: string;
  citations?: Array<AnthropicCompletionCitation>;
  cacheControl?: AnthropicCacheControl;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicTextDocumentSource {
  data: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicThinking {
  signature: string;
  thinking: string;
}

/**
 * Log Safety: SAFE
 */
export type AnthropicThinkingConfig =
  | ({ type: "disabled" } & AnthropicDisabledThinking)
  | ({ type: "enabled" } & AnthropicEnabledThinking);

/**
 * Log Safety: SAFE
 */
export interface AnthropicTokenUsage {
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicTool = { type: "custom" } & AnthropicCustomTool;

/**
 * Log Safety: UNSAFE
 */
export type AnthropicToolChoice =
  | ({ type: "auto" } & AnthropicAutoToolChoice)
  | ({ type: "none" } & AnthropicNoneToolChoice)
  | ({ type: "any" } & AnthropicAnyToolChoice)
  | ({ type: "tool" } & AnthropicToolToolChoice);

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicToolResult {
  toolUseId: string;
  content?: Array<AnthropicToolResultContent>;
  isError?: boolean;
  cacheControl?: AnthropicCacheControl;
}

/**
 * Log Safety: UNSAFE
 */
export type AnthropicToolResultContent = { type: "text" } & AnthropicText;

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicToolToolChoice {
  name: string;
  disableParallelToolUse?: AnthropicDisableParallelToolUse;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicToolUse {
  id: string;
  input: any;
  name: string;
  cacheControl?: AnthropicCacheControl;
}

/**
 * Log Safety: UNSAFE
 */
export interface AnthropicUrlDocumentSource {
  url: string;
}

/**
 * Log Safety: UNSAFE
 */
export type JsonSchema = Record<string, any>;

/**
 * The name of the LanguageModel in the API.
 *
 * Log Safety: SAFE
 */
export type LanguageModelApiName = LooselyBrandedString<"LanguageModelApiName">;

/**
 * Log Safety: UNSAFE
 */
export type OpenAiEmbeddingInput = Array<string>;

/**
 * Log Safety: UNSAFE
 */
export interface OpenAiEmbeddingsRequest {
  input: OpenAiEmbeddingInput;
  dimensions?: number;
  encodingFormat?: OpenAiEncodingFormat;
}

/**
 * Log Safety: UNSAFE
 */
export interface OpenAiEmbeddingsResponse {
  data: Array<Array<number>>;
  model: string;
  usage: OpenAiEmbeddingTokenUsage;
}

/**
 * Log Safety: SAFE
 */
export interface OpenAiEmbeddingTokenUsage {
  promptTokens: number;
}

/**
 * Log Safety: SAFE
 */
export type OpenAiEncodingFormat = "FLOAT" | "BASE64";

/**
 * Log Safety: SAFE
 */
export interface OpenAiModel {
  modelId: LanguageModelApiName;
}
