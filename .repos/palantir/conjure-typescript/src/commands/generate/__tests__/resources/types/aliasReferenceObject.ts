import { ISomeObject } from "./someObject";
import { IStringAlias } from "./stringAlias";

export interface IAliasReferenceObject {
    'referenceAlias': ISomeObject;
    'stringAlias': IStringAlias;
}
