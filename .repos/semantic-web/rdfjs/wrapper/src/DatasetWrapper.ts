import type { DataFactory, DatasetCore, Quad, Term } from "@rdfjs/types"
import type { ITermWrapperConstructor } from "./type/ITermWrapperConstructor.js"

import { RDF } from "./vocabulary/RDF.js"


abstract class DatasetCoreBase implements DatasetCore {
    public constructor(private readonly dataset: DatasetCore, protected readonly factory: DataFactory) {
    }

    public get size(): number {
        return this.dataset.size
    }

    public [Symbol.iterator](): Iterator<Quad> {
        return this.dataset[Symbol.iterator]()
    }

    public add(quad: Quad): this {
        this.dataset.add(quad)
        return this
    }

    public delete(quad: Quad): this {
        this.dataset.delete(quad)
        return this
    }

    public has(quad: Quad): boolean {
        return this.dataset.has(quad)
    }

    public match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): DatasetCore {
        return this.dataset.match(subject, predicate, object, graph)
    }
}

export class DatasetWrapper extends DatasetCoreBase {
    protected* subjectsOf<T>(predicate: string, termWrapper: ITermWrapperConstructor<T>): Iterable<T> {
        for (const q of this.matchSubjectsOf(termWrapper, this.factory.namedNode(predicate))) {
            yield q
        }
    }

    protected* objectsOf<T>(predicate: string, termWrapper: ITermWrapperConstructor<T>): Iterable<T> {
        for (const q of this.matchObjectsOf(termWrapper, undefined, this.factory.namedNode(predicate))) {
            yield q
        }
    }

    protected* instancesOf<T>(predicate: string, constructor: ITermWrapperConstructor<T>): Iterable<T> {
        for (const q of this.matchSubjectsOf(constructor, this.factory.namedNode(RDF.type), this.factory.namedNode(predicate))) {
            yield q
        }
    }

    protected* matchSubjectsOf<T>(termWrapper: ITermWrapperConstructor<T>, predicate?: Term, object?: Term, graph?: Term): Iterable<T> {
        for (const q of this.match(undefined, predicate, object, graph)) {
            yield new termWrapper(q.subject, this, this.factory)
        }
    }

    protected* matchObjectsOf<T>(termWrapper: ITermWrapperConstructor<T>, subject?: Term, predicate?: Term, graph?: Term): Iterable<T> {
        for (const q of this.match(subject, predicate, undefined, graph)) {
            yield new termWrapper(q.object, this, this.factory)
        }
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }
}
