import type { DatasetCore, DataFactory } from "@rdfjs/types"
import type { TermWrapper } from "../TermWrapper.js"


export interface ITermMapping<T> {
    (value: T, dataset: DatasetCore, factory: DataFactory): TermWrapper | undefined
}
