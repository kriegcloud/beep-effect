import type { DataFactory, DatasetCore, Term } from "@rdfjs/types"
import type { ILangString } from "../type/ILangString.js"

import { TermWrapper } from "../TermWrapper.js"


/*
 * Write to the RDF dataset
 * Transform JavaScript primitive types to Term Wrapper
 * Generic Term Wrapper factories
*/
export namespace TermMapping {
    export function dateToLiteral(value: Date, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(factory.literal(value.toISOString(), factory.namedNode("http://www.w3.org/2001/XMLSchema#date")), dataset, factory)
    }

    // TODO: Lang string dictionary value mapping
    export function langStringToLiteral(value: ILangString, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        // TODO: Fix bug in N3.JS function literal line 340 (test languageOrDataType === 'string')
        // Then re-establish proper factory method
        //return new TermWrapper(factory.literal(value.string, { language: value.lang } ), dataset, factory)
        return new TermWrapper(factory.literal(value.string, value.lang), dataset, factory)
    }

    export function numberToLiteral(value: number, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(factory.literal(value.toString(), factory.namedNode("http://www.w3.org/2001/XMLSchema#double")), dataset, factory)
    }

    export function stringToBlankNode(value: string | undefined, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(factory.blankNode(value), dataset, factory)
    }

    export function stringToIri(value: string, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(factory.namedNode(value), dataset, factory)
    }

    export function stringToLiteral(value: string, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(factory.literal(value), dataset, factory)
    }

    export function asIs(value: Term, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined {
        return new TermWrapper(value, dataset, factory)
    }

    export function identity<T>(value: T): T {
        return value
    }
}
