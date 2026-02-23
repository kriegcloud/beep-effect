"use client";

import { cn } from "@beep/notes/lib/utils";
import { filterWords } from "@platejs/combobox";
import { type UseComboboxInputResult, useComboboxInput, useHTMLInputCursorState } from "@platejs/combobox/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { Point, TElement } from "platejs";
import { useComposedRef, useEditorRef } from "platejs/react";
import type { HTMLAttributes, ReactNode, RefObject } from "react";
import * as React from "react";

import { Ariakit } from "./menu";

type FilterFn = (
  item: {
    readonly value: string;
    readonly group?: undefined | string;
    readonly keywords?: string[];
    readonly label?: string;
  },
  search: string
) => boolean;

interface InlineComboboxContextValue {
  readonly filter: FilterFn | false;
  readonly inputProps: UseComboboxInputResult["props"];
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly removeInput: UseComboboxInputResult["removeInput"];
  readonly showTrigger: boolean;
  readonly trigger: string;
  readonly setHasEmpty: (hasEmpty: boolean) => void;
}

const InlineComboboxContext = React.createContext<InlineComboboxContextValue>(null as any);

const defaultFilter: FilterFn = ({ group, keywords = [], label, value }, search) => {
  const uniqueTerms = new Set([value, ...keywords, group, label].filter(Boolean));

  return Array.from(uniqueTerms).some((keyword) => filterWords(keyword!, search));
};

interface InlineComboboxProps {
  readonly children: ReactNode;
  readonly element: TElement;
  readonly trigger: string;
  readonly filter?: undefined | FilterFn | false;
  readonly hideWhenNoValue?: undefined | boolean;
  readonly showTrigger?: undefined | boolean;
  readonly value?: undefined | string;
  readonly setValue?: undefined | ((value: string) => void);
}

function InlineCombobox({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const [valueState, setValueState] = React.useState("");
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  const setValue = React.useCallback(
    (newValue: string) => {
      setValueProp?.(newValue);

      if (!hasValueProp) {
        setValueState(newValue);
      }
    },
    [setValueProp, hasValueProp]
  );

  const insertPoint = React.useRef<Point | null>(null);

  React.useEffect(() => {
    const path = editor.api.findPath(element);

    if (!path) return;

    const point = editor.api.before(path);

    if (!point) return;

    const pointRef = editor.api.pointRef(point);
    insertPoint.current = pointRef.current;

    return () => {
      pointRef.unref();
    };
  }, [editor, element]);

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: false,
    cursorState,
    ref: inputRef,
    onCancelInput: (cause) => {
      if (cause !== "backspace") {
        const insertOptions: Record<string, unknown> = {};
        if (insertPoint?.current !== undefined) {
          insertOptions.at = insertPoint.current;
        }
        editor.tf.insertText(trigger + value, insertOptions as any);
      }
      if (cause === "arrowLeft" || cause === "arrowRight") {
        editor.tf.move({
          distance: 1,
          reverse: cause === "arrowLeft",
        });
      }
    },
  });

  const [hasEmpty, setHasEmpty] = React.useState(false);

  const contextValue: InlineComboboxContextValue = React.useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [trigger, showTrigger, filter, inputRef, inputProps, removeInput, setHasEmpty]
  );

  const store = Ariakit.useComboboxStore({
    setValue: (newValue) => React.startTransition(() => setValue(newValue)),
  });

  const items = store.useState("items");

  // React.useEffect(() => {
  //   if (!store.getState().activeId) {
  //     store.setActiveId(store.first());
  //   }
  // }, [items, store]);

  return (
    <span contentEditable={false}>
      <Ariakit.ComboboxProvider
        open={(items.length > 0 || hasEmpty) && (!hideWhenNoValue || value.length > 0)}
        store={store}
      >
        <InlineComboboxContext.Provider value={contextValue}>{children}</InlineComboboxContext.Provider>
      </Ariakit.ComboboxProvider>
    </span>
  );
}

