import { TermWrapper } from "./TermWrapper.js"
import { ListItem } from "./ListItem.js"
import { TermMapping } from "./mapping/TermMapping.js"

export class Overwriter<T> extends TermWrapper {
    constructor(subject: TermWrapper, private readonly predicate: string) {
        super(subject.term, subject.dataset, subject.factory);
    }

    set listNode(object: ListItem<T>) {
        this.overwrite(this.predicate, object, TermMapping.identity)
    }
}
