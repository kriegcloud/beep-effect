import { createClasses } from "@beep/ui-core/theme/create-classes";

// ----------------------------------------------------------------------

export const markdownClasses = {
  root: createClasses("markdown__root"),
  content: {
    pre: createClasses("markdown__content__pre"),
    link: createClasses("markdown__content__link"),
    image: createClasses("markdown__content__image"),
    checkbox: createClasses("markdown__content__checkbox"),
    codeBlock: createClasses("markdown__content__codeBlock"),
    codeInline: createClasses("markdown__content__codeInline"),
  },
};
