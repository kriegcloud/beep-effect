// src/types/globals.d.ts

// Augment the global Window interface
declare global {
  interface Window {
    readonly twttr?:
      | undefined
      | {
          readonly widgets: {
            readonly createTweet: (tweetId: string, container: HTMLElement | null) => Promise<unknown>;
          };
        };
  }
}
export {};
