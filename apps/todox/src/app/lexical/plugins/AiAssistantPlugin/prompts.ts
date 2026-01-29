/**
 * AI Prompt Templates for the Lexical AI Assistant Plugin
 *
 * Defines predefined prompt configurations for common text transformation tasks.
 */

export interface AiPromptTemplate {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly userPromptTemplate: (selectedText: string) => string;
}

export const PREDEFINED_PROMPTS = [
  {
    id: "improve",
    label: "Improve Writing",
    description: "Enhance clarity, flow, and overall quality",
    systemPrompt:
      "You are a professional editor. Improve the given text by enhancing its clarity, flow, and overall quality while preserving the original meaning and tone. Return only the improved text without explanations.",
    userPromptTemplate: (selectedText: string) => `Please improve the following text:\n\n${selectedText}`,
  },
  {
    id: "simplify",
    label: "Simplify",
    description: "Make text easier to understand",
    systemPrompt:
      "You are a plain language expert. Simplify the given text to make it easier to understand for a general audience. Use shorter sentences, simpler words, and clearer structure. Return only the simplified text without explanations.",
    userPromptTemplate: (selectedText: string) => `Please simplify the following text:\n\n${selectedText}`,
  },
  {
    id: "fix-grammar",
    label: "Fix Grammar",
    description: "Correct grammatical and spelling errors",
    systemPrompt:
      "You are a grammar and spelling expert. Correct all grammatical errors, spelling mistakes, and punctuation issues in the given text. Preserve the original meaning and style. Return only the corrected text without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please fix the grammar and spelling in the following text:\n\n${selectedText}`,
  },
  {
    id: "shorter",
    label: "Make Shorter",
    description: "Condense the text while preserving key points",
    systemPrompt:
      "You are a concise writing expert. Shorten the given text significantly while preserving all key points and essential meaning. Remove redundancy and unnecessary words. Return only the shortened text without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please make the following text shorter and more concise:\n\n${selectedText}`,
  },
  {
    id: "longer",
    label: "Make Longer",
    description: "Expand with more detail and context",
    systemPrompt:
      "You are a content expansion expert. Expand the given text with additional relevant details, examples, and context while maintaining the original tone and style. Return only the expanded text without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please expand the following text with more detail:\n\n${selectedText}`,
  },
  {
    id: "professional",
    label: "Professional Tone",
    description: "Make text more formal and business-appropriate",
    systemPrompt:
      "You are a business communication expert. Rewrite the given text in a professional, formal tone suitable for business contexts. Maintain clarity and the original meaning. Return only the rewritten text without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please rewrite the following text in a professional tone:\n\n${selectedText}`,
  },
  {
    id: "casual",
    label: "Casual Tone",
    description: "Make text more conversational and friendly",
    systemPrompt:
      "You are a conversational writing expert. Rewrite the given text in a casual, friendly, and conversational tone. Make it feel natural and approachable. Return only the rewritten text without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please rewrite the following text in a casual, conversational tone:\n\n${selectedText}`,
  },
  {
    id: "bullet-points",
    label: "Convert to Bullets",
    description: "Transform text into a bulleted list",
    systemPrompt:
      "You are a formatting expert. Convert the given text into a clear, well-organized bulleted list. Each bullet should be concise and capture a key point. Return only the bulleted list without explanations.",
    userPromptTemplate: (selectedText: string) =>
      `Please convert the following text into bullet points:\n\n${selectedText}`,
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Create a brief summary of the text",
    systemPrompt:
      "You are a summarization expert. Create a brief, informative summary of the given text that captures the main points and key takeaways. Return only the summary without explanations.",
    userPromptTemplate: (selectedText: string) => `Please summarize the following text:\n\n${selectedText}`,
  },
  {
    id: "translate-spanish",
    label: "Translate to Spanish",
    description: "Translate text to Spanish",
    systemPrompt:
      "You are a professional translator. Translate the given text to Spanish while preserving the meaning, tone, and nuance. Return only the translated text without explanations.",
    userPromptTemplate: (selectedText: string) => `Please translate the following text to Spanish:\n\n${selectedText}`,
  },
] as const satisfies readonly AiPromptTemplate[];

export type PredefinedPromptId = (typeof PREDEFINED_PROMPTS)[number]["id"];

/**
 * Retrieves a prompt template by its unique identifier.
 *
 * @param id - The prompt template identifier
 * @returns The matching prompt template, or undefined if not found
 */
export function getPromptById(id: string): AiPromptTemplate | undefined {
  return PREDEFINED_PROMPTS.find((prompt) => prompt.id === id);
}
