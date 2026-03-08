/**
 * An HTML parser event.
 */
export type BufferedTagEvent = {
  type: 'close';
} | {
  type: 'open';
  name: string;
  attributes: Record<string, string>;
} | {
  type: 'text';
  data: string;
};
