import { BS } from "@beep/schema";

export const ToastVariantKit = BS.stringLiteralKit("default", "success", "error", "info", "warning");

export class ToastVariant extends ToastVariantKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-ui/auth-ui/types/render-toast/ToastVariant"),
  identifier: "ToastVariant",
  title: "Toast Variant",
  description: "The variant of the toast notification",
}) {
  static readonly Options = ToastVariantKit.Options;
  static readonly Enum = ToastVariantKit.Enum;
}
export declare namespace ToastVariant {
  export type Type = typeof ToastVariant.Type;
  export type Encoded = typeof ToastVariant.Encoded;
}

export type RenderToast = ({
  variant,
  message,
}: {
  readonly variant?: ToastVariant.Type | undefined;
  readonly message?: string | undefined;
}) => void;
