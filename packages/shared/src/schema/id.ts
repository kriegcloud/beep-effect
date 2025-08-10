import {Identifier} from "@beep/shared/identity";

export const sid = Identifier.makeBuilder("@beep/", {
  shared: {
    schema: Identifier.IdSymbol,
  },
} as const);