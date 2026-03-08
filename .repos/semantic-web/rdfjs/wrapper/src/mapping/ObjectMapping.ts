import type { IValueMapping } from "../type/IValueMapping.js"
import type { ITermWrapperConstructor } from "../type/ITermWrapperConstructor.js"
import type { TermWrapper } from "../TermWrapper.js"
import type { ITermMapping } from "../type/ITermMapping.js"
import { RdfList } from "../RdfList.js"


/*
 * Read and write the RDF dataset
 * Map RDF to Term Wrapper instances
 * Map Term Wrappers instances to RDF
 *
 * A self-invoking Value Mapping that returns a Term Wrapper
 * and therefore can be used as a Value and a Term Mapping
 *
 * This essentially works because reading writing the graph will only materialise when hitting a property
 *
*/
export namespace ObjectMapping {
    export function as<T>(constructor: ITermWrapperConstructor<T>): IValueMapping<T> {
        return (termWrapper: TermWrapper) => new constructor(termWrapper.term, termWrapper.dataset, termWrapper.factory)
    }

    export function asList<T>(subject: TermWrapper, predicate: string, valueMapping: IValueMapping<T>, termMapping: ITermMapping<T>): IValueMapping<T[]> {
        return w => new RdfList(w.term, subject, predicate, valueMapping, termMapping)
    }
}
