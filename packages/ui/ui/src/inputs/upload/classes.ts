import { createClasses } from "@beep/ui-core/theme/create-classes";

export const uploadClasses = {
  box: createClasses("upload__box"),
  avatar: createClasses("upload__avatar"),
  wrapper: createClasses("upload_wrapper"),
  default: createClasses("upload__default"),
  rejected: createClasses("upload__files__rejected"),
  preview: {
    single: createClasses("upload__preview__single"),
    multi: createClasses("upload__preview__multi"),
  },
  placeholder: {
    root: createClasses("upload__placeholder"),
    icon: createClasses("upload__placeholder__icon"),
    title: createClasses("upload__placeholder__title"),
    content: createClasses("upload__placeholder__content"),
    description: createClasses("upload__placeholder__description"),
  },
  state: {
    error: "--error",
    focused: "--focused",
    disabled: "--disabled",
    dragActive: "--drag-active",
    dragAccept: "--drag-accept",
    hasFile: "--has-file",
    hasFiles: "--has-files",
  },
};
