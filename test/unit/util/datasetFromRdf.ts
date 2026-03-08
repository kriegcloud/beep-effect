import type { DatasetCore } from "@rdfjs/types";
import { Parser, Store } from "n3"

export function datasetFromRdf(rdf: string): DatasetCore {
    const store = new Store()
    store.addQuads(new Parser().parse(rdf));

    return store
}
