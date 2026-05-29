import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "../../editor/editor-ui/content-editable.js";

/**
 * Plugins component.
 *
 * @example
 * ```tsx
 * import { Plugins } from "@beep/ui/components/blocks/editor-00/plugins"
 *
 * console.log(Plugins)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function Plugins() {
  return (
    <div className="relative">
      {/* toolbar plugins */}
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div>
              <div>
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
