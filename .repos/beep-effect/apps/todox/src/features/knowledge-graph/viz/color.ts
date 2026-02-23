const hashString = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const schemaOrgPalette: Record<string, string> = {
  "https://schema.org/Person": "#2F80ED",
  "https://schema.org/Organization": "#27AE60",
  "https://schema.org/Place": "#F2994A",
  "https://schema.org/LocalBusiness": "#9B51E0",
  "https://schema.org/Product": "#EB5757",
  "https://schema.org/Offer": "#56CCF2",
  "https://schema.org/Event": "#F2C94C",
  "https://schema.org/Action": "#6FCF97",
};

export const colorForType = (typeIri: string): string => {
  const known = schemaOrgPalette[typeIri];
  if (known) return known;

  // Deterministic HSL for unknown types.
  const h = hashString(typeIri) % 360;
  return `hsl(${h} 60% 52%)`;
};
