import type { TermWrapper } from "../TermWrapper.js"


export interface IValueMapping<T> {
    (termWrapper: TermWrapper): T
}
