import type { ITermMapping } from "../type/ITermMapping.js"
import type { IValueMapping } from "../type/IValueMapping.js"
import type { TermWrapper } from "../TermWrapper.js"

import { GetterArity } from "./GetterArity.js"
import { TermMapping } from "../mapping/TermMapping.js"


export function getter(predicate: string, getterArity: GetterArity, valueMapping: IValueMapping<any>, termMapping: ITermMapping<any> = TermMapping.stringToLiteral): any {
    return function (target: any, context: ClassGetterDecoratorContext): any {
        return function (this: TermWrapper): any {
            switch (getterArity) {
                case GetterArity.Singular:
                    return this.singular(predicate, valueMapping)
                case GetterArity.SingularNullable:
                    return this.singularNullable(predicate, valueMapping)
                case GetterArity.Set:
                    return this.objects(predicate, valueMapping, termMapping)
            }
        }
    }
}
