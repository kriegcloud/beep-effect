import { IManyFieldExample } from "./manyFieldExample";

export interface IAliasAsMapKeyExample {
    readonly 'strings': { readonly [key: string]: IManyFieldExample };
    readonly 'rids': { readonly [key: string]: IManyFieldExample };
    readonly 'bearertokens': { readonly [key: string]: IManyFieldExample };
    readonly 'integers': { readonly [key: string]: IManyFieldExample };
    readonly 'safelongs': { readonly [key: string]: IManyFieldExample };
    readonly 'datetimes': { readonly [key: string]: IManyFieldExample };
    readonly 'uuids': { readonly [key: string]: IManyFieldExample };
}
