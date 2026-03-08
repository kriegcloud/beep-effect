import type { DataFactory, DatasetCore, Term } from "@rdfjs/types"


export type ITermWrapperConstructor<T> = new (term: Term, dataset: DatasetCore, factory: DataFactory) => T
