"use server";

import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText } from "ai";

export async function improveText(selectedText: string, instruction: string) {
  const systemPrompt = `You are a professional writing assistant. Your task is to improve or transform the given text according to the user's instruction.

IMPORTANT:
- Return ONLY the improved/transformed text
- Do NOT include explanations, comments, or meta-text
- Do NOT wrap the text in quotes or code blocks
- Preserve the original formatting style unless the instruction specifically asks to change it`;

  const userPrompt = `Here is the text to improve:
"""
${selectedText}
"""

Instruction: ${instruction}`;

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);

  return stream.value;
}
