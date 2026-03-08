import type { IValueMapping } from "./type/IValueMapping.js"
import type { ITermMapping } from "./type/ITermMapping.js"
import type { DatasetCore, Quad, Quad_Object, Quad_Subject } from "@rdfjs/types"
import { TermWrapper } from "./TermWrapper.js"

export class WrappingSet<T> implements Set<T> {
    // TODO: Direction
    public constructor(private readonly subject: TermWrapper, private readonly predicate: string, private readonly valueMapping: IValueMapping<T>, private readonly termMapping: ITermMapping<T>) {
    }

    add(value: T): this {
        this.subject.dataset.add(this.quad(value))
        return this
    }

    clear(): void {
        for (const q of this.matches) {
            this.subject.dataset.delete(q)
        }
    }

    delete(value: T): boolean {
        if (!this.has(value)) {
            return false
        }

        const o = this.termMapping(value, this.subject.dataset, this.subject.factory)?.term // TODO: guards
        const p = this.subject.factory.namedNode(this.predicate)

        for (const q of this.subject.dataset.match(this.subject.term, p, o)) {
            this.subject.dataset.delete(q)
        }

        return true
    }

    forEach(cb: (item: T, index: T, set: Set<T>) => void, thisArg?: any): void {
        for (const item of this) {
            cb.call(thisArg, item, item, this)
        }
    }

    has(value: T): boolean {
        return this.subject.dataset.has(this.quad(value))
    }

    get size(): number {
        return this.matches.size
    }

    [Symbol.iterator](): SetIterator<T> {
        return this.values()
    }

    * entries(): SetIterator<[T, T]> {
        for (const v of this) {
            yield [v, v]
        }
    }

    keys(): SetIterator<T> {
        return this.values()
    }

    * values(): SetIterator<T> {
        for (const q of this.matches) {
            yield this.valueMapping(new TermWrapper(q.object, this.subject.dataset, this.subject.factory))
        }
    }

    get [Symbol.toStringTag](): string {
        return this.constructor.name
    }

    private quad(value: T): Quad {
        const s = this.subject.term as Quad_Subject // TODO: guard
        const p = this.subject.factory.namedNode(this.predicate)
        const o = this.termMapping(value, this.subject.dataset, this.subject.factory)?.term as Quad_Object // TODO: guards
        const q = this.subject.factory.quad(s, p, o)
        return q
    }

    private get matches(): DatasetCore {
        const p = this.subject.factory.namedNode(this.predicate)
        return this.subject.dataset.match(this.subject.term, p)
    }
}
