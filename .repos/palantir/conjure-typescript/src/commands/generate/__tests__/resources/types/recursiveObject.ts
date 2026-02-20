import { IStringAlias } from "./stringAlias";

export interface IRecursiveObject {
    'recursiveField': IRecursiveObject;
    'stringAlias': IStringAlias;
}
