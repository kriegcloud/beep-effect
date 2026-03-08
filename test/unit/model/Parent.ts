import type { ILangString } from "../../../dist/type/ILangString.js"

import { ObjectMapping, TermMapping, TermWrapper, ValueMapping } from "rdfjs-wrapper"
import { Child } from "./Child.js"
import { Example } from "../vocabulary/Example.js"

export class Parent extends TermWrapper {
    /* Value Mapping */
    public get hasBlankNode(): string {
        return this.singular(Example.hasBlankNode, ValueMapping.blankNodeToString)
    }

    public get hasDate(): Date {
        return this.singular(Example.hasDate, ValueMapping.literalToDate)
    }

    public get hasLangString(): ILangString {
        return this.singular(Example.hasLangString, ValueMapping.literalToLangString)
    }

    public get hasNumber(): number {
        return this.singular(Example.hasNumber, ValueMapping.literalToNumber)
    }

    public get hasString(): string {
        return this.singular(Example.hasString, ValueMapping.literalToString)
    }

    public get hasIri(): string {
        return this.singular(Example.hasIri, ValueMapping.iriToString)
    }


    /* Term Mapping */
    public set hasBlankNode(value: string) {
        this.overwrite(Example.hasBlankNode, value, TermMapping.stringToBlankNode)
    }

    public set hasDate(value: Date ) {
        this.overwrite(Example.hasDate, value, TermMapping.dateToLiteral)
    }

    public set hasLangString(value: ILangString ) {
        this.overwrite(Example.hasLangString, value, TermMapping.langStringToLiteral)
    }

    public set hasNumber(value: number ) {
        this.overwrite(Example.hasNumber, value, TermMapping.numberToLiteral)
    }

    public set hasString(value: string ) {
        this.overwrite(Example.hasString, value, TermMapping.stringToLiteral)
    }

    public set hasIri(value: string ) {
        this.overwrite(Example.hasIri, value, TermMapping.stringToIri)
    }


    /* Object Mapping */
    public get hasChild(): Child {
        return this.singular(Example.hasChild, ObjectMapping.as(Child))
    }

    public set hasChild(value: Child) {
        this.overwriteNullable(Example.hasChild, value, ObjectMapping.as(Child))
    }


    /* Arity Mapping */
    public get hasNoSingularString(): string {
        return this.singular(Example.hasNoSingularString, ValueMapping.literalToString)
    }

    public get hasTooManySingularString(): string {
        return this.singular(Example.hasTooManySingularString, ValueMapping.literalToString)
    }

    public get hasNullableString(): string | undefined {
        return this.singularNullable(Example.hasNullableString, ValueMapping.literalToString)
    }

    public set hasNullableString(value: string | undefined ) {
        this.overwriteNullable(Example.hasNullableString, value, TermMapping.stringToLiteral)
    }


    /* Set Mapping */
    public get hasChildSet(): Set<Child> {
        return this.objects(Example.hasChildSet, ObjectMapping.as(Child), ObjectMapping.as(Child))
    }

    public get hasLangStringSet(): Set<ILangString> {
        return this.objects(Example.hasLangStringSet, ValueMapping.literalToLangString, TermMapping.langStringToLiteral)
    }


    /* Recursion Mapping */
    public get hasRecursive(): Parent {
        return this.singular(Example.hasRecursive, ObjectMapping.as(Parent))
    }

    public set hasRecursive(value: string | undefined) {
        this.overwriteNullable(Example.hasRecursive, value, TermMapping.stringToIri)
    }
}
