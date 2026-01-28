// Shared UUID for autocomplete session
// This ensures max one Autocomplete node per session and prevents
// nodes from showing in other collaboration sessions
export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substring(0, 5);
