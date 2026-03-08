import { TermMapping, TermWrapper, ValueMapping } from "rdfjs-wrapper"
import { Example } from "../vocabulary/Example.js"

export class Child extends TermWrapper {
    public get hasString(): string | undefined {
        return this.singularNullable(Example.hasString, ValueMapping.literalToString)
    }

    public set hasString(value: string | undefined) {
        this.overwriteNullable(Example.hasString, value, TermMapping.stringToLiteral)
    }
}
