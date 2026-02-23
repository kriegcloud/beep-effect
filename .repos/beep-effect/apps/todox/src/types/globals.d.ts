// src/types/globals.d.ts

// Web Speech API types (not included in standard TypeScript lib)
declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  type SpeechRecognitionErrorCode =
    | "aborted"
    | "audio-capture"
    | "bad-grammar"
    | "language-not-supported"
    | "network"
    | "no-speech"
    | "not-allowed"
    | "service-not-allowed";

  interface Window {
    readonly twttr?:
      | undefined
      | {
          readonly widgets: {
            readonly createTweet: (tweetId: string, container: HTMLElement | null) => Promise<unknown>;
          };
        };
    readonly webkitAudioContext: typeof AudioContext;
    readonly SpeechRecognition?: typeof SpeechRecognition;
    readonly webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export {};
