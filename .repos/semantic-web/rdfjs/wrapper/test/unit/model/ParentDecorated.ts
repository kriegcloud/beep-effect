import { getter, GetterArity, setter, SetterArity, ObjectMapping, TermMapping, TermWrapper, ValueMapping } from "rdfjs-wrapper"
import { Example } from "../vocabulary/Example.js"
import { ChildDecorated } from "./ChildDecorated.js"

export class ParentDecorated extends TermWrapper {
    @getter(Example.hasString, GetterArity.Singular, ValueMapping.literalToString)
    public get hasString(): string {
        throw new Error
    }

    @setter(Example.hasString, SetterArity.Singular, TermMapping.stringToLiteral)
    public set hasString(_: string) {
    }

    @getter(Example.hasChild, GetterArity.Singular, ObjectMapping.as(ChildDecorated))
    public get hasChild(): ChildDecorated {
        throw new Error
    }

    @setter(Example.hasChild, SetterArity.Singular, ObjectMapping.as(ChildDecorated))
    public set hasChild(_: ChildDecorated) {
        throw new Error
    }

    @getter(Example.hasChildSet, GetterArity.Set, ObjectMapping.as(ChildDecorated))
    public get hasChildSet(): Set<ChildDecorated> {
        throw new Error
    }
}
