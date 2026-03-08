import { TermWrapper } from "./TermWrapper.js"
import type { DataFactory, DatasetCore, Term } from "@rdfjs/types"
import { ValueMapping } from "./mapping/ValueMapping.js"
import { TermMapping } from "./mapping/TermMapping.js"
import { RDF } from "./vocabulary/RDF.js"
import type { IValueMapping } from "./type/IValueMapping"
import type { ITermMapping } from "./type/ITermMapping.js"

export class ListItem<T> extends TermWrapper {
    constructor(term: Term, dataset: DatasetCore, factory: DataFactory, private readonly valueMapping: IValueMapping<T>, private readonly termMapping: ITermMapping<T>) {
        super(term, dataset, factory)
    }

    public get firstRaw(): Term | undefined {
        return this.singularNullable(RDF.first, ValueMapping.asIs)
    }

    public set firstRaw(value: Term | undefined) {
        this.overwriteNullable(RDF.first, value, TermMapping.asIs)
    }

    public get restRaw(): Term | undefined {
        return this.singularNullable(RDF.rest, ValueMapping.asIs)
    }

    public set restRaw(value: Term | undefined) {
        this.overwriteNullable(RDF.rest, value, TermMapping.asIs)
    }

    public get isListItem(): boolean {
        return this.firstRaw !== undefined && this.restRaw !== undefined
    }

    public get isNil(): boolean {
        return this.term.equals(this.factory.namedNode(RDF.nil))
    }

    public get first(): T {
        return this.singular(RDF.first, this.valueMapping)
    }

    public set first(value: T) {
        this.overwrite(RDF.first, value, this.termMapping)
    }

    public get rest(): ListItem<T> {
        return this.singular(RDF.rest, w => new ListItem(w.term, w.dataset, w.factory, this.valueMapping, this.termMapping))
    }

    public set rest(value: ListItem<T>) {
        this.overwrite(RDF.rest, value, TermMapping.identity)
    }

    public pop(): T {
        try {
            return this.first
        } finally {
            this.firstRaw = undefined
            this.restRaw = this.factory.namedNode(RDF.nil)
        }
    }

    public* items(): Iterable<ListItem<T>> {
        if (this.firstRaw === undefined) {
            return
        }

        yield this

        for (const more of this.rest.items()) {
            yield more
        }
    }
}
