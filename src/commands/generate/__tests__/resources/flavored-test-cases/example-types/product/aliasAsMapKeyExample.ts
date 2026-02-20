import { IBearerTokenAliasExample } from "./bearerTokenAliasExample";
import { IIntegerAliasExample } from "./integerAliasExample";
import { IManyFieldExample } from "./manyFieldExample";
import { IRidAliasExample } from "./ridAliasExample";
import { ISafeLongAliasExample } from "./safeLongAliasExample";
import { IStringAliasExample } from "./stringAliasExample";
import { IUuidAliasExample } from "./uuidAliasExample";

export interface IAliasAsMapKeyExample {
    'strings': { [key: IStringAliasExample]: IManyFieldExample };
    'rids': { [key: IRidAliasExample]: IManyFieldExample };
    'bearertokens': { [key: IBearerTokenAliasExample]: IManyFieldExample };
    'integers': { [key: IIntegerAliasExample]: IManyFieldExample };
    'safelongs': { [key: ISafeLongAliasExample]: IManyFieldExample };
    'datetimes': { [key: string]: IManyFieldExample };
    'uuids': { [key: IUuidAliasExample]: IManyFieldExample };
}
