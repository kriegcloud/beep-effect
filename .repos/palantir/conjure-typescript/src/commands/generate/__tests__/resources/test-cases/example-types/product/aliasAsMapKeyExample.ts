import { IManyFieldExample } from "./manyFieldExample";

export interface IAliasAsMapKeyExample {
    'strings': { [key: string]: IManyFieldExample };
    'rids': { [key: string]: IManyFieldExample };
    'bearertokens': { [key: string]: IManyFieldExample };
    'integers': { [key: string]: IManyFieldExample };
    'safelongs': { [key: string]: IManyFieldExample };
    'datetimes': { [key: string]: IManyFieldExample };
    'uuids': { [key: string]: IManyFieldExample };
}
