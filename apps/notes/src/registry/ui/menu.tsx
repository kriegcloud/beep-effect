"use client";

import * as Ariakit from "@ariakit/react";
import { cn } from "@beep/notes/lib/utils";
import { useOnClickOutside } from "@beep/notes/registry/hooks/use-on-click-outside";
import { useComposedRef } from "@udecode/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { CornerDownLeftIcon } from "lucide-react";
import * as React from "react";

export type Action = {
  filterItems?: undefined | boolean;
  focusEditor?: undefined | boolean;
  group?: undefined | string;
  icon?: undefined | React.ReactNode;
  items?: undefined | Action[];
  keywords?: undefined | string[];
  label?: undefined | string;
  shortcut?: undefined | string;
  value?: undefined | string;
};

export type ActionGroup = {
  group?: undefined | string;
  value?: undefined | string;
};

const SearchableContext = React.createContext(false);

const MenuContext = React.createContext<{
  isRootMenu: boolean;
  open: boolean;
}>({
  isRootMenu: false,
  open: false,
});

export type MenuProps = Ariakit.MenuProviderProps & {
  trigger?: undefined | React.ReactNode;
  value?: undefined | string;
  onOpenChange?: undefined | Ariakit.MenuProviderProps["setOpen"];
  onRootMenuClose?: undefined | (() => void);
  onValueChange?: undefined | Ariakit.ComboboxProviderProps["setValue"];
  onValuesChange?: undefined | Ariakit.MenuProviderProps["setValues"];
};

export function Menu({
  children,
  trigger,
  value,
  onOpenChange,
  onRootMenuClose,
  onValueChange = () => {},
  onValuesChange,
  ...props
}: MenuProps) {
  const isRootMenu = !Ariakit.useMenuContext();
  const [open, setOpen] = React.useState(false);

  const searchable = !!onValuesChange || isRootMenu;

  const menuProviderProps: Record<string, unknown> = {
    open,
    setOpen: (v: boolean) => {
      if (props.open === undefined) {
        setOpen(v);
      }

      onOpenChange?.(v);
    },
    showTimeout: 100,
    ...props,
  };

  if (onValuesChange !== undefined) {
    menuProviderProps.setValues = onValuesChange;
  }

  const content = (
    <Ariakit.MenuProvider {...(menuProviderProps as any)}>
      {trigger}

      <MenuContext.Provider value={{ isRootMenu, open: props.open ?? open }}>
        <SearchableContext.Provider value={searchable}>{children}</SearchableContext.Provider>
      </MenuContext.Provider>
    </Ariakit.MenuProvider>
  );

  const comboboxProps: Record<string, unknown> = {
    includesBaseElement: false,
    resetValueOnHide: true,
  };

  if (value !== undefined) {
    comboboxProps.value = value;
  }
  if (onValueChange !== undefined) {
    comboboxProps.setValue = onValueChange;
  }

  return searchable ? (
    <Ariakit.ComboboxProvider {...(comboboxProps as any)}>{content}</Ariakit.ComboboxProvider>
  ) : (
    content
  );
}

export function MenuTrigger({
  children,
  icon,
  label,
  ...props
}: React.ComponentProps<typeof Ariakit.MenuButton> & {
  icon?: undefined | React.ReactNode;
  label?: undefined | React.ReactNode;
}) {
  return (
    <Ariakit.MenuButton render={(children as any) ?? <MenuItem />} {...props}>
      {icon}
      {label && <span>{label}</span>}
      <Ariakit.MenuButtonArrow className="ml-auto text-muted-foreground/80" />
    </Ariakit.MenuButton>
  );
}

const menuVariants = cva(
  cn(
    "group/menu",
    "z-50 flex h-full max-w-[calc(100vw-24px)] min-w-[180px] flex-col p-0 text-popover-foreground",
    "data-[state=closed]:hidden"
  ),
  {
    defaultVariants: {
      animateZoom: false,
      variant: "default",
    },
    variants: {
      animateZoom: {
        false: "data-[state=open]:animate-popover",
        true: "data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom data-[state=open]:animate-zoom",
      },
      variant: {
        ai: "w-full px-12 sm:px-[max(64px,calc(50%-350px))]",
        aiSub: "max-h-[70vh] w-[220px] rounded-xl bg-popover shadow-floating",
        default: "max-h-[70vh] w-[260px] overflow-y-auto rounded-xl bg-popover shadow-floating",
      },
    },
  }
);

export type MenuContentProps = Ariakit.MenuProps &
  VariantProps<typeof menuVariants> & {
    animateZoom?: undefined | boolean;
    onClickOutside?: undefined | ((event: MouseEvent) => void);
  };

