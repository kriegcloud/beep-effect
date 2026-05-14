import { $UiId } from "@beep/identity";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import * as S from "effect/Schema";
import type { JSX } from "react";

const $I = $UiId.create("components/editor/content-editable");

class Props extends S.Class<Props>($I`Props`)({
  placeholder: S.String,
  className: S.optionalKey(S.String),
  placeholderClassName: S.optionalKey(S.String),
}) {}

/**
 * Shared Lexical content-editable surface with package theme defaults.
 *
 * @since 0.0.0
 * @category components
 */
export function ContentEditable({ placeholder, className, placeholderClassName }: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        "ContentEditable__root relative block min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none"
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            "text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-8 py-[18px] text-ellipsis select-none"
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
