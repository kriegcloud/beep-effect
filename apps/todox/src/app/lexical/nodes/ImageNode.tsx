"use client";

import { thunkNull } from "@beep/utils";
import { $insertGeneratedNodes } from "@lexical/clipboard";
import { HashtagNode } from "@lexical/hashtag";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalUpdateJSON,
  NodeKey,
  RangeSelection,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  $applyNodeReplacement,
  $createRangeSelection,
  $getEditor,
  $getRoot,
  $isParagraphNode,
  $selectAll,
  $setSelection,
  createEditor,
  DecoratorNode,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  SKIP_DOM_SELECTION_TAG,
  TextNode,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";
import { EmojiNode } from "./EmojiNode";
import { $isCaptionEditorEmpty, $isImageNode } from "./image-utils";
import { KeywordNode } from "./KeywordNode";

const ImageComponent = React.lazy(() => import("./ImageComponent"));

export interface ImagePayload {
  altText: string;
  caption?: undefined | LexicalEditor;
  height?: undefined | number;
  key?: undefined | NodeKey;
  maxWidth?: undefined | number;
  showCaption?: undefined | boolean;
  src: string;
  width?: undefined | number;
  captionsEnabled?: undefined | boolean;
}

const isGoogleDocCheckboxImg = (img: HTMLImageElement) =>
  P.isNotNullable(img.parentElement) &&
  Eq.equals(img.parentElement.tagName, "LI") &&
  P.isNull(img.previousSibling) &&
  Eq.equals(img.getAttribute("aria-roledescription"))("checkbox");

const isHTMLImageElement = S.is(S.instanceOf(HTMLImageElement));

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
  return F.pipe(
    domNode,
    O.liftPredicate(isHTMLImageElement),
    O.map((img) => [img, img.getAttribute("src")] as const),
    O.flatMap(
      O.liftPredicate(([img, src]) => !(!src || Str.startsWith("file:///")(src) || isGoogleDocCheckboxImg(img)))
    ),
    O.match({
      onNone: thunkNull,
      onSome: ([{ alt, width, height }, src]) =>
        F.pipe(
          src,
          O.fromNullable,
          O.map((src) => $createImageNode({ altText: alt, height, src, width })),
          O.match({
            onNone: thunkNull,
            onSome: (node) => ({ node }),
          })
        ),
    })
  );
}

// Re-export from utils to maintain backwards compatibility
export { $isCaptionEditorEmpty };

export type SerializedImageNode = Spread<
  {
    readonly altText: string;
    readonly caption: SerializedEditor;
    readonly height?: undefined | number;
    readonly maxWidth: number;
    readonly showCaption: boolean;
    readonly src: string;
    readonly width?: undefined | number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;

  static override getType(): string {
    return "image";
  }

  static override clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key
    );
  }

  static override importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, src, showCaption } = serializedNode;
    return $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
    }).updateFromJSON(serializedNode);
  }

  override updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageNode>): this {
    const node = super.updateFromJSON(serializedNode);
    const { caption } = serializedNode;

    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  override exportDOM(): DOMExportOutput {
    const imgElement = document.createElement("img");
    imgElement.setAttribute("src", this.__src);
    imgElement.setAttribute("alt", this.__altText);
    imgElement.setAttribute("width", this.__width.toString());
    imgElement.setAttribute("height", this.__height.toString());

    if (this.__showCaption && this.__caption) {
      const captionEditor = this.__caption;
      const captionHtml = captionEditor.read(() => {
        if ($isCaptionEditorEmpty()) {
          return null;
        }
        // Don't serialize the wrapping paragraph if there is only one
        let selection: null | RangeSelection = null;
        const firstChild = $getRoot().getFirstChild();
        if ($isParagraphNode(firstChild) && firstChild.getNextSibling() === null) {
          selection = $createRangeSelection();
          selection.anchor.set(firstChild.getKey(), 0, "element");
          selection.focus.set(firstChild.getKey(), firstChild.getChildrenSize(), "element");
        }
        return $generateHtmlFromNodes(captionEditor, selection);
      });
      if (captionHtml) {
        const figureElement = document.createElement("figure");
        const figcaptionElement = document.createElement("figcaption");
        figcaptionElement.innerHTML = captionHtml;

        figureElement.appendChild(imgElement);
        figureElement.appendChild(figcaptionElement);

        return { element: figureElement };
      }
    }

    return { element: imgElement };
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      figcaption: () => ({
        conversion: () => ({ node: null }),
        priority: 0,
      }),
      figure: () => ({
        conversion: (node) => {
          return {
            after: (childNodes) => {
              const imageNodes = childNodes.filter($isImageNode);
              const figcaption = node.querySelector("figcaption");
              if (figcaption) {
                for (const imgNode of imageNodes) {
                  imgNode.setShowCaption(true);
                  imgNode.__caption.update(
                    () => {
                      const editor = $getEditor();
                      $insertGeneratedNodes(editor, $generateNodesFromDOM(editor, figcaption), $selectAll());
                      $setSelection(null);
                    },
                    { tag: SKIP_DOM_SELECTION_TAG }
                  );
                }
              }
              return imageNodes;
            },
            node: null,
          };
        },
        priority: 0,
      }),
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: undefined | "inherit" | number,
    height?: undefined | "inherit" | number,
    showCaption?: undefined | boolean,
    caption?: undefined | LexicalEditor,
    captionsEnabled?: undefined | boolean,
    key?: undefined | NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption =
      caption ||
      createEditor({
        namespace: "Playground/ImageNodeCaption",
        nodes: [RootNode, TextNode, LineBreakNode, ParagraphNode, LinkNode, EmojiNode, HashtagNode, KeywordNode],
      });
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
  }

  override exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      width: this.__width === "inherit" ? 0 : this.__width,
    };
  }

  setWidthAndHeight(width: "inherit" | number, height: "inherit" | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  // View

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (P.isNotUndefined(className)) {
      span.className = className;
    }
    return span;
  }

  override updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  override decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        showCaption={this.__showCaption}
        caption={this.__caption}
        captionsEnabled={this.__captionsEnabled}
        resizable={true}
      />
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key)
  );
}

// Re-export from utils to maintain backwards compatibility
export { $isImageNode } from "./image-utils";
