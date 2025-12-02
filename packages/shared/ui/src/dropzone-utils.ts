import { Match, pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as P from "effect/Predicate";
import type * as R from "effect/Record";
import * as Str from "effect/String";

export type AcceptProp = R.ReadonlyRecord<string, string[]>;

export type DropzoneOptions = {
  readonly multiple?: undefined | boolean;
  readonly accept?: AcceptProp | undefined;
  readonly minSize?: undefined | number;
  readonly maxSize?: undefined | number;
  readonly maxFiles?: undefined | number;
  readonly disabled?: undefined | boolean;
  readonly onDrop: <T extends File>(acceptedFiles: T[]) => void;
};

export type DropzoneState = {
  readonly isFocused: boolean;
  readonly isDragActive: boolean;
  readonly isDragAccept: boolean;
  readonly isDragReject: boolean;
  readonly isFileDialogActive: boolean;
  readonly acceptedFiles: File[];
};

const accepts = (file: File, acceptedFiles: string | Array<string>): boolean => {
  if (acceptedFiles) {
    const acceptedFilesArray = A.isArray(acceptedFiles) ? acceptedFiles : Str.split(",")(acceptedFiles);
    const fileName = file.name;
    const mimeType = pipe(file.type, Str.toLowerCase);
    const baseMimeType = pipe(mimeType, Str.replace(/\/.*$/, Str.empty));

    return pipe(
      acceptedFilesArray,
      A.some((type) => {
        const validType = pipe(type, Str.trim, Str.toLowerCase);
        if (pipe(validType, Str.startsWith("."))) {
          return pipe(fileName, Str.toLowerCase, Str.endsWith(validType));
        }
        if (pipe(validType, Str.endsWith("/*"))) {
          return Eq.equals(baseMimeType, pipe(validType, Str.replace(/\/.*$/, Str.empty)));
        }
        return Eq.equals(mimeType, validType);
      })
    );
  }
  return true;
};

export const isPropagationStopped = (
  event: Event & { readonly isPropagationStopped?: undefined | (() => boolean) }
) => {
  if (typeof event.isPropagationStopped === "function") {
    return event.isPropagationStopped();
  }
  if (typeof event.cancelBubble !== "undefined") {
    return event.cancelBubble;
  }
  return false;
};

// Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
// that MIME type will always be accepted
export function isFileAccepted(file: File, accept: string | string[]) {
  return file.type === "application/x-moz-file" || accepts(file, accept);
}

export function isEnterOrSpace(event: { readonly key?: undefined | string; readonly keyCode?: undefined | number }) {
  return (
    ("key" in event && (event.key === " " || event.key === "Enter")) ||
    ("keyCode" in event && (event.keyCode === 32 || event.keyCode === 13))
  );
}

const isDefined = <T>(v: T | null | undefined): v is T => v != null;

export function isValidSize(file: File, minSize: number, maxSize: number) {
  if (!isDefined(file.size)) return true;
  if (isDefined(minSize) && isDefined(maxSize)) {
    return file.size >= minSize && file.size <= maxSize;
  }
  if (isDefined(minSize) && file.size < minSize) return false;
  return !(isDefined(maxSize) && file.size > maxSize);
}

export function isValidQuantity(files: File[], multiple: boolean, maxFiles: number) {
  if (!multiple && files.length > 1) return false;
  return !(multiple && maxFiles >= 1 && files.length > maxFiles);
}

export function allFilesAccepted({
  files,
  accept,
  minSize,
  maxSize,
  multiple,
  maxFiles,
}: {
  files: File[];
  accept: string | string[];
  minSize: number;
  maxSize: number;
  multiple: boolean;
  maxFiles: number;
}) {
  if (!isValidQuantity(files, multiple, maxFiles)) return false;

  return pipe(
    files,
    A.every((file) => isFileAccepted(file, accept) && isValidSize(file, minSize, maxSize))
  );
}

export function isEventWithFiles(event: Partial<Event>) {
  if (!("dataTransfer" in event && event.dataTransfer !== null)) {
    return !!event.target && "files" in event.target && !!event.target.files;
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
  return Array.prototype.some.call(
    (event.dataTransfer as any)?.types,
    (type) => type === "Files" || type === "application/x-moz-file"
  );
}

export function isIeOrEdge(ua = window.navigator.userAgent) {
  return ua.includes("MSIE ") || ua.includes("Trident/") || ua.includes("Edge/");
}

function isMIMEType(v: string) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
}

function isExt(v: string) {
  return /^.*\.\w+$/.test(v);
}

/**
 * Convert the `{accept}` dropzone prop to an array of MIME types/extensions.
 */
export function acceptPropAsAcceptAttr(accept?: AcceptProp) {
  if (isDefined(accept)) {
    return pipe(
      accept,
      Struct.entries,
      A.reduce([] as Array<string>, (acc, [mimeType, ext]) => [...acc, mimeType, ...ext] as const),
      A.filter(P.or(isMIMEType, isExt)),
      A.join(",")
    );
  }

  return undefined;
}

/**
 * ================================================
 *                    Reducer
 * ================================================
 */
type Payload<T extends keyof DropzoneState> = Pick<DropzoneState, T>;

type Focus = { type: "focus" };
type Blur = { type: "blur" };
type OpenDialog = { type: "openDialog" };
type CloseDialog = { type: "closeDialog" };
type SetDraggedFiles = {
  type: "setDraggedFiles";
  payload: Payload<"isDragActive" | "isDragAccept" | "isDragReject">;
};
type SetFiles = { type: "setFiles"; payload: Payload<"acceptedFiles"> };
type Reset = { type: "reset" };
type DropzoneActions = Focus | Blur | OpenDialog | CloseDialog | SetDraggedFiles | SetFiles | Reset;

export const initialState = {
  isFocused: false,
  isFileDialogActive: false,
  isDragActive: false,
  isDragAccept: false,
  isDragReject: false,
  acceptedFiles: [] as File[],
};

export const reducer = (state: DropzoneState, action: DropzoneActions): DropzoneState =>
  Match.value(action).pipe(
    Match.discriminatorsExhaustive("type")({
      focus: () => ({
        ...state,
        isFocused: true,
      }),
      blur: () => ({
        ...state,
        isFocused: false,
      }),
      openDialog: () => ({
        ...initialState,
        isFileDialogActive: true,
      }),
      closeDialog: () => ({
        ...state,
        isFileDialogActive: false,
      }),
      setDraggedFiles: (action) => ({
        ...state,
        ...action.payload,
      }),
      setFiles: (action) => ({
        ...state,
        ...action.payload,
      }),
      reset: () => initialState,
    })
  );
