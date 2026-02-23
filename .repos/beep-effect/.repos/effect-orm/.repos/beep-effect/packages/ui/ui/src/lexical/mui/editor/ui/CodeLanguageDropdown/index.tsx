import { CODE_LANGUAGE_FRIENDLY_NAME_MAP, getLanguageFriendlyName } from "@lexical/code";
import type { ToolbarState } from "../../context";
import type { TToolbarCodeLanguagesControl } from "../../types";
import { dropDownActiveClass } from "../../utils";
import { DropDown, DropDownItem } from "../DropDown";

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

interface ICodeLanguageDropdownProps {
  readonly toolbarState: ToolbarState;
  readonly onCodeLanguageSelect: (value: string) => void;
  readonly disabled?: undefined | boolean;
  readonly controls?: undefined | Array<TToolbarCodeLanguagesControl>;
}

export const CodeLanguageDropdown = (props: ICodeLanguageDropdownProps) => {
  const { disabled, toolbarState, controls = [], onCodeLanguageSelect } = props;

  const filteredOptions = controls.length
    ? CODE_LANGUAGE_OPTIONS.filter(([value]) => controls.includes(value))
    : CODE_LANGUAGE_OPTIONS;

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item code-language"
      buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
      buttonAriaLabel="Select language"
    >
      {filteredOptions.map(([value, name]) => {
        return (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`}
            onClick={() => onCodeLanguageSelect(value)}
            key={value}
          >
            <span className="text">{name}</span>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
};
