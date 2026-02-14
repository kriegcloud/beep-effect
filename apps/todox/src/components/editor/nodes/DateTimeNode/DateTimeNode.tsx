"use client";

import * as DateTime from "effect/DateTime";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  $getState,
  $setState,
  buildImportMap,
  createState,
  DecoratorNode,
  type DOMConversionOutput,
  type DOMExportOutput,
  type SerializedLexicalNode,
  type Spread,
  type StateConfigValue,
  type StateValueOrUpdater,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";

// Schema for Google Docs rich link date data
const GoogleRichLinkDateSchema = S.Struct({
  dat_df: S.Struct({
    dfie_dt: S.String,
  }),
});

// Schema for rich link type check
const RichLinkTypeSchema = S.Struct({
  type: S.String,
});

// Decoders using parseJson for combined JSON parsing + schema validation
const decodeGoogleRichLinkDate = S.decodeUnknownEither(S.parseJson(GoogleRichLinkDateSchema));
const decodeRichLinkType = S.decodeUnknownEither(S.parseJson(RichLinkTypeSchema));

const DateTimeComponent = React.lazy(() => import("./DateTimeComponent"));

const getDateTimeText = (dateTime: DateTime.Utc) => {
  if (dateTime === undefined) {
    return "";
  }
  const hours = DateTime.getPartUtc(dateTime, "hours");
  const minutes = DateTime.getPartUtc(dateTime, "minutes");
  const dateStr = DateTime.formatLocal(dateTime, { dateStyle: "medium" });
  return (
    dateStr +
    (hours === 0 && minutes === 0
      ? ""
      : ` ${Str.padStart(2, "0")(hours.toString())}:${Str.padStart(2, "0")(minutes.toString())}`)
  );
};

export type SerializedDateTimeNode = Spread<
  {
    readonly dateTime?: undefined | string;
  },
  SerializedLexicalNode
>;

function $convertDateTimeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dateTimeValue = domNode.getAttribute("data-lexical-datetime");
  if (dateTimeValue) {
    return O.getOrNull(
      O.map(DateTime.make(dateTimeValue), (dt) => ({
        node: $createDateTimeNode(DateTime.toUtc(dt)),
      }))
    );
  }

  return O.getOrNull(
    O.flatMap(O.fromNullable(domNode.getAttribute("data-rich-links")), (payload) =>
      O.flatMap(Either.getRight(decodeGoogleRichLinkDate(payload)), (parsed) =>
        O.map(DateTime.make(parsed.dat_df.dfie_dt), (dt) => ({
          node: $createDateTimeNode(DateTime.toUtc(dt)),
        }))
      )
    )
  );
}

const dateTimeState = createState("dateTime", {
  parse: (v) =>
    O.getOrElse(
      O.flatMap(O.filter(O.some(v), P.isString), (s) => O.map(DateTime.make(s), (dt) => DateTime.toUtc(dt))),
      () => DateTime.toUtc(DateTime.unsafeNow())
    ),
  unparse: (v) => DateTime.formatIso(v),
});

const isGDocsDateType = (domNode: HTMLElement): boolean =>
  O.getOrElse(
    O.flatMap(O.fromNullable(domNode.getAttribute("data-rich-links")), (attr) =>
      O.map(Either.getRight(decodeRichLinkType(attr)), (parsed) => parsed.type === "date")
    ),
    () => false
  );

export class DateTimeNode extends DecoratorNode<JSX.Element> {
  override $config() {
    return this.config("datetime", {
      extends: DecoratorNode,
      importDOM: buildImportMap({
        span: (domNode) =>
          domNode.getAttribute("data-lexical-datetime") !== null || isGDocsDateType(domNode)
            ? {
                conversion: $convertDateTimeElement,
                priority: 2,
              }
            : null,
      }),
      stateConfigs: [{ flat: true, stateConfig: dateTimeState }],
    });
  }

  getDateTime(): StateConfigValue<typeof dateTimeState> {
    return $getState(this, dateTimeState);
  }

  setDateTime(valueOrUpdater: StateValueOrUpdater<typeof dateTimeState>): this {
    return $setState(this, dateTimeState, valueOrUpdater);
  }

  override getTextContent(): string {
    const dateTime = this.getDateTime();
    return getDateTimeText(dateTime);
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    const dt = this.getDateTime();
    element.textContent = getDateTimeText(dt);
    element.setAttribute("data-lexical-datetime", dt ? DateTime.formatIso(dt) : "");
    return { element };
  }

  override createDOM(): HTMLElement {
    const element = document.createElement("span");
    const dt = this.getDateTime();
    element.setAttribute("data-lexical-datetime", dt ? DateTime.formatIso(dt) : "");
    element.style.display = "inline-block";
    return element;
  }

  override updateDOM(): false {
    return false;
  }

  override isInline(): boolean {
    return true;
  }

  override decorate(): JSX.Element {
    return <DateTimeComponent dateTime={this.getDateTime()} nodeKey={this.__key} />;
  }
}

export function $createDateTimeNode(dateTime: DateTime.Utc): DateTimeNode {
  return new DateTimeNode().setDateTime(dateTime);
}

// Re-export from utils to maintain backwards compatibility
export { $isDateTimeNode } from "./datetime-utils";
