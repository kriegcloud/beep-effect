"use client";

import {Button} from "@beep/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@beep/ui/components/card";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@beep/ui/components/popover";
import {cn} from "@beep/ui-core/utils";
import {XIcon} from "@phosphor-icons/react";
import type {Content} from "@radix-ui/react-popover";
import * as A from "effect/Array";
import Link from "next/link";
import * as React from "react";
import {createPortal} from "react-dom";

const TourContext = React.createContext<{
                                          readonly start: (tourId: string) => void
                                          readonly close: () => void
                                        } | null>(null);

function useTour() {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

interface Step {
  readonly id: string;
  readonly title: React.ReactNode;
  readonly content: React.ReactNode;
  readonly nextRoute?: undefined |  string;
  readonly previousRoute?: undefined |  string;
  readonly nextLabel?: undefined |  React.ReactNode;
  readonly previousLabel?: undefined |  React.ReactNode;
  readonly side?: undefined |  React.ComponentProps<typeof Content>["side"];
  readonly sideOffset?: undefined |  React.ComponentProps<typeof Content>["sideOffset"];
  readonly align?: undefined |  React.ComponentProps<typeof Content>["align"];
  readonly alignOffset?: undefined |  React.ComponentProps<typeof Content>["alignOffset"];
  readonly className?: undefined |  string;
}

interface Tour {
  readonly id: string;
  readonly steps: Step[];
}

function TourProvider({
  tours,
  children,
}: {
  readonly tours: Tour[]
  readonly children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTourId, setActiveTourId] = React.useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const activeTour = tours.find((tour) => tour.id === activeTourId);
  const steps = activeTour?.steps || [];

  function next() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
      setCurrentStepIndex(0);
      setActiveTourId(null);
    }
  }

  function previous() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  function close() {
    setIsOpen(false);
    setCurrentStepIndex(0);
    setActiveTourId(null);
  }

  function start(tourId: string) {
    const tour = tours.find((tour) => tour.id === tourId);
    if (tour) {
      if (tour.steps.length > 0) {
        setActiveTourId(tourId);
        setIsOpen(true);
        setCurrentStepIndex(0);
      } else {
        console.error(`Tour with id '${tourId}' has no steps.`);
      }
    } else {
      console.error(`Tour with id '${tourId}' not found.`);
    }
  }

  return (
    <TourContext.Provider
      value={{
        start,
        close,
      }}>
      {children}
      {isOpen && activeTour && steps.length > 0 && (
        <TourOverlay
          step={steps[currentStepIndex]}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          onNext={next}
          onPrevious={previous}
          onClose={close}
        />
      )}
    </TourContext.Provider>
  );
}

function TourOverlay({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
}: {
  readonly step: Step
  readonly currentStepIndex: number
  readonly totalSteps: number
  readonly onNext: () => void
  readonly onPrevious: () => void
  readonly onClose: () => void
}) {
  const [targets, setTargets] = React.useState<
    { readonly rect: DOMRect; readonly radius: number }[]
  >([]);

  React.useEffect(() => {
    let needsScroll = true;

    function updatePosition() {
      const elements = document.querySelectorAll(
        `[data-tour-step-id*='${step.id}']`
      );

      if (elements.length > 0) {
        const validElements = A.empty<{
          readonly rect: {
            readonly width: number
            readonly height: number
            readonly x: number
            readonly y: number
            readonly left: number
            readonly top: number
            readonly right: number
            readonly bottom: number
            readonly toJSON: () => void
          }
          readonly radius: number
          readonly element: Element
        }>();

        Array.from(elements).forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

          const style = window.getComputedStyle(element);
          const radius = Number(style.borderRadius) || 4;

          validElements.push({
            rect: {
              width: rect.width,
              height: rect.height,
              x: rect.left,
              y: rect.top,
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              toJSON: () => {
              },
            },
            radius,
            element,
          });
        });

        setTargets(
          validElements.map(({rect, radius}) => ({rect, radius}))
        );

        if (validElements.length > 0 && needsScroll) {
          validElements[0].element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          needsScroll = false;
        }
      } else {
        setTargets([]);
      }
    }

    updatePosition();
    const handleResizeOrScroll = () => updatePosition();

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    const observer = new MutationObserver(() => updatePosition());
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(() => updatePosition());
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [step]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!document) return null;
  if (targets.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <svg role={"img"} className="absolute inset-0 size-full">
        <defs>
          <mask id="tour-mask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="white"
            />
            {targets.map((target, i) => (
              <rect
                key={i}
                x={target.rect.left}
                y={target.rect.top}
                width={target.rect.width}
                height={target.rect.height}
                rx={target.radius}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          mask="url(#tour-mask)"
          className="fill-black opacity-20"
        />
        {targets.map((target, i) => {
          return (
            <rect
              key={i}
              x={target.rect.left}
              y={target.rect.top}
              width={target.rect.width}
              height={target.rect.height}
              rx={target.radius}
              className="stroke-primary fill-none stroke-2"
            />
          );
        })}
      </svg>
      {targets.length > 0 && (
        <Popover key={step.id} open={true}>
          <PopoverAnchor
            virtualRef={{
              current: {
                getBoundingClientRect: () =>
                  targets[0]?.rect || {
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    bottom: 0,
                    right: 0,
                    x: 0,
                    y: 0,
                    toJSON: () => {
                    },
                  },
              },
            }}
          />
          <PopoverContent className={cn("px-0", step.className)} side={step.side} sideOffset={step.sideOffset}
                          align={step.align} alignOffset={step.alignOffset} onOpenAutoFocus={(e) => e.preventDefault()}
                          onCloseAutoFocus={(e) => e.preventDefault()} render={<Card/>}><CardHeader>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {totalSteps}
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}>
                <XIcon/>
              </Button>
            </CardAction>
          </CardHeader><CardContent>{step.content}</CardContent><CardFooter className="justify-between">
            {currentStepIndex > 0 &&
              (step.previousRoute ? (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  asChild>
                  <Link href={step.previousRoute}>
                    {step.previousLabel ??
                      "Previous"}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onPrevious}>
                  {step.previousLabel ?? "Previous"}
                </Button>
              ))}
            {step.nextRoute ? (
              <Button
                className="ml-auto"
                onClick={onNext}
                asChild>
                <Link href={step.nextRoute}>
                  {step.nextLabel ??
                    (currentStepIndex ===
                    totalSteps - 1
                      ? "Finish"
                      : "Next")}
                </Link>
              </Button>
            ) : (
              <Button
                className="ml-auto"
                onClick={onNext}>
                {step.nextLabel ??
                  (currentStepIndex === totalSteps - 1
                    ? "Finish"
                    : "Next")}
              </Button>
            )}
          </CardFooter></PopoverContent>
        </Popover>
      )}
    </div>,
    document.body
  );
}

export {TourProvider, useTour, type Step, type Tour};
