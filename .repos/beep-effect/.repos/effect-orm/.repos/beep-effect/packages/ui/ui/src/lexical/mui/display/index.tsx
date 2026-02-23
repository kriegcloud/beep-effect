import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useEffect } from "react";
import { MuiLexicalNodes } from "../editor/nodes";
import { playgroundEditorTheme } from "../editor/themes/playgroundEditorTheme";
import { StyledEditorWrapper } from "./styled";

export interface IDisplayProps {
  readonly data?: undefined | string;
  readonly onError?: undefined | ((error: Error) => void);
  readonly disableClickableLinks?: undefined | boolean;
}

function LoadContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      try {
        const editorState = editor.parseEditorState(content);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Failed to parse editor state:", error);
      }
    }
  }, [content, editor]);

  return null;
}

export const Display = (props: IDisplayProps) => {
  const { data = "", onError, disableClickableLinks = false } = props;

  const initialConfig = {
    namespace: "Display",
    theme: playgroundEditorTheme,
    nodes: [...MuiLexicalNodes],
    editable: false,
    onError: (error: Error) => {
      console.error(error);
      if (onError) {
        onError(error);
      }
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <StyledEditorWrapper>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </StyledEditorWrapper>
      <LoadContentPlugin content={data} />
      <ClickableLinkPlugin disabled={disableClickableLinks} />
    </LexicalComposer>
  );
};
