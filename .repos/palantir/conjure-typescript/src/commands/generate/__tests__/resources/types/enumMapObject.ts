import { EnumWithDocs } from "./enumWithDocs";

export interface IEnumMapObject {
    'someMap': { [key in EnumWithDocs]?: string };
}
