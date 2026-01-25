import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { ArrayUtils } from "@beep/utils";
import * as F from "effect/Function";

const $I = $SharedIntegrationsId.create("google/gmail/constants");

export class GmailColor extends BS.TaggedConfigKit(
  ["GRAY", { textColor: "#000000", backgroundColor: "#E2E2E2" }],
  ["RED", { textColor: "#D50000", backgroundColor: "#F28B82" }],
  ["ORANGE", { textColor: "#EF6C00", backgroundColor: "#FBBC04" }],
  ["YELLOW", { textColor: "#F9A825", backgroundColor: "#FFF475" }],
  ["LIME", { textColor: "#188038", backgroundColor: "#CCFF90" }],
  ["BLUE", { textColor: "#1967D2", backgroundColor: "#AECBFA" }],
  ["PURPLE", { textColor: "#9334E6", backgroundColor: "#D7AEFB" }],
  ["PINK", { textColor: "#D93025", backgroundColor: "#FDCFE8" }],
  ["TAN", { textColor: "#3C1E1E", backgroundColor: "#E6C9A8" }],
  ["SLATE", { textColor: "#3C4043", backgroundColor: "#E8EAED" }],
  ["TEAL", { textColor: "#0B4B3F", backgroundColor: "#A7FFEB" }],
  ["INDIGO", { textColor: "#174EA6", backgroundColor: "#C5CAE9" }],
  ["SAGE", { textColor: "#33691E", backgroundColor: "#F0F4C3" }],
  ["CYAN", { textColor: "#007B83", backgroundColor: "#B2EBF2" }],
  ["LAVENDER", { textColor: "#5B2C6F", backgroundColor: "#E1BEE7" }],
  ["PEACH", { textColor: "#BF360C", backgroundColor: "#FFAB91" }]
).annotations(
  $I.annotations("GmailColor", {
    description: "Gmail color constants",
  })
) {}

export declare namespace GmailColor {
  export type Type = typeof GmailColor.Type;
  export type Encoded = typeof GmailColor.Encoded;
}

export class LabelColor extends BS.TaggedConfigKit(
  ["SLATE", { textColor: "#FFFFFF", backgroundColor: "#202020" }],
  ["MINT", { textColor: "#D1F0D9", backgroundColor: "#12341D" }],
  ["AMBER", { textColor: "#FDECCE", backgroundColor: "#413111" }],
  ["ROSE", { textColor: "#FDD9DF", backgroundColor: "#411D23" }],
  ["AZURE", { textColor: "#D8E6FD", backgroundColor: "#1C2A41" }],
  ["VIOLET", { textColor: "#E8DEFD", backgroundColor: "#2C2341" }]
) {}

export declare namespace LabelColor {
  export type Type = typeof LabelColor.Type;
  export type Encoded = typeof LabelColor.Encoded;
}
const _backgroundLabelColors = F.pipe(
  LabelColor.Entries,
  ArrayUtils.NonEmptyReadonly.mapNonEmpty(([k, v]) => [k, v.backgroundColor] as const)
);

export class BackgroundLabelColor extends BS.MappedLiteralKit(..._backgroundLabelColors).annotations(
  $I.annotations("BackgroundLabelColor", {
    description: "Label background color constants",
  })
) {}

export declare namespace BackgroundLabelColor {
  export type Type = typeof BackgroundLabelColor.Type;
  export type Encoded = typeof BackgroundLabelColor.Encoded;
}
