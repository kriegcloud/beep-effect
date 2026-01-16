import { Context, Effect } from "effect";
import type { BrowserContext } from "playwright-core";
import type { PlaywrightError } from "./errors";
import { PlaywrightPage } from "./page";
import { useHelper } from "./utils";

export class PlaywrightBrowserContext extends Context.Tag("cehs/backend/lib/playwright/PlaywrightBrowserContext")<
  PlaywrightBrowserContext,
  {
    readonly pages: Effect.Effect<Array<typeof PlaywrightPage.Service>>;
    readonly newPage: Effect.Effect<typeof PlaywrightPage.Service, PlaywrightError.Type>;
    readonly close: Effect.Effect<void, PlaywrightError.Type>;
  }
>() {
  static make(context: BrowserContext) {
    const use = useHelper(context);
    return PlaywrightBrowserContext.of({
      pages: Effect.sync(() => context.pages().map(PlaywrightPage.make)),
      newPage: use((c) => c.newPage().then(PlaywrightPage.make)),
      close: use((c) => c.close()),
    });
  }
}
