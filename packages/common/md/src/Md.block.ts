/**
 * @module @beep/md/Md.block
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { LiteralKit, PosInt, SchemaUtils } from "@beep/schema";
import { Str } from "@beep/utils";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $MdId.create("Md.block");

/**
 * Options used when constructing or rendering markdown headings.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { HeadingOptions } from "@beep/md/Md.block"
 *
 * const options = S.decodeUnknownSync(HeadingOptions)({ level: 2 })
 * console.log(options.level) // 2
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HeadingOptions extends S.Class<HeadingOptions>($I`HeadingOptions`)(
  {
    level: PosInt,
  },
  $I.annote("HeadingOptions", {
    description: "Options used when constructing or rendering markdown headings.",
  })
) {}

const HeadingLevelLiteral = LiteralKit(["h1", "h2", "h3", "h4", "h5", "h6"]);
type HeadingLevelValue = typeof HeadingLevelLiteral.Type;

const headingMarkerCounts = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
} satisfies Record<HeadingLevelValue, 1 | 2 | 3 | 4 | 5 | 6>;

/**
 * Markdown heading level literals from `h1` through `h6`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { HeadingLevel } from "@beep/md/Md.block"
 *
 * const level = S.decodeUnknownSync(HeadingLevel)(HeadingLevel.Enum.h3)
 * const markdown = HeadingLevel.render("Install", level)
 * console.log(markdown) // "### Install"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const HeadingLevel = HeadingLevelLiteral.annotate(
  $I.annote("HeadingLevel", {
    description: "Markdown heading level literals from h1 through h6.",
  })
).pipe(
  SchemaUtils.withLiteralKitStatics(HeadingLevelLiteral),
  SchemaUtils.withStatics(() => {
    const render: {
      (text: string, level: HeadingLevel): string;
      (level: HeadingLevel): (text: string) => string;
    } = dual(
      2,
      (text: string, level: HeadingLevel): string => `${Str.repeat("#", headingMarkerCounts[level])} ${text}`
    );

    return {
      render,
    };
  })
);

/**
 * Type for {@link HeadingLevel}. {@inheritDoc HeadingLevel}
 *
 * @example
 * ```ts
 * import type { HeadingLevel } from "@beep/md/Md.block"
 *
 * const level: HeadingLevel = "h2"
 * console.log(level) // "h2"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HeadingLevel = typeof HeadingLevel.Type;

class HeadingBase extends S.Class<HeadingBase>($I`HeadingBase`)(
  { value: S.String },
  $I.annote("HeadingBase", {
    description: "Shared markdown heading fields used by concrete heading classes.",
  })
) {}

/**
 * Markdown level-one heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H1 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H1)({ _tag: "h1", value: "Overview" })
 * console.log(heading.value) // "Overview"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H1 extends HeadingBase.extend<H1>($I`H1`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h1),
  },
  $I.annote("H1", {
    description: "Markdown level-one heading block.",
  })
) {}

/**
 * Markdown level-two heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H2 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H2)({ _tag: "h2", value: "Install" })
 * console.log(heading.value) // "Install"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H2 extends HeadingBase.extend<H2>($I`H2`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h2),
  },
  $I.annote("H2", {
    description: "Markdown level-two heading block.",
  })
) {}

/**
 * Markdown level-three heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H3 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H3)({ _tag: "h3", value: "Configuration" })
 * console.log(heading.value) // "Configuration"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H3 extends HeadingBase.extend<H3>($I`H3`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h3),
  },
  $I.annote("H3", {
    description: "Markdown level-three heading block.",
  })
) {}

/**
 * Markdown level-four heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H4 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H4)({ _tag: "h4", value: "Details" })
 * console.log(heading.value) // "Details"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H4 extends HeadingBase.extend<H4>($I`H4`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h4),
  },
  $I.annote("H4", {
    description: "Markdown level-four heading block.",
  })
) {}

/**
 * Markdown level-five heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H5 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H5)({ _tag: "h5", value: "Notes" })
 * console.log(heading.value) // "Notes"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H5 extends HeadingBase.extend<H5>($I`H5`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h5),
  },
  $I.annote("H5", {
    description: "Markdown level-five heading block.",
  })
) {}

/**
 * Markdown level-six heading block.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { H6 } from "@beep/md/Md.block"
 *
 * const heading = S.decodeUnknownSync(H6)({ _tag: "h6", value: "Footnote" })
 * console.log(heading.value) // "Footnote"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class H6 extends HeadingBase.extend<H6>($I`H6`)(
  {
    _tag: S.tag(HeadingLevel.Enum.h6),
  },
  $I.annote("H6", {
    description: "Markdown level-six heading block.",
  })
) {}
