import { createClasses } from "@beep/ui/theme/create-classes";

export const imageClasses = {
  root: createClasses("image__root"),
  img: createClasses("image__img"),
  overlay: createClasses("image__overlay"),
  placeholder: createClasses("image__placeholder"),
  state: {
    loaded: "--loaded",
  },
};
