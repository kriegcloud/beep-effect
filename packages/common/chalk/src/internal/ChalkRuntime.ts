import { $ChalkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { ansiStyles, getModelAnsi, getStyleEntry, type StyleName } from "./AnsiStyles.ts";
import {
  backgroundColorNameValues,
  type ColorInfo,
  ColorSupportLevel,
  foregroundColorNameValues,
  modifierNameValues,
} from "./ChalkSchema.ts";
import { stringEncaseCRLFWithFirstIndex, stringReplaceAll } from "./Utilities.ts";

const $I = $ChalkId.create("Domain");

type ChalkState = {
  level: S.Schema.Type<typeof ColorSupportLevel>;
};

type Styler = {
  readonly open: string;
  readonly close: string;
  readonly openAll: string;
  readonly closeAll: string;
  readonly parent: Styler | undefined;
};

type BuilderMeta = {
  readonly isEmpty: boolean;
  readonly state: ChalkState;
  readonly styler: Styler | undefined;
};

type ChalkFunction = (...arguments_: ReadonlyArray<unknown>) => string;
type ChalkPrototype = ChalkFunction & { level: S.Schema.Type<typeof ColorSupportLevel> };

const builderMetaMap = new WeakMap<ChalkFunction, BuilderMeta>();

const levelMapping = ["ansi", "ansi", "ansi256", "ansi16m"] as const;
const styleNameValues = [...modifierNameValues, ...foregroundColorNameValues, ...backgroundColorNameValues] as const;

const ColorSupportLevelInput = S.Number.check(
  S.makeFilter((level: number) => Number.isInteger(level) && level >= 0 && level <= 3, {
    identifier: $I`ColorSupportLevelInputCheck`,
    title: "Chalk Color Support Level",
    description: "A Chalk color support level from 0 through 3.",
    message: "The `level` option should be an integer from 0 to 3",
  })
).pipe(
  $I.annoteSchema("ColorSupportLevelInput", {
    description: "A numeric Chalk color support level accepted by the runtime constructor and `level` setter.",
  })
);

const decodeColorSupportLevel = S.decodeUnknownSync(ColorSupportLevel);
const decodeColorSupportLevelInput = S.decodeUnknownSync(ColorSupportLevelInput);

class MissingBuilderMetadataError extends TaggedErrorClass<MissingBuilderMetadataError>(
  $I`MissingBuilderMetadataError`
)(
  "MissingBuilderMetadataError",
  {
    message: S.String,
  },
  $I.annote("MissingBuilderMetadataError", {
    description: "Raised when Chalk builder metadata is unexpectedly unavailable.",
  })
) {}

const normalizeColorSupportLevel = (level: unknown): S.Schema.Type<typeof ColorSupportLevel> =>
  decodeColorSupportLevel(decodeColorSupportLevelInput(level));

const getBuilderMeta = (builder: ChalkFunction): BuilderMeta => {
  const meta = builderMetaMap.get(builder);

  if (meta === undefined) {
    throw new MissingBuilderMetadataError({
      message: "Missing Chalk builder metadata.",
    });
  }

  return meta;
};

const renderArguments = (arguments_: ReadonlyArray<unknown>): string => {
  const [first] = arguments_;

  return arguments_.length === 1 ? `${first}` : arguments_.join(" ");
};

const createStyler = (open: string, close: string, parent: Styler | undefined): Styler =>
  parent === undefined
    ? {
        close,
        closeAll: close,
        open,
        openAll: open,
        parent,
      }
    : {
        close,
        closeAll: close + parent.closeAll,
        open,
        openAll: parent.openAll + open,
        parent,
      };

const applyStyle = (builder: ChalkFunction, text: string): string => {
  const { isEmpty, state, styler } = getBuilderMeta(builder);

  if (state.level <= 0 || text.length === 0) {
    return isEmpty ? "" : text;
  }

  if (styler === undefined) {
    return text;
  }

  let rendered = text;
  let currentStyler: Styler | undefined = styler;

  if (rendered.includes("\u001B")) {
    do {
      rendered = stringReplaceAll(rendered, currentStyler.close, currentStyler.open);
      currentStyler = currentStyler.parent;
    } while (currentStyler !== undefined);
  }

  const lineFeedIndex = rendered.indexOf("\n");

  if (lineFeedIndex !== -1) {
    rendered = stringEncaseCRLFWithFirstIndex(rendered, styler.closeAll, styler.openAll, lineFeedIndex);
  }

  return styler.openAll + rendered + styler.closeAll;
};

const createPrototype = (): ChalkPrototype => {
  const prototype: ChalkPrototype = Object.defineProperties(() => "", {
    level: {
      enumerable: true,
      get(this: ChalkFunction) {
        return getBuilderMeta(this).state.level;
      },
      set(this: ChalkFunction, level: unknown) {
        getBuilderMeta(this).state.level = normalizeColorSupportLevel(level);
      },
    },
    visible: {
      get(this: ChalkFunction) {
        const { state, styler } = getBuilderMeta(this);
        const builder = createBuilder(state, styler, true, prototype);

        Object.defineProperty(this, "visible", {
          value: builder,
        });

        return builder;
      },
    },
  }) as ChalkPrototype;

  for (const styleName of styleNameValues) {
    Object.defineProperty(prototype, styleName, {
      get(this: ChalkFunction) {
        const { isEmpty, state, styler } = getBuilderMeta(this);
        const style = getStyleEntry(styleName as StyleName);
        const builder = createBuilder(state, createStyler(style.open, style.close, styler), isEmpty, prototype);

        Object.defineProperty(this, styleName, {
          value: builder,
        });

        return builder;
      },
    });
  }

  for (const modelName of ["rgb", "hex", "ansi256"] as const) {
    Object.defineProperty(prototype, modelName, {
      get(this: ChalkFunction) {
        const level = getBuilderMeta(this).state.level;

        return function modelBuilder(this: ChalkFunction, ...arguments_: ReadonlyArray<number | string>) {
          const { isEmpty, state, styler } = getBuilderMeta(this);
          const open = getModelAnsi(modelName, levelMapping[level], "color", ...arguments_);
          return createBuilder(state, createStyler(open, ansiStyles.color.close, styler), isEmpty, prototype);
        };
      },
    });

    const backgroundModelName = `bg${modelName[0]?.toUpperCase() ?? ""}${modelName.slice(1)}`;

    Object.defineProperty(prototype, backgroundModelName, {
      get(this: ChalkFunction) {
        const level = getBuilderMeta(this).state.level;

        return function modelBuilder(this: ChalkFunction, ...arguments_: ReadonlyArray<number | string>) {
          const { isEmpty, state, styler } = getBuilderMeta(this);
          const open = getModelAnsi(modelName, levelMapping[level], "bgColor", ...arguments_);
          return createBuilder(state, createStyler(open, ansiStyles.bgColor.close, styler), isEmpty, prototype);
        };
      },
    });
  }

  return prototype;
};

const prototype = createPrototype();

const createBuilder = (
  state: ChalkState,
  styler: Styler | undefined,
  isEmpty: boolean,
  currentPrototype: ChalkPrototype
): ChalkFunction => {
  const builder = (...arguments_: ReadonlyArray<unknown>): string => applyStyle(builder, renderArguments(arguments_));

  builderMetaMap.set(builder, {
    isEmpty,
    state,
    styler,
  });

  Object.setPrototypeOf(builder, currentPrototype);

  return builder;
};

export const makeCreateChalk = (defaultColorInfo: ColorInfo) => {
  const defaultLevel = defaultColorInfo === false ? 0 : defaultColorInfo.level;

  return (options?: { readonly level?: S.Schema.Type<typeof ColorSupportLevel> | number | undefined }): ChalkFunction =>
    createBuilder(
      {
        level: options?.level === undefined ? defaultLevel : normalizeColorSupportLevel(options.level),
      },
      undefined,
      false,
      prototype
    );
};
