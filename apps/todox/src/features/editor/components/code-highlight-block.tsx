import "./code-highlight-block.css";

import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useCallback } from "react";

import { editorClasses } from "../classes";

// ----------------------------------------------------------------------

export function CodeHighlightBlock(props: ReactNodeViewProps) {
  const { node, extension, updateAttributes } = props;
  const language = node.attrs.language;
  const lowlight = extension.options.lowlight;

  const handleChangeLanguage = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttributes({ language: event.target.value });
    },
    [updateAttributes]
  );

  const renderLanguageOptions = () =>
    lowlight.listLanguages().map((lang: string) => (
      <option key={lang} value={lang}>
        {lang}
      </option>
    ));

  return (
    <NodeViewWrapper className={editorClasses.content.codeBlock}>
      <select
        name="language"
        contentEditable={false}
        value={language || "null"}
        onChange={handleChangeLanguage}
        className={editorClasses.content.langSelect}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {renderLanguageOptions()}
      </select>

      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
