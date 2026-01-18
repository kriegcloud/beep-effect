/**
 * Type verification file for Knowledge tables
 *
 * This file ensures compile-time alignment between domain models
 * and Drizzle table definitions. Type assertions verify that
 * Drizzle InferSelectModel/InferInsertModel types match the
 * corresponding Effect model's Encoded representation.
 *
 * @module knowledge-tables/_check
 * @since 0.1.0
 */
import type { Embedding } from "@beep/knowledge-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

// Embedding
export const _checkSelectEmbedding: typeof Embedding.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.embedding>;

export const _checkInsertEmbedding: typeof Embedding.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.embedding>;
