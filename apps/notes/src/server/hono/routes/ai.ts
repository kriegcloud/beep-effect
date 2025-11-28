import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";
import type { ChatMessage, ToolName } from "@beep/notes/registry/components/editor/use-chat";
import { markdownJoinerTransform } from "@beep/notes/registry/lib/markdown-joiner-transform";
import { faker } from "@faker-js/faker";
import { zValidator } from "@hono/zod-validator";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  generateText,
  type LanguageModel,
  streamObject,
  streamText,
  tool,
  type UIMessageStreamWriter,
} from "ai";
import { Hono } from "hono";
import { NextResponse } from "next/server";
import { createSlateEditor, nanoid, type SlateEditor } from "platejs";
import { z } from "zod";

import { publicMiddlewares } from "../middlewares/auth-middleware";
import { getRatelimit } from "../middlewares/ratelimit-middleware";
import { fakeStreamText } from "../utils/fakeStreamText";
import { getChooseToolPrompt, getCommentPrompt, getEditPrompt, getGeneratePrompt } from "./prompts";

export const aiRoutes = new Hono()
  .post(
    "/command",
    ...publicMiddlewares(),
    zValidator(
      "json",
      z.object({
        apiKey: z.string().optional(),
        ctx: z.any(),
        messages: z.array(z.any()),
        model: z.string().optional(),
      })
    ),
    async (c) => {
      const { apiKey: key, ctx, messages: messagesRaw, model } = await c.req.json();

      const user = c.get("user");

      // Rate limit check
      if (!user?.isAdmin && !(await getRatelimit(c, "ai/command")).success) {
        return createStreamResponse(fakeStreamText({ streamProtocol: "data" }));
      }

      const { children, selection, toolName: toolNameParam } = ctx;

      const editor = createSlateEditor({
        plugins: BaseEditorKit,
        selection,
        value: children,
      });

      const apiKey = key || process.env.AI_GATEWAY_API_KEY;

      if (!apiKey) {
        return NextResponse.json({ error: "Missing AI Gateway API key." }, { status: 401 });
      }

      // Limit total characters across all messages
      const messages = limitTotalCharacters(messagesRaw, 8000);

      const isSelecting = editor.api.isExpanded();

      try {
        const stream = createUIMessageStream<ChatMessage>({
          execute: async ({ writer }) => {
            let toolName = toolNameParam;

            if (!toolName) {
              const { object: AIToolName } = await generateObject({
                enum: isSelecting ? ["generate", "edit", "comment"] : ["generate", "comment"],
                model: model || "google/gemini-2.5-flash",
                output: "enum",
                prompt: getChooseToolPrompt({ messages }),
              });

              writer.write({
                data: AIToolName as ToolName,
                type: "data-toolName",
              });

              toolName = AIToolName;
            }

            const stream = streamText({
              experimental_transform: markdownJoinerTransform(),
              model: model || "openai/gpt-4o-mini",
              // Not used
              prompt: "",
              tools: {
                comment: getCommentTool(editor, {
                  messages,
                  model: model || "google/gemini-2.5-flash",
                  writer,
                }),
              },
              prepareStep: (step) => {
                if (toolName === "comment") {
                  return {
                    ...step,
                    toolChoice: { toolName: "comment", type: "tool" },
                  };
                }
                if (toolName === "edit") {
                  const editPrompt = getEditPrompt(editor, {
                    isSelecting,
                    messages,
                  });

                  return {
                    ...step,
                    activeTools: [],
                    messages: [
                      {
                        content: editPrompt,
                        role: "user",
                      },
                    ],
                  };
                }
                if (toolName === "generate") {
                  const generatePrompt = getGeneratePrompt(editor, {
                    messages,
                  });

                  return {
                    ...step,
                    activeTools: [],
                    messages: [
                      {
                        content: generatePrompt,
                        role: "user",
                      },
                    ],
                    model: model || "openai/gpt-4o-mini",
                  };
                }
              },
            });

            writer.merge(stream.toUIMessageStream({ sendFinish: false }));
          },
        });

        return createUIMessageStreamResponse({
          headers: {
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
          },
          stream,
        });
      } catch {
        return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
      }
    }
  )
  .post(
    "/copilot",
    ...publicMiddlewares(),
    zValidator("json", z.object({ prompt: z.string(), system: z.string() })),
    async (c) => {
      const { prompt, system } = await c.req.json();

      const user = c.get("user");

      if (!user?.isAdmin && !(await getRatelimit(c, "ai/copilot")).success) {
        return c.json({
          text: faker.lorem.paragraph(1),
        });
      }

      try {
        const result = await generateText({
          abortSignal: c.req.raw.signal,
          maxOutputTokens: 50,
          model: "gpt-4o-mini",
          prompt,
          system,
          temperature: 0.7,
        });

        return c.json(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "ResponseAborted") {
            // Silently handle the abort
            return c.newResponse(null, 408);
          }

          return c.json({
            error: error.message,
          });
        }
      }
    }
  );

const getCommentTool = (
  editor: SlateEditor,
  {
    messages,
    model,
    writer,
  }: {
    messages: ChatMessage[];
    model: LanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) => {
  return tool({
    description: "Comment on the content",
    inputSchema: z.object({}),
    execute: async () => {
      const { elementStream } = streamObject({
        model,
        output: "array",
        prompt: getCommentPrompt(editor, {
          messages,
        }),
        schema: z
          .object({
            blockId: z
              .string()
              .describe(
                "The id of the starting block. If the comment spans multiple blocks, use the id of the first block."
              ),
            comment: z.string().describe("A brief comment or explanation for this fragment."),
            content: z
              .string()
              .describe(
                String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
              ),
          })
          .describe("A single comment"),
      });

      for await (const comment of elementStream) {
        writer.write({
          id: nanoid(),
          data: {
            comment: comment,
            status: "streaming",
          },
          type: "data-comment",
        });
      }

      writer.write({
        id: nanoid(),
        data: {
          comment: null,
          status: "finished",
        },
        type: "data-comment",
      });
    },
  });
};

function createStreamResponse(stream: ReadableStream) {
  return new NextResponse(stream, {
    headers: {
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}

function limitTotalCharacters(messages: ChatMessage[], maxTotalChars: number) {
  let totalChars = 0;
  const limitedMessages: ChatMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg) continue;
    const msgChars = msg.parts.find((part) => part.type === "text")?.text.length ?? 0;

    if (totalChars + msgChars > maxTotalChars) break;

    totalChars += msgChars;
    limitedMessages.unshift(msg);
  }

  return limitedMessages;
}
