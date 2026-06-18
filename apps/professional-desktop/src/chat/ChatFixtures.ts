/**
 * Shared chat fixture builders for desktop smoke and contract paths.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Md from "@beep/md/Md.model";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const decodeWorkspaceIdValue = S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId);

export const decodeWorkspaceId = (input: unknown): WorkspaceIdentity.WorkspaceId => decodeWorkspaceIdValue(input);

export const userDocument = (text: string): Md.Document.Type =>
  Md.Document.make({ children: [Md.P.make({ children: [Md.Text.make({ value: text })] })] });

export const userParagraphDocument = (paragraphs: ReadonlyArray<string>): Md.Document.Type =>
  Md.Document.make({
    children: A.map(paragraphs, (text) => Md.P.make({ children: [Md.Text.make({ value: text })] })),
  });