export function MenuContent({
  animateZoom,
  children,
  className,
  ref,
  variant,
  onClickOutside,
  ...props
}: MenuContentProps) {
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const { open } = React.useContext(MenuContext);
  const side = useMenuSide();

  useOnClickOutside(menuRef, onClickOutside);

  return (
    <Ariakit.Menu
      ref={useComposedRef(ref, menuRef)}
      className={cn(menuVariants({ animateZoom, variant }), className)}
      data-side={side}
      data-state={open ? "open" : "closed"}
      fitViewport={true}
      gutter={4}
      flip
      unmountOnHide
      {...props}
    >
      {children}
    </Ariakit.Menu>
  );
}

export function MenuSeparator(props: React.ComponentProps<typeof Ariakit.MenuSeparator>) {
  return <Ariakit.MenuSeparator {...props} className={cn(props.className)} />;
}

export function MenuGroup({
  label,
  ...props
}: React.ComponentProps<typeof Ariakit.MenuGroup> & {
  label?: undefined | React.ReactNode;
}) {
  return (
    <>
      <MenuSeparator
        className={cn(
          "hidden",
          "peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=option]]/menu-group:block"
        )}
      />

      <Ariakit.MenuGroup
        {...props}
        className={cn(
          "hidden",
          "peer/menu-group group/menu-group my-1.5 has-[[role=menuitem]]:block has-[[role=option]]:block",
          props.className
        )}
      >
        {label && (
          <Ariakit.MenuGroupLabel className="px-[14px] pt-1.5 pb-2 text-xs font-medium text-muted-foreground select-none">
            {label}
          </Ariakit.MenuGroupLabel>
        )}
        {props.children}
      </Ariakit.MenuGroup>
    </>
  );
}

export function MenuShortcut({ ...props }: React.ComponentProps<"span">) {
  return <span {...props} className={cn("text-xs text-muted-foreground/80", props.className)} />;
}

const menuItemVariants = cva(
  "group/menu-item relative flex min-h-[28px] items-center justify-between gap-2 px-2.5 text-sm text-accent-foreground outline-hidden transition-bg-ease select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4",
  {
    defaultVariants: {
      isEmpty: false,
      variant: "default",
    },
    variants: {
      isEmpty: {
        false:
          "cursor-pointer hover:bg-accent aria-expanded:bg-accent aria-selected:bg-accent data-active-item:bg-accent data-active-item:text-accent-foreground",
        true: "text-muted-foreground",
      },
      variant: {
        default: "mx-1 w-[calc(100%-8px)] rounded-sm",
      },
    },
  }
);

export type MenuItemProps = Omit<Ariakit.ComboboxItemProps, "store"> & {
  checked?: undefined | boolean;
  group?: undefined | string;
  icon?: undefined | React.ReactNode;
  label?: undefined | string;
  name?: undefined | string;
  parentGroup?: undefined | string;
  preventClose?: undefined | boolean;
  shortcut?: undefined | React.ReactNode;
  shortcutEnter?: undefined | boolean;
  value?: undefined | string;
} & VariantProps<typeof menuItemVariants>;

export function MenuItem({
  checked,
  className,
  group,
  icon,
  isEmpty,
  label,
  name,
  parentGroup,
  preventClose,
  shortcut,
  shortcutEnter,
  variant,
  ...props
}: Omit<Ariakit.ComboboxItemProps, "store"> & {
  checked?: undefined | boolean;
  group?: undefined | string;
  icon?: undefined | React.ReactNode;
  label?: undefined | string;
  name?: undefined | string;
  parentGroup?: undefined | string;
  preventClose?: undefined | boolean;
  shortcut?: undefined | React.ReactNode;
  shortcutEnter?: undefined | boolean;
  value?: undefined | string;
} & VariantProps<typeof menuItemVariants>) {
  const menu = Ariakit.useMenuContext();

  if (!menu) throw new Error("MenuItem should be used inside a Menu");

  const searchable = React.useContext(SearchableContext);

  const hasShortcut = !!shortcut || shortcutEnter;

  const baseProps: MenuItemProps = {
    blurOnHoverEnd: false,
    focusOnHover: true,
    label,
    ...props,
    className: cn(menuItemVariants({ isEmpty, variant }), !!hasShortcut && "justify-between", className),
    group: parentGroup,
    name: group,
  };

  baseProps.children = (
    <>
      <div className="flex w-full items-center gap-2 whitespace-nowrap">
        {icon && <span className="menu-item-icon text-subtle-foreground">{icon}</span>}
        {baseProps.children ?? label}
      </div>

      {(hasShortcut || checked) && (
        <div className="flex shrink-0 items-center justify-end">
          {checked && <Ariakit.MenuItemCheck checked={checked} />}
          {hasShortcut && (
            <MenuShortcut>
              {shortcut ?? (
                <CornerDownLeftIcon className="hidden group-data-[active-item='true']/menu-item:inline-block" />
              )}
            </MenuShortcut>
          )}
          {checked && searchable && (
            <Ariakit.VisuallyHidden>{checked ? "checked" : "not checked"}</Ariakit.VisuallyHidden>
          )}
        </div>
      )}
    </>
  );

  if (!searchable) {
    if (name != null && props.value != null) {
      const radioProps: Record<string, unknown> = {
        ...baseProps,
        hideOnClick: true,
        name,
        value: props.value as any,
      };

      if (checked !== undefined) {
        radioProps.checked = checked;
      }

      return <Ariakit.MenuItemRadio {...(radioProps as any)} />;
    }

    return <Ariakit.MenuItem {...(baseProps as any)} />;
  }

  const hideOnClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const expandable = event.currentTarget.hasAttribute("aria-expanded");

    if (expandable) return false;
    if (preventClose) return false;

    menu.hideAll();

    return false;
  };

  return <Ariakit.ComboboxItem {...baseProps} hideOnClick={hideOnClick} />;
}

