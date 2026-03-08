import type { DataFactory, DatasetCore, Quad_Object, Quad_Subject, Term } from "@rdfjs/types"
import type { ITermMapping } from "./type/ITermMapping.js"
import type { IValueMapping } from "./type/IValueMapping.js"
import { WrappingSet } from "./WrappingSet.js"
import { WrappingMap } from "./WrappingMap.js"


export class TermWrapper {
    public readonly term: Term;
    public readonly dataset: DatasetCore;
    public readonly factory: DataFactory;

    public constructor(term: string, dataset: DatasetCore, factory: DataFactory);
    public constructor(term: Term, dataset: DatasetCore, factory: DataFactory);
    public constructor(term: string | Term, dataset: DatasetCore, factory: DataFactory) {
        if (typeof term === "string") {
            this.term = factory.namedNode(term);
        } else {
            this.term = term;
        }
        this.dataset = dataset;
        this.factory = factory;
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    protected singular<T>(p: string, valueMapping: IValueMapping<T>): T {
        const predicate = this.factory.namedNode(p)
        const matches = this.dataset.match(this.term, predicate)[Symbol.iterator]()

        // TODO: Expose standard errors
        const {value: first, done: none} = matches.next()

        if (none) {
            throw new Error(`More than one value for predicate ${p} on term ${this.term.value}`)
        }

        if (!matches.next().done) {
            throw new Error(`No value found for predicate ${p} on term ${this.term.value}`)
        }

        return valueMapping(new TermWrapper(first.object, this.dataset, this.factory))
    }

    protected singularNullable<T>(p: string, valueMapping: IValueMapping<T>): T | undefined {
        const predicate = this.factory.namedNode(p)

        for (const q of this.dataset.match(this.term, predicate)) {
            return valueMapping(new TermWrapper(q.object, this.dataset, this.factory))
        }

        return
    }

    protected overwrite<T>(p: string, value: T, nodeMapping: ITermMapping<T>): void {
        if (value === undefined) {
            throw new Error("value cannot be undefined")
        }

        this.overwriteNullable(p, value, nodeMapping)
    }

    protected overwriteNullable<T>(p: string, value: T | undefined, termMapping: ITermMapping<T>): void {
        const predicate = this.factory.namedNode(p)

        for (const q of this.dataset.match(this.term, predicate)) {
            this.dataset.delete(q)
        }

        // TODO: TermMapping undefined: Return after deleting quads if undefined
        if (value === undefined) {
            return
        }

        // TODO: Do we really need to test if this.term is a Quad Subject here?
        // @Samu I imagine this is tested at instantiation time in the constructor if at all
        if (!TermWrapper.isQuadSubject(this.term)) {
            return // TODO: throw error?
        }

        // TODO: TermMapping undefined: the term mapping is not invoked if undefined
        const o = termMapping(value, this.dataset, this.factory)

        if (o === undefined) {
            return // TODO: throw error?
        }

        if (!TermWrapper.isQuadObject(o.term)) {
            return // TODO: throw error?
        }

        const q = this.factory.quad(this.term, predicate, o.term)
        this.dataset.add(q)
    }

    protected objects<T>(p: string, valueMapping: IValueMapping<T>, termMapping: ITermMapping<T>): Set<T> {
        return new WrappingSet(this, p, valueMapping, termMapping)
    }

    protected map<TKey, TValue>(p: string, valueMapping: IValueMapping<[TKey, TValue]>, termMapping: ITermMapping<[TKey, TValue]>): Map<TKey, TValue> {
        return new WrappingMap(this, p, valueMapping, termMapping)
    }

    private static isQuadSubject(term: Term): term is Quad_Subject {
        return ["NamedNode", "BlankNode", "Quad", "Variable"].includes(term.termType)
    }

    private static isQuadObject(term: Term): term is Quad_Object {
        return ["NamedNode", "Literal", "BlankNode", "Quad", "Variable"].includes(term.termType)
    }
}
