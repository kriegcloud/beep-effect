import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import { HorizontalRuleIcon } from "../../images/icons";

export const HorizontalRuleButton: FC<IToolbarComponentProps> = ({ activeEditor }) => {
  return (
    <button
      onClick={() => {
        activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      }}
      className={"toolbar-item spaced"}
      title="Horizontal Rule"
      type="button"
      aria-label="Horizontal Rule"
    >
      <HorizontalRuleIcon />
    </button>
  );
};