export const comboboxVariants = cva("", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      ai: "max-w-[calc(100vw-24px)] min-w-[280px] rounded-xl bg-popover py-0.5 shadow-toolbar",
      default: "mx-3 pt-3.5 pb-1.5",
    },
  },
});

export function ComboboxContent({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof comboboxVariants>) {
  return <div className={cn(comboboxVariants({ variant }), className)} {...props} />;
}

const comboboxListVariants = cva(
  cn(
    "group/combobox-list",
    "h-full max-h-[70vh] grow overflow-y-auto rounded-lg [&:has(>:last-child:not([role=group]))]:pb-1.5",
    "hidden has-[[role=option]]:block"
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        ai: "my-1 h-full max-h-[min(40vh,320px)] w-fit max-w-[320px] min-w-[280px] overflow-y-auto bg-popover p-0 shadow-floating",
        default: "",
      },
    },
  }
);

export function ComboboxList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof Ariakit.ComboboxList> & VariantProps<typeof comboboxListVariants>) {
  return <Ariakit.ComboboxList className={cn(comboboxListVariants({ variant }), className)} {...props} />;
}

export function ComboboxInput({ children, ...props }: React.ComponentProps<typeof Ariakit.Combobox>) {
  return <Ariakit.Combobox render={children as any} autoSelect {...props} />;
}

export function ComboboxEmpty() {
  return (
    <div className="py-1.5 group-has-[[role=option]]/combobox-list:hidden">
      <div className={cn(menuItemVariants({ isEmpty: true }), "")} role="menuitem">
        No results
      </div>
    </div>
  );
}

export * as Ariakit from "@ariakit/react";

export function filterMenuItems({ items = [], ...group }: Action, searchValue: string): Action[] {
  if (!searchValue) return items;
  if ([group.label, ...(group.keywords || [])].join(" ").toLowerCase().includes(searchValue.toLowerCase())) {
    return items;
  }

  return items.filter(
    (item) =>
      item.filterItems ||
      [item.label, item.value, ...(item.keywords || [])].join(" ").toLowerCase().includes(searchValue.toLowerCase())
  );
}

export function filterMenuGroups(menuGroups: Action[], searchValue: string): Action[] {
  if (!searchValue) return menuGroups;

  return menuGroups.reduce<Action[]>((acc, group) => {
    const filteredItems = filterMenuItems(group, searchValue);

    if (filteredItems.length > 0) {
      acc.push({
        ...group,
        items: filteredItems,
      });
    }

    return acc;
  }, []);
}

export function useComboboxValueState() {
  const store = Ariakit.useComboboxContext();
  const searchValue = store?.useState("value") ?? "";

  return [searchValue, store!.setValue] as const;
}

export function useMenuSide() {
  const store = Ariakit.useMenuStore();
  const currentPlacement = store?.useState("currentPlacement").split("-")[0];

  return currentPlacement;
}

export function useContextMenu(anchorRect: { x: number; y: number }) {
  const menu = Ariakit.useMenuStore();

  React.useEffect(() => {
    if (anchorRect) {
      menu.render();
    }
  }, [anchorRect, menu]);

  return {
    store: menu,
    getAnchorRect: () => anchorRect,
    show: () => {
      menu.show();
      menu.setAutoFocusOnShow(true);
    },
  };
}

export function useMenuStore() {
  const menu = Ariakit.useMenuStore();

  return {
    store: menu,
    show: (anchorElement: HTMLElement) => {
      menu.setAnchorElement(anchorElement);
      menu.show();
      menu.setAutoFocusOnShow(true);
    },
  };
}
