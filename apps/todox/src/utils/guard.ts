import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("utils/guard");

export class HtmlElement extends S.instanceOf(HTMLElement).annotations($I.annotations("HtmlElement")) {
  static readonly $is = S.is(HtmlElement);
}

export declare namespace HtmlElement {
  export type Type = HtmlElement;
}
