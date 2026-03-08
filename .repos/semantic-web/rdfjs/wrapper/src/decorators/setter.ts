import type { ITermMapping } from "../type/ITermMapping.js"
import type { TermWrapper } from "../TermWrapper.js"

import { SetterArity } from "./SetterArity.js"


export function setter(predicate: string, setterArity: SetterArity, termMapping: ITermMapping<any>): any {
    return function (target: any, context: ClassSetterDecoratorContext): any {
        return function (this: TermWrapper, value: any): void {
            switch (setterArity) {
                case SetterArity.Singular:
                    this.overwrite(predicate, value, termMapping)
                    break
                case SetterArity.SingularNullable:
                    this.overwriteNullable(predicate, value, termMapping)
                    break
            }
        }
    }
}
