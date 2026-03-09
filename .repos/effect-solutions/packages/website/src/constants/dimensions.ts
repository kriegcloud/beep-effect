// Layout and dimensional constants
export const dimensions = {
  // Effect node dimensions
  node: {
    width: 64,
    height: 64,
  },

  // Failure bubble dimensions
  failureBubble: {
    borderRadius: "8px",
    maxWidth: "200px",
    marginBottom: "8px",
    arrowSize: "6px",
    bubbleY: 10,
    bubbleBlur: 10,
    bubbleScale: 0.8,
  },

  // Article layout dimensions
  article: {
    maxWidth: "48rem", // max-w-screen-md
    sidebarGap: "1.5rem", // ml-6
  },
} as const
