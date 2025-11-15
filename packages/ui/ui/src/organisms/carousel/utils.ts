import type { Breakpoint } from "@mui/material/styles";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Struct from "effect/Struct";
import type { CarouselOptions } from "./types";

type ObjectValue = {
  [key: string]: string | number;
};

type InputValue = CarouselOptions["slidesToShow"];

export function getSlideSize(slidesToShow: InputValue): InputValue {
  if (slidesToShow && typeof slidesToShow === "object") {
    return F.pipe(
      Struct.keys(slidesToShow),
      A.reduce({} as ObjectValue, (acc, key) => {
        const sizeByKey = slidesToShow[key as Breakpoint];
        acc[key] = getValue(sizeByKey);
        return acc;
      })
    );
  }

  return getValue(slidesToShow);
}

function getValue(value: string | number = 1): string {
  if (typeof value === "string") {
    const isSupported = value === "auto" || value.endsWith("%") || value.endsWith("px");

    if (!isSupported) {
      throw new Error(`Only accepts values: auto, px, %, or number.`);
    }
    // value is either 'auto', ends with '%', or ends with 'px'
    return `0 0 ${value}`;
  }

  if (typeof value === "number") {
    return `0 0 ${100 / value}%`;
  }

  // Default case should not be reached due to the type signature, but we include it for safety
  throw new Error(`Invalid value type. Only accepts values: auto, px, %, or number.`);
}
