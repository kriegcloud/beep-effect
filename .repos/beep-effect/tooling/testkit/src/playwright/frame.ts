import { Context, Effect } from "effect";
import type { Frame } from "playwright-core";
import type { PlaywrightError } from "./errors";
import { PlaywrightLocator } from "./locator";
import type { PageFunction } from "./playwright-types";
import { useHelper } from "./utils";

/**
 * @category model
 * @since 0.1.2
 */
export interface PlaywrightFrameService {
  /**
   * Navigates the frame to the given URL.
   *
   * @see {@link Frame.goto}
   * @since 0.1.3
   */
  readonly goto: (url: string, options?: Parameters<Frame["goto"]>[1]) => Effect.Effect<void, PlaywrightError>;
  /**
   * Waits for the frame to navigate to the given URL.
   *
   * @see {@link Frame.waitForURL}
   * @since 0.1.3
   */
  readonly waitForURL: (
    url: Parameters<Frame["waitForURL"]>[0],
    options?: Parameters<Frame["waitForURL"]>[1]
  ) => Effect.Effect<void, PlaywrightError>;
  /**
   * Waits for the frame to reach the given load state.
   *
   * @see {@link Frame.waitForLoadState}
   * @since 0.2.0
   */
  readonly waitForLoadState: (
    state?: Parameters<Frame["waitForLoadState"]>[0],
    options?: Parameters<Frame["waitForLoadState"]>[1]
  ) => Effect.Effect<void, PlaywrightError>;
  /**
   * Evaluates a function in the context of the frame.
   *
   * @see {@link Frame.evaluate}
   * @since 0.1.3
   */
  readonly evaluate: <R, Arg = void>(
    pageFunction: PageFunction<Arg, R>,
    arg?: Arg
  ) => Effect.Effect<R, PlaywrightError>;
  /**
   * Returns the frame title.
   *
   * @see {@link Frame.title}
   * @since 0.1.3
   */
  readonly title: Effect.Effect<string, PlaywrightError>;
  /**
   * A generic utility to execute any promise-based method on the underlying Playwright `Frame`.
   * Can be used to access any Frame functionality not directly exposed by this service.
   *
   * @see {@link Frame}
   * @since 0.1.2
   */
  readonly use: <T>(f: (frame: Frame) => Promise<T>) => Effect.Effect<T, PlaywrightError>;
  /**
   * Returns a locator for the given selector.
   *
   * @see {@link Frame.locator}
   * @since 0.1.3
   */
  readonly locator: (selector: string, options?: Parameters<Frame["locator"]>[1]) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given role.
   *
   * @see {@link Frame.getByRole}
   * @since 0.1.3
   */
  readonly getByRole: (
    role: Parameters<Frame["getByRole"]>[0],
    options?: Parameters<Frame["getByRole"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given text.
   *
   * @see {@link Frame.getByText}
   * @since 0.1.3
   */
  readonly getByText: (
    text: Parameters<Frame["getByText"]>[0],
    options?: Parameters<Frame["getByText"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given label.
   *
   * @see {@link Frame.getByLabel}
   * @since 0.1.3
   */
  readonly getByLabel: (
    label: Parameters<Frame["getByLabel"]>[0],
    options?: Parameters<Frame["getByLabel"]>[1]
  ) => typeof PlaywrightLocator.Service;
  /**
   * Returns a locator that matches the given test id.
   *
   * @see {@link Frame.getByTestId}
   * @since 0.1.3
   */
  readonly getByTestId: (testId: Parameters<Frame["getByTestId"]>[0]) => typeof PlaywrightLocator.Service;

  /**
   * Returns the current URL of the frame.
   *
   * @see {@link Frame.url}
   * @since 0.1.3
   */
  readonly url: Effect.Effect<string, PlaywrightError>;

  /**
   * Returns the full HTML contents of the frame, including the doctype.
   *
   * @see {@link Frame.content}
   * @since 0.1.3
   */
  readonly content: Effect.Effect<string, PlaywrightError>;

  /**
   * Returns the frame name.
   *
   * @see {@link Frame.name}
   * @since 0.1.3
   */
  readonly name: Effect.Effect<string>;

  /**
   * Clicks an element matching the given selector.
   *
   * @deprecated Use {@link PlaywrightFrameService.locator} to create a locator and then call `click` on it instead.
   * @see {@link Frame.click}
   * @since 0.1.3
   * @category deprecated
   */
  readonly click: (selector: string, options?: Parameters<Frame["click"]>[1]) => Effect.Effect<void, PlaywrightError>;
}

/**
 * @category tag
 * @since 0.1.2
 */
export class PlaywrightFrame extends Context.Tag("effect-playwright/PlaywrightFrame")<
  PlaywrightFrame,
  PlaywrightFrameService
>() {
  /**
   * Creates a `PlaywrightFrame` from a Playwright `Frame` instance.
   *
   * @param frame - The Playwright `Frame` instance to wrap.
   * @since 0.1.2
   */
  static make(frame: Frame): PlaywrightFrameService {
    const use = useHelper(frame);

    return PlaywrightFrame.of({
      goto: (url, options) => use((f) => f.goto(url, options)),
      waitForURL: (url, options) => use((f) => f.waitForURL(url, options)),
      waitForLoadState: (state, options) => use((f) => f.waitForLoadState(state, options)),
      evaluate: <R, Arg>(f: PageFunction<Arg, R>, arg?: Arg) => use((frame) => frame.evaluate<R, Arg>(f, arg as Arg)),
      title: use((f) => f.title()),
      use,
      locator: (selector, options) => PlaywrightLocator.make(frame.locator(selector, options)),
      getByRole: (role, options) => PlaywrightLocator.make(frame.getByRole(role, options)),
      getByText: (text, options) => PlaywrightLocator.make(frame.getByText(text, options)),
      getByLabel: (label, options) => PlaywrightLocator.make(frame.getByLabel(label, options)),
      getByTestId: (testId) => PlaywrightLocator.make(frame.getByTestId(testId)),
      url: Effect.sync(() => frame.url()),
      content: use((f) => f.content()),
      name: Effect.sync(() => frame.name()),
      click: (selector, options) => use((f) => f.click(selector, options)),
    });
  }
}
