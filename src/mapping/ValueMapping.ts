import type { Literal, Term } from "@rdfjs/types"
import type { ILangString } from "../type/ILangString.js"
import type { TermWrapper } from "../TermWrapper.js"


/*
 * Read from the RDF dataset
 * Transform RDF Terms to JavaScript primitive types
*/
export namespace ValueMapping {
    export function blankNodeToString(termWrapper: TermWrapper): string {
        // TODO: Throw typed error
        if (termWrapper.term.termType != "BlankNode") {
            throw Error(`Value mapping expected blank node but got ${termWrapper.term.termType}`)
        }
        return iriOrBlankNodeToString(termWrapper)
    }

    export function literalToDate(termWrapper: TermWrapper): Date {
        // TODO: Check term type
        return new Date(termWrapper.term.value)
    }

    // TODO: Lang string dictionary value mapping
    export function literalToLangString(termWrapper: TermWrapper): ILangString {
        // TODO: Check term type
        const x = termWrapper.term as Literal
        return { lang: x.language, string: x.value }
    }

    export function literalToNumber(termWrapper: TermWrapper): number {
        // TODO: Check term type
        return Number(termWrapper.term.value)
    }

    export function literalToString(termWrapper: TermWrapper): string {
        // TODO: Check term type
        return termWrapper.term.value
    }

    export function iriToString(termWrapper: TermWrapper): string {
        // TODO: Check term type
        return iriOrBlankNodeToString(termWrapper)
    }

    export function iriOrBlankNodeToString(termWrapper: TermWrapper): string {
        return termWrapper.term.value
    }

    export function asIs(termWrapper: TermWrapper): Term {
        return termWrapper.term
    }
}
