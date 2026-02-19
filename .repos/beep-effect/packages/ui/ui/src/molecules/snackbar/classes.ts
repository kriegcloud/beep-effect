import { createClasses } from "@beep/ui-core/theme/create-classes";

export const snackbarClasses = {
  root: createClasses("snackbar__root"),
  toast: createClasses("snackbar__toast"),

  title: createClasses("snackbar__title"),
  content: createClasses("snackbar__content"),
  description: createClasses("snackbar__description"),

  icon: createClasses("snackbar__icon"),
  loaderVisible: '&[data-visible="true"]',
  loader: createClasses("snackbar__loader"),
  loading: createClasses("snackbar__loading"),
  iconSvg: createClasses("snackbar__icon__svg"),
  loadingIcon: createClasses("snackbar__loading_icon"),

  default: "&:not([data-type])",
  error: createClasses("snackbar__error"),
  success: createClasses("snackbar__success"),
  warning: createClasses("snackbar__warning"),
  info: createClasses("snackbar__info"),

  closeButton: createClasses("snackbar__close_button"),
  actionButton: createClasses("snackbar__action__button"),
  cancelButton: createClasses("snackbar__cancel__button"),
  closeBtnVisible: '[data-close-button="true"]',

  unset: createClasses("snackbar__unset"),
};
