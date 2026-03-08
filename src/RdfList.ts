import { TermWrapper } from "./TermWrapper.js"
import type { IValueMapping } from "./type/IValueMapping.js"
import type { ITermMapping } from "./type/ITermMapping.js"
import { IndexerInterceptor } from "./IndexerInterceptor.js"
import { ListItem } from "./ListItem.js"
import { RDF } from "./vocabulary/RDF.js"
import type { Term } from "@rdfjs/types"
import { Overwriter } from "./Overwriter.js"

export class RdfList<T> implements Array<T> {
    private root: ListItem<T>

    constructor(root: Term, private readonly subject: TermWrapper, private readonly predicate: string, private readonly valueMapping: IValueMapping<T>, private readonly termMapping: ITermMapping<T>) {
        this.root = new ListItem(root, this.subject.dataset, this.subject.factory, valueMapping, termMapping)

        // TODO: Singleton interceptor?
        return new Proxy(this, new IndexerInterceptor<T>)
    }

    // Never invoked, intercepted by proxy
    [n: number]: T

    get [Symbol.unscopables](): { [K in keyof any[]]?: boolean } {
        return Array.prototype[Symbol.unscopables]
    }

    get length(): number {
        return [...this.items].length
    }

    set length(_: number) {
        throw new Error("this array is based on an RDF Collection. Its length cannot be modified like this.")
    }

    [Symbol.iterator](): ArrayIterator<T> {
        return this.values()
    }

    at(index: number): T | undefined {
        // TODO: Don't materialize all, only up to index
        return [...this.items].at(index)?.first
    }

    concat(...items: Array<ConcatArray<T> | T>): T[] {
        return [...this].concat(...items)
    }

    copyWithin(target: number, start: number, end?: number): this {
        throw new Error("not implemented")
    }

    entries(): ArrayIterator<[number, T]> {
        // TODO: Don't materlialize all upfront
        return [...this].entries()
    }

    every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): this is S[] {
        return [...this].every(predicate, thisArg)
    }

    fill(value: T, start?: number, end?: number): this {
        throw new Error("not implemented")
    }

    filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[] {
        return [...this].filter(predicate, thisArg)
    }

    find<S extends T>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined {
        return [...this].find(predicate, thisArg)
    }

    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
        return [...this].findIndex(predicate, thisArg)
    }

    flat<A, D extends number = 1>(depth?: D): FlatArray<A, D>[] {
        throw new Error("not implemented")
    }

    flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => (ReadonlyArray<U> | U), thisArg?: This): U[] {
        return [...this].flatMap(callback, thisArg)
    }

    forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        [...this].forEach(callback, thisArg)
    }

    includes(searchElement: T, fromIndex?: number): boolean {
        return [...this].includes(searchElement, fromIndex)
    }

    indexOf(searchElement: T, fromIndex?: number): number {
        return [...this].indexOf(searchElement, fromIndex)
    }

    join(separator?: string): string {
        return [...this].join(separator)
    }

    keys(): ArrayIterator<number> {
        // TODO: Don't materialize all upfront
        return [...this.items].keys()
    }

    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return [...this].lastIndexOf(searchElement, fromIndex)
    }

    map<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
        return [...this].map(callback, thisArg)
    }

    pop(): T | undefined {
        return [...this.items].at(-1)?.pop()
    }

    push(...items: T[]): number {
        const nil = this.subject.factory.namedNode(RDF.nil)

        for (const item of items) {
            // A node will be needed either to replace rdf:nil in an empty list or to add a new one to the end of an existing list
            const newNode = new ListItem(this.subject.factory.blankNode(), this.subject.dataset, this.subject.factory, this.valueMapping, this.termMapping)

            const lastNode = this.root.isNil ?
                // The statement representing an empty list is replaced by a new one whose object is the new node
                // The representation of the first item (root, currently rdf:nil, the empty list) is overwritten by the new node
                this.root = new Overwriter<T>(this.subject, this.predicate).listNode = newNode :

                // replace rest of current last with new and return is because it's the new last
                [...this.items].at(-1)!.rest = newNode;

            lastNode.first = item
            lastNode.restRaw = nil
        }

        return this.length
    }

    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue?: U): U {
        return [...this].reduce(callback, initialValue!)
    }

    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue?: U): U {
        return [...this].reduceRight(callback, initialValue!)
    }

    reverse(): T[] {
        throw new Error("not implemented")
    }

    shift(): T | undefined {
        if (this.root.isNil) {
            return undefined
        }

        const value = this.root.first

        if (this.root.rest.isNil) {
            new Overwriter<T>(this.subject, this.predicate).listNode = this.root.rest
            this.root.firstRaw = undefined
            this.root.restRaw = undefined
        } else {
            this.root.firstRaw = this.root.rest.firstRaw
            this.root.restRaw = this.root.rest.restRaw
        }

        return value
    }

    slice(start?: number, end?: number): T[] {
        // TODO: Probably no need to materialize all
        return [...this].slice(start, end)
    }

    some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
        return [...this].some(predicate, thisArg)
    }

    sort(compareFn?: (a: T, b: T) => number): this {
        throw new Error("not implemented")
    }

    splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        throw new Error("not implemented")
    }

    unshift(...items: T[]): number {
        for (const item of items.reverse()) {
            const firstNode = this.root
            this.root = new Overwriter<T>(this.subject, this.predicate).listNode = new ListItem(this.subject.factory.blankNode(), this.subject.dataset, this.subject.factory, this.valueMapping, this.termMapping)
            this.root.first = item
            this.root.rest = firstNode
        }

        return this.length
    }

    * values(): ArrayIterator<T> {
        for (const item of this.items) {
            yield item.first
        }
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    private get items(): Iterable<ListItem<T>> {
        return this.root.items()
    }
}