function InlineComboboxInput({ className, ref: refProp, ...props }: React.ComponentProps<"input">) {
  const { inputProps, inputRef: contextRef, showTrigger, trigger } = React.useContext(InlineComboboxContext);

  const store = Ariakit.useComboboxContext()!;
  const value = store.useState("value");

  const ref = useComposedRef(refProp, contextRef);

  return (
    <>
      {showTrigger && trigger}

      <span className="relative min-h-[1lh]">
        <span className="invisible overflow-hidden text-nowrap" aria-hidden="true">
          {value || props.placeholder || "\u200B"}
        </span>

        <Ariakit.Combobox
          ref={ref}
          className={cn("absolute top-0 left-0 size-full bg-transparent outline-hidden", className)}
          value={value}
          autoSelect
          {...inputProps}
          {...(props as any)}
        />
      </span>
    </>
  );
}

const comboboxVariants = cva(
  "z-500 mt-1 h-full max-h-[40vh] max-w-[calc(100vw-24px)] min-w-[180px] animate-popover overflow-y-auto rounded-lg bg-popover shadow-floating",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "",
        emoji: "max-h-[270px] w-[408px]",
        mention: "w-[300px]",
        slash: "w-[320px]",
      },
    },
  }
);

const comboboxItemVariants = cva(
  "relative mx-1 flex items-center rounded-sm px-2 py-1 text-sm text-foreground outline-hidden transition-bg-ease select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: "",
        true: "cursor-pointer hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground",
      },
    },
  }
);

function InlineComboboxContent({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof Ariakit.ComboboxPopover> & VariantProps<typeof comboboxVariants>) {
  return (
    <Ariakit.Portal>
      <Ariakit.ComboboxPopover className={cn(comboboxVariants({ variant }), className)} {...props}>
        {props.children}
      </Ariakit.ComboboxPopover>
    </Ariakit.Portal>
  );
}

function InlineComboboxItem({
  className,
  focusEditor = true,
  group,
  keywords,
  label,
  onClick,
  ...props
}: {
  readonly focusEditor?: undefined | boolean;
  readonly group?: undefined | string;
  readonly keywords?: undefined | string[];
  readonly label?: undefined | string;
} & Ariakit.ComboboxItemProps &
  Required<Pick<Ariakit.ComboboxItemProps, "value">>) {
  const { value } = props;

  const { filter, removeInput } = React.useContext(InlineComboboxContext);

  const store = Ariakit.useComboboxContext()!;

  const search = filter && store.useState("value");

  const visible = React.useMemo(() => {
    if (!filter) return true;

    const filterArgs: Record<string, unknown> = { value };
    if (group !== undefined) filterArgs.group = group;
    if (keywords !== undefined) filterArgs.keywords = keywords;
    if (label !== undefined) filterArgs.label = label;

    return filter(filterArgs as any, search as string);
  }, [filter, group, keywords, value, label, search]);

  if (!visible) return null;

  return (
    <Ariakit.ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        removeInput(focusEditor);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

function InlineComboboxEmpty({ children, className }: HTMLAttributes<HTMLDivElement>) {
  const { setHasEmpty } = React.useContext(InlineComboboxContext);
  const store = Ariakit.useComboboxContext()!;
  const items = store.useState("items");

  React.useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div className={cn(comboboxItemVariants({ interactive: false }), "my-1.5 text-muted-foreground", className)}>
      {children}
    </div>
  );
}

function InlineComboboxGroup({ className, ...props }: React.ComponentProps<typeof Ariakit.ComboboxGroup>) {
  return (
    <Ariakit.ComboboxGroup
      className={cn("hidden py-1.5 not-last:border-b [&:has([role=option])]:block", className)}
      {...props}
    />
  );
}

function InlineComboboxGroupLabel({ className, ...props }: React.ComponentProps<typeof Ariakit.ComboboxGroupLabel>) {
  return (
    <Ariakit.ComboboxGroupLabel
      className={cn("mt-1.5 mb-2 px-3 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

const InlineComboboxRow = Ariakit.ComboboxRow;

export {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
  InlineComboboxRow,
};
