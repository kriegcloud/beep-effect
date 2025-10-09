declare module "autosuggest-highlight/match" {
  export default function match(text: string, query: string | string[]): Array<[number, number]>;
}

declare module "autosuggest-highlight/parse" {
  export interface HighlightSegment {
    text: string;
    highlight: boolean;
  }

  export default function parse(text: string, matches: Array<[number, number]>): HighlightSegment[];
}
