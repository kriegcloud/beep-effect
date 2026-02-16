"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { noOp } from "@beep/utils";
import { exportToSvg } from "@excalidraw/excalidraw";
import type { ExcalidrawElement, NonDeleted } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as React from "react";
import type { JSX } from "react";
import { useEffect, useState } from "react";

const $I = $TodoxId.create("app/lexical/nodes/ExcalidrawNode/ExcalidrawImage");

class ExportToSvgError extends S.TaggedError<ExportToSvgError>($I`ExportToSvgError`)(
  "ExportToSvgError",
  {
    cause: S.Defect,
  },
  $I.annotations("ExportToSvgError", {
    description: "An error which occurred while trying to export an svg in excalidraw",
  })
) {}

type ImageType = "svg" | "canvas";

type Dimension = "inherit" | number;

type Props = {
  /**
   * Configures the export setting for SVG/Canvas
   */
  readonly appState: AppState;
  /**
   * The css class applied to image to be rendered
   */
  readonly className?: undefined | string;
  /**
   * The Excalidraw elements to be rendered as an image
   */
  readonly elements: NonDeleted<ExcalidrawElement>[];
  /**
   * The Excalidraw files associated with the elements
   */
  readonly files: BinaryFiles;
  /**
   * The height of the image to be rendered
   */
  readonly height?: undefined | Dimension;
  /**
   * The ref object to be used to render the image
   */
  readonly imageContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * The type of image to be rendered
   */
  readonly imageType?: undefined | ImageType;
  /**
   * The css class applied to the root element of this component
   */
  readonly rootClassName?: undefined | string | null;
  /**
   * The width of the image to be rendered
   */
  readonly width?: undefined | Dimension;
};

// exportToSvg has fonts from excalidraw.com
// We don't want them to be used in open source
const removeStyleFromSvg_HACK = (svg: SVGElement) => {
  const styleTag = svg?.firstElementChild?.firstElementChild;

  // Generated SVG is getting double-sized by height and width attributes
  // We want to match the real size of the SVG element
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox != null) {
    const viewBoxDimensions = Str.split(" ")(viewBox);
    const widthOpt = A.get(2)(viewBoxDimensions);
    const heightOpt = A.get(3)(viewBoxDimensions);

    widthOpt.pipe(
      O.match({
        onNone: noOp,
        onSome: (width) => {
          svg.setAttribute("width", width);
        },
      })
    );
    heightOpt.pipe(
      O.match({
        onNone: noOp,
        onSome: (height) => {
          svg.setAttribute("height", height);
        },
      })
    );
  }

  if (styleTag?.tagName === "style") {
    styleTag.remove();
  }
};

/**
 * @explorer-desc
 * A component for rendering Excalidraw elements as a static image
 */
export default function ExcalidrawImage({
  elements,
  files,
  imageContainerRef,
  appState,
  rootClassName = null,
  width = "inherit",
  height = "inherit",
}: Props): JSX.Element {
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);

  const exportToSvgEffect = F.pipe(
    Effect.tryPromise({
      try: () =>
        exportToSvg({
          appState,
          elements,
          files,
        }),
      catch: (cause) =>
        new ExportToSvgError({
          cause,
        }),
    }),
    Effect.flatMap(S.decodeUnknown(S.instanceOf(SVGElement))),
    Effect.andThen((svg) =>
      Effect.gen(function* () {
        removeStyleFromSvg_HACK(svg);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("display", "block");
        setSvg(svg);
      })
    ),
    Effect.tapError((e) => Effect.logWarning(`Failed to export svg for excalidraw image: ${e}`)),
    Effect.catchTags({
      ParseError: Effect.die,
    })
  );
  const [Svg, setSvg] = useState<SVGElement | null>(null);

  useEffect(() => {
    const setContent = async () => runPromise(exportToSvgEffect);
    void setContent();
  }, [elements, files, appState]);

  const containerStyle: React.CSSProperties = {};
  if (width !== "inherit") {
    containerStyle.width = `${width}px`;
  }
  if (height !== "inherit") {
    containerStyle.height = `${height}px`;
  }

  return (
    <div
      ref={(node) => {
        if (node) {
          if (imageContainerRef) {
            imageContainerRef.current = node;
          }
        }
      }}
      className={rootClassName ?? ""}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: Svg?.outerHTML ?? "" }}
    />
  );
}
