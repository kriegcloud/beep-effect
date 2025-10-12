import { createClasses } from "@beep/ui-core/theme/create-classes";

export const navSectionClasses = {
  mini: createClasses("nav__section__mini"),
  vertical: createClasses("nav__section__vertical"),
  horizontal: createClasses("nav__section__horizontal"),
  li: createClasses("nav__li"),
  ul: createClasses("nav__ul"),
  subheader: createClasses("nav__subheader"),
  dropdown: {
    root: createClasses("nav__dropdown__root"),
    paper: createClasses("nav__dropdown__paper"),
  },
  item: {
    root: createClasses("nav__item__root"),
    sub: createClasses("nav__item__sub"),
    icon: createClasses("nav__item__icon"),
    info: createClasses("nav__item__info"),
    texts: createClasses("nav__item__texts"),
    title: createClasses("nav__item__title"),
    arrow: createClasses("nav__item__arrow"),
    caption: createClasses("nav__item__caption"),
  },
  state: {
    open: "--open",
    active: "--active",
    disabled: "--disabled",
  },
};
