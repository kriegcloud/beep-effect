import assert from "node:assert"
import { describe, it } from "node:test"
import { DataFactory } from "n3"
import { datasetFromRdf } from "./util/datasetFromRdf.js"
import { ParentDecorated } from "./model/ParentDecorated.js"
import { ChildDecorated } from "./model/ChildDecorated.js"


const rdf = `
prefix : <https://example.org/>

<x>
    :hasString "string 1" ;
    :hasChild [
        :hasString "child string 1" ;
    ] ;
    :hasChildSet [
        :hasString "child string 2" ;
    ], [
        :hasString "child string 3" ;
    ] .
`;

describe("Decorators", async () => {
    const dataset = datasetFromRdf(rdf)
    const parentDecorated = new ParentDecorated(DataFactory.namedNode("x"), dataset, DataFactory)
    const newChild = new ChildDecorated(DataFactory.blankNode(), dataset, DataFactory)

    describe("Term Mappings", async () => {
        it("get single literal to string", () => {
            assert.equal(parentDecorated.hasString, "string 1")
        })

        it("get single wrapped term", () => {
            assert.equal(parentDecorated.hasChild.hasString, "child string 1")
        })

        it("get set of wrapped terms' single literal to string", () => {
            for (const child of parentDecorated.hasChildSet) {
                assert.equal(["child string 2", "child string 3"].includes(child.hasString!), true)
            }
        })
    })

    describe("Value Mappings", async () => {
        it("set single literal to string", () => {
            parentDecorated.hasString = "xxxxx"
            assert.equal(parentDecorated.hasString, "xxxxx")
        })

        it("set single wrapped term", () => {
            newChild.hasString = "new string"
            parentDecorated.hasChild = newChild
            assert.equal(parentDecorated.hasChild.hasString, "new string" )
        })
    })
})
