import { createCommand, type LexicalCommand } from "lexical";
import type { InsertionMode } from "./types";

/**
 * Payload for AI text insertion
 */
export interface InsertAiTextPayload {
  readonly content: string;
  readonly mode: InsertionMode;
}

/**
 * Open the floating AI panel
 */
export const OPEN_AI_PANEL_COMMAND: LexicalCommand<null> = createCommand("OPEN_AI_PANEL");

/**
 * Close the floating AI panel
 */
export const CLOSE_AI_PANEL_COMMAND: LexicalCommand<null> = createCommand("CLOSE_AI_PANEL");

/**
 * Insert AI-generated text with specified mode
 */
export const INSERT_AI_TEXT_COMMAND: LexicalCommand<InsertAiTextPayload> = createCommand("INSERT_AI_TEXT");

/**
 * Cancel ongoing AI operation
 */
// export const CANCEL_AI_OPERATION_COMMAND: LexicalCommand<null> = createCommand("CANCEL_AI_OPERATION");
