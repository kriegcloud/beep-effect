import assert from "node:assert"
import { describe, it } from "node:test"
import { DataFactory } from "n3"
import { ParentDataset } from "./model/ParentDataset.js"
import { datasetFromRdf } from "./util/datasetFromRdf.js"


const rdf = `
prefix : <https://example.org/>

<x>
    a :Parent ;
    :hasString "o1" ;
    :hasChild [
        :hasString "child string 1" ;
    ] ;
    :hasChildSet [
        :hasString "1" ;
    ], [
        :hasString "2" ;
    ] ;
.
`;


describe("Dataset Core Bases", async () => {
    const parentDataset = new ParentDataset(datasetFromRdf(rdf), DataFactory)
    const newQuad = DataFactory.quad(DataFactory.blankNode(), DataFactory.namedNode("x"), DataFactory.literal("x"))

    it("get size", () => {
        assert.equal(parentDataset.size, 8)
    })

    it("add quad", () => {
        parentDataset.add(newQuad)
        assert.equal(parentDataset.size, 9)
    })

    it("add the same quad twice", () => {
        parentDataset.add(newQuad)
        assert.equal(parentDataset.size, 9)
    })

    it("has quad", () => {
        assert.equal(parentDataset.has(newQuad), true)
    })

    it("delete quad", () => {
        parentDataset.delete(newQuad)
        assert.equal(parentDataset.size, 8)
        assert.equal(parentDataset.has(newQuad), false)
    })

    it("match quads", () => {
        parentDataset.add(newQuad)
        assert.equal((Array.from(parentDataset.match(newQuad.subject, newQuad.predicate, newQuad.object, newQuad.graph)).length), 1)
        parentDataset.delete(newQuad)
        assert.equal((Array.from(parentDataset.match(newQuad.subject, newQuad.predicate, newQuad.object, newQuad.graph)).length), 0)
    })
})
