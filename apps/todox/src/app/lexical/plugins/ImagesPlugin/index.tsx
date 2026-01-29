"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Input } from "@beep/todox/components/ui/input";
import { Label } from "@beep/todox/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/todox/components/ui/tabs";
import { $isAutoLinkNode, $isLinkNode, type LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  getDOMSelectionFromTarget,
  isHTMLElement,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical";
import type { JSX } from "react";

import { useEffect, useId, useRef, useState } from "react";

import { $createImageNode, $isImageNode, ImageNode, type ImagePayload } from "../../nodes/ImageNode";
import { DragSelectionError, NodeNotRegisteredError } from "../../schema/errors";
import FileInput from "../../ui/FileInput";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_COMMAND");

export function InsertImageUriDialogBody({ onClick }: { readonly onClick: (payload: InsertImagePayload) => void }) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const srcId = useId();
  const altTextId = useId();

  const isDisabled = src === "";

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={srcId}>Image URL</Label>
        <Input
          id={srcId}
          placeholder="i.e. https://source.unsplash.com/random"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          data-testid="image-modal-url-input"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={altTextId}>Alt Text</Label>
        <Input
          id={altTextId}
          placeholder="Random unsplash image"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          data-testid="image-modal-alt-text-input"
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          data-test-id="image-modal-confirm-btn"
          disabled={isDisabled}
          onClick={() => onClick({ altText, src })}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

export function InsertImageUploadedDialogBody({
  onClick,
}: {
  readonly onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const altTextId = useId();

  const isDisabled = src === "";

  const loadImage = (files: FileList | null) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
      }
      return "";
    };
    if (files !== null) {
      reader.readAsDataURL(files[0]!);
    }
  };

  return (
    <div className="grid gap-4">
      <FileInput label="Image Upload" onChange={loadImage} accept="image/*" data-test-id="image-modal-file-upload" />
      <div className="grid gap-2">
        <Label htmlFor={altTextId}>Alt Text</Label>
        <Input
          id={altTextId}
          placeholder="Descriptive alternative text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          data-testid="image-modal-alt-text-input"
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => onClick({ altText, src })}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  readonly activeEditor: LexicalEditor;
  readonly onClose: () => void;
}): JSX.Element {
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };

  return (
    <div className="py-2">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="file">File</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <InsertImageUriDialogBody onClick={onClick} />
        </TabsContent>
        <TabsContent value="file">
          <InsertImageUploadedDialogBody onClick={onClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ImagesPlugin({
  captionsEnabled,
}: {
  readonly captionsEnabled?: undefined | boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new NodeNotRegisteredError({
        message: "ImagesPlugin: ImageNode not registered on editor",
        plugin: "ImagesPlugin",
        nodeType: "ImageNode",
      });
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [captionsEnabled, editor]);

  return null;
}

const TRANSPARENT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const img = document.createElement("img");
img.src = TRANSPARENT_IMAGE;

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img, 0, 0);
  const dragPayload = {
    type: "image" as const,
    data: {
      altText: node.__altText,
      caption: node.__caption,
      height: node.__height,
      key: node.getKey(),
      maxWidth: node.__maxWidth,
      showCaption: node.__showCaption,
      src: node.__src,
      width: node.__width,
    },
  };
  const encodedPayload = Either.getOrElse(encodeImageDragPayload(dragPayload), () => "{}");
  dataTransfer.setData("application/x-lexical-drag", encodedPayload);

  return true;
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return false;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  const existingLink = $findMatchingParent(
    node,
    (parent): parent is LinkNode => !$isAutoLinkNode(parent) && $isLinkNode(parent)
  );
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
    if (existingLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, existingLink.getURL());
    }
  }
  return true;
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

// Schema for image drag data payload
const ImageDragDataSchema = S.Struct({
  altText: S.String,
  caption: S.Unknown, // LexicalEditor serializes to object, but we pass through as-is
  height: S.Union(S.Number, S.Literal("inherit")),
  key: S.String,
  maxWidth: S.Number,
  showCaption: S.Boolean,
  src: S.String,
  width: S.Union(S.Number, S.Literal("inherit")),
});

const ImageDragPayloadSchema = S.Struct({
  type: S.Literal("image"),
  data: ImageDragDataSchema,
});

// Combined schema for parsing JSON and decoding image drag payload
const ImageDragPayloadFromJson = S.parseJson(ImageDragPayloadSchema);

// Encoder for stringifying image drag payload
const encodeImageDragPayload = S.encodeUnknownEither(ImageDragPayloadFromJson);

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");

  return O.getOrNull(
    O.flatMap(O.fromNullable(dragData), (data) =>
      Either.getRight(
        S.decodeUnknownEither(ImageDragPayloadFromJson)(data).pipe(Either.map(({ data }) => data as InsertImagePayload))
      )
    )
  );
}

declare global {
  interface DragEvent {
    readonly rangeOffset?: undefined | number;
    readonly rangeParent?: undefined | Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    isHTMLElement(target) &&
    !target.closest("code, span.editor-image") &&
    isHTMLElement(target.parentElement) &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range: Range | null;
  const domSelection = getDOMSelectionFromTarget(event.target);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw new DragSelectionError({
      message: "Cannot get the selection when dragging",
    });
  }

  return range;
}
