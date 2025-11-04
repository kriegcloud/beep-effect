import type { UnsafeTypes } from "@beep/types";
import type { BoxProps } from "@mui/material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import * as React from "react";
import * as Core from "./core";

type RenderFunc = (props: {
  scrollableNodeRef: React.RefObject<HTMLElement | undefined>;
  scrollableNodeProps: {
    className: string;
    ref: React.RefObject<HTMLElement | undefined>;
  };
  contentNodeRef: React.RefObject<HTMLElement | undefined>;
  contentNodeProps: {
    className: string;
    ref: React.RefObject<HTMLElement | undefined>;
  };
}) => ReactNode;

export interface SimpleBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, Core.SimpleBarOptions {
  children?: ReactNode | RenderFunc;
  scrollableNodeProps?: {
    ref?: UnsafeTypes.UnsafeAny;
    className?: string;
    [key: string]: UnsafeTypes.UnsafeAny;
  };
  sx?: BoxProps["sx"];
}

const SimpleBar = React.forwardRef<Core.SimpleBarCore | null, SimpleBarProps>(
  ({ children, scrollableNodeProps = {}, ...otherProps }, ref) => {
    const elRef = React.useRef<HTMLElement | null>(null);
    const scrollableNodeRef = React.useRef<HTMLElement>(null);
    const contentNodeRef = React.useRef<HTMLElement | null>(null);
    const options: Partial<Core.SimpleBarOptions> = {};
    const rest: UnsafeTypes.UnsafeAny = {};

    Object.keys(otherProps).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(Core.SimpleBarCore.defaultOptions, key)) {
        (options as UnsafeTypes.UnsafeAny)[key] = otherProps[key as keyof Core.SimpleBarOptions];
      } else {
        rest[key] = otherProps[key as keyof Core.SimpleBarOptions];
      }
    });

    const classNames = {
      ...Core.SimpleBarCore.defaultOptions.classNames,
      ...options.classNames,
    } as Required<(typeof Core.SimpleBarCore.defaultOptions)["classNames"]>;

    const scrollableNodeFullProps = {
      ...scrollableNodeProps,
      className: `${classNames.contentWrapper}${
        scrollableNodeProps.className ? ` ${scrollableNodeProps.className}` : ""
      }`,
      tabIndex: options.tabIndex || Core.SimpleBarCore.defaultOptions.tabIndex,
      role: "region",
      "aria-label": options.ariaLabel || Core.SimpleBarCore.defaultOptions.ariaLabel,
    };

    React.useEffect(() => {
      let instance: Core.SimpleBarCore | null;
      scrollableNodeRef.current = scrollableNodeFullProps.ref
        ? scrollableNodeFullProps.ref.current
        : scrollableNodeRef.current;

      if (elRef.current) {
        instance = new Core.SimpleBarCore(elRef.current, {
          ...options,
          ...(scrollableNodeRef.current && {
            scrollableNode: scrollableNodeRef.current,
          }),
          ...(contentNodeRef.current && {
            contentNode: contentNodeRef.current,
          }),
        });

        if (typeof ref === "function") {
          ref(instance);
        } else if (ref) {
          ref.current = instance;
        }
      }

      return () => {
        instance?.unMount();
        instance = null;
        if (typeof ref === "function") {
          ref(null);
        }
      };
    }, []);

    return (
      <Box sx={otherProps.sx} data-simplebar="init" ref={elRef} {...rest}>
        <div className={classNames.wrapper}>
          <div className={classNames.heightAutoObserverWrapperEl}>
            <div className={classNames.heightAutoObserverEl} />
          </div>
          <div className={classNames.mask}>
            <div className={classNames.offset}>
              {typeof children === "function" ? (
                children({
                  scrollableNodeRef: scrollableNodeRef as React.RefObject<HTMLElement>,
                  scrollableNodeProps: {
                    ...scrollableNodeFullProps,
                    ref: scrollableNodeRef as React.RefObject<HTMLElement>,
                  },
                  contentNodeRef: contentNodeRef as React.RefObject<HTMLElement>,
                  contentNodeProps: {
                    className: classNames.contentEl,
                    ref: contentNodeRef as React.RefObject<HTMLElement>,
                  },
                })
              ) : (
                <div {...scrollableNodeFullProps}>
                  <div className={classNames.contentEl}>{children}</div>
                </div>
              )}
            </div>
          </div>
          <div className={classNames.placeholder} />
        </div>
        <div className={`${classNames.track} ${classNames.horizontal}`}>
          <div className={classNames.scrollbar} />
        </div>
        <div className={`${classNames.track} ${classNames.vertical}`}>
          <div className={classNames.scrollbar} />
        </div>
      </Box>
    );
  }
);

SimpleBar.displayName = "SimpleBar";

export { SimpleBar };
