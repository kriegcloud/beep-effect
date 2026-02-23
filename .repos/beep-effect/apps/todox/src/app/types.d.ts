declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH: string | undefined;
  }

  interface InputEvent {
    // Make deletable for Lexical's beforeInput polyfill
    getTargetRanges?(): StaticRange[];
  }
}

export {};
