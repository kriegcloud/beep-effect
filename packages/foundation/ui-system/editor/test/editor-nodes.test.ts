import { editorNodes } from "@beep/editor";
import { ARTIFACT_URI_PREFIX, documentToEditorState, SerializedEditorState } from "@beep/lexical-schema";
import * as MdModel from "@beep/md/Md.model";
import { describe, expect, it } from "@effect/vitest";
import { createHeadlessEditor } from "@lexical/headless";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const text = (value: string) => MdModel.Text.make({ value });

/**
 * The fixture flows through the real pipeline: Md AST → schema codec →
 * encoded wire state → headless Lexical import/export → schema decode.
 */
const fixtureTurn = MdModel.Document.make({
  children: [
    MdModel.Heading.make({ level: 2, children: [MdModel.Strong.make({ children: [text("Plan")] })] }),
    MdModel.P.make({
      children: [text("See "), MdModel.A.make({ href: "https://example.com", children: [text("the docs")] })],
    }),
    MdModel.BlockQuote.make({ children: [MdModel.P.make({ children: [text("Measure twice.")] })] }),
    MdModel.Pre.make({ value: 'console.log("beep")\nexport {}', language: O.some("typescript") }),
    MdModel.Pre.make({ value: "graph TD\n  A --> B", language: O.some("mermaid") }),
    MdModel.Table.make({
      headerRow: true,
      children: [
        MdModel.TableRow.make({
          children: [
            MdModel.TableCell.make({ children: [text("Name")] }),
            MdModel.TableCell.make({ children: [text("Value")] }),
          ],
        }),
        MdModel.TableRow.make({
          children: [
            MdModel.TableCell.make({ children: [text("Language")] }),
            MdModel.TableCell.make({ children: [MdModel.Code.make({ value: "ts" })] }),
          ],
        }),
      ],
    }),
    MdModel.YouTube.make({ videoId: "dQw4w9WgXcQ" }),
    MdModel.TaskList.make({
      children: [
        MdModel.TaskItem.make({ checked: true, children: [text("ship schema")] }),
        MdModel.TaskItem.make({ checked: false, children: [text("ship editor")] }),
      ],
    }),
    MdModel.P.make({
      children: [MdModel.A.make({ href: `${ARTIFACT_URI_PREFIX}artifact-123`, children: [text("Quarterly report")] })],
    }),
  ],
});

describe("@beep/editor node registration", () => {
  it("imports a codec-built editor state and re-exports schema-conformant wire state", () => {
    const wire = documentToEditorState(fixtureTurn).pipe(Effect.runSync, S.encodeSync(SerializedEditorState));

    const editor = createHeadlessEditor({
      namespace: "beep-editor-test",
      nodes: [...editorNodes],
      onError: (error) => {
        throw error;
      },
    });

    editor.setEditorState(editor.parseEditorState(JSON.stringify(wire)));
    const exported = editor.getEditorState().toJSON();

    // Whatever the runtime nodes export must decode through the schema.
    const decoded = S.decodeUnknownSync(SerializedEditorState)(exported);
    const artifact = decoded.root.children.at(-1);
    expect(artifact?.type).toBe("artifact-ref");
    if (artifact?.type === "artifact-ref") {
      expect(artifact.artifactId).toBe("artifact-123");
      expect(artifact.label).toEqual(O.some("Quarterly report"));
    }
    expect(decoded.root.children.some((node) => node.type === "table")).toBe(true);
    expect(decoded.root.children.some((node) => node.type === "youtube")).toBe(true);
    expect(
      decoded.root.children.some(
        (node) => node.type === "code" && O.isSome(node.language) && node.language.value === "mermaid"
      )
    ).toBe(true);
  });
});
