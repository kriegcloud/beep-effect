import { getter, GetterArity, setter, SetterArity, TermMapping, TermWrapper, ValueMapping } from "rdfjs-wrapper"
import { Example } from "../vocabulary/Example.js"

export class ChildDecorated extends TermWrapper {
    @getter(Example.hasString, GetterArity.SingularNullable, ValueMapping.literalToString)
    public get hasString(): string | undefined {
        throw new Error
    }

    @setter(Example.hasString, SetterArity.SingularNullable, TermMapping.stringToLiteral)
    public set hasString(_: string | undefined) {
    }
}
