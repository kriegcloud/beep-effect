"use client";

import * as React from "react";

import ColorPicker from "./ColorPicker";
import DropDown from "./DropDown";

type Props = {
  readonly disabled?: undefined | boolean;
  readonly buttonAriaLabel?: undefined | string;
  readonly buttonClassName: string;
  readonly buttonIconClassName?: undefined | string;
  readonly buttonLabel?: undefined | string;
  readonly title?: undefined | string;
  readonly stopCloseOnClickSelf?: undefined | boolean;
  readonly color: string;
  readonly onChange?: undefined | ((color: string, skipHistoryStack: boolean, skipRefocus: boolean) => void);
};

export default function DropdownColorPicker({
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  onChange,
  ...rest
}: Props) {
  return (
    <DropDown {...rest} disabled={disabled} stopCloseOnClickSelf={stopCloseOnClickSelf}>
      <ColorPicker color={color} onChange={onChange} />
    </DropDown>
  );
}
