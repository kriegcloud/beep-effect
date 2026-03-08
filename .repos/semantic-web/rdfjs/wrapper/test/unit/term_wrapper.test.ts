import assert from "node:assert"
import { describe, it } from "node:test"
import { DataFactory } from "n3"
import { Child } from "./model/Child.js"
import { datasetFromRdf } from "./util/datasetFromRdf.js"
import { Parent } from "./model/Parent.js"


const rdf = `
prefix : <https://example.org/>

<x>
    :hasBlankNode _:0 ;
    :hasDate "1969-01-01" ;
    :hasLangString "lang string 1"@en ;
    :hasNumber "1" ;
    :hasString "string 1" ;
    :hasIri <https://example.org> ;
    :hasTooManySingularString "o3", "o4" ;
    :hasNullableString "o2" ;
    :hasChild [
        :hasString "child string 1" ;
    ] ;
    :hasLangStringSet "lang string 1", "lang string 2"@en, "lang string 3"@fr ;
    :hasChildSet [
        :hasString "child string 2" ;
    ], [
        :hasString "child string 3" ;
    ] ;
    :hasRecursive <x> ;
.
`;


describe("Term Wrapper", async () => {
    const dataset = datasetFromRdf(rdf)
    const parent = new Parent("x", dataset, DataFactory)


    describe("Value Mapping", async () => {
        it("get blank node to string", () => {
            assert.equal(parent.hasBlankNode, "b0_0")
        })

        it("get literal to date", () => {
            assert.equal(parent.hasDate.toISOString(), "1969-01-01T00:00:00.000Z")
        })

        it("get literal to lang string", () => {
            assert.deepEqual(parent.hasLangString, { lang: "en", string: "lang string 1"})
        })

        it("get literal to number", () => {
            assert.equal(parent.hasNumber, 1)
        })

        it("get literal to string", () => {
            assert.equal(parent.hasString, "string 1")
        })

        it("get iri to string", () => {
            assert.equal(parent.hasIri, "https://example.org")
        })
    })


    describe("Term Mapping", async () => {
        it("set date to literal", () => {
            parent.hasDate = new Date("1970-01-01")
            assert.equal(parent.hasDate.toISOString(), "1970-01-01T00:00:00.000Z")
        })

        it("set lang string to literal", () => {
            const langString = { lang: "fr", string: "lang string 2" }
            parent.hasLangString = langString
            assert.deepEqual(parent.hasLangString, langString)
        })

        it("set number to literal", () => {
            parent.hasNumber = 2
            assert.equal(parent.hasNumber, 2)
        })

        it("set string to blank node", () => {
            // TODO: Check if this is expected behaviour
            // Does this clash with named node x when matching?
            parent.hasBlankNode = "x"
            assert.equal(parent.hasBlankNode, "x")
        })

        it("set string to iri", () => {
            parent.hasIri = "x"
            assert.equal(parent.hasIri, "x")
        })

        it("set string to literal", () => {
            parent.hasString = "o1 edited"
            assert.equal(parent.hasString, "o1 edited")
        })
    })


    describe("Object Mapping", async () => {
        it("get wrapped term", () => {
            assert.equal(parent.hasChild.hasString, "child string 1")
        })

        it("set wrapped term", () => {
            const newChild = new Child(DataFactory.blankNode(), dataset, DataFactory)
            newChild.hasString = "child string 4"
            parent.hasChild = newChild
            assert.equal(parent.hasChild.hasString, "child string 4")
        })
    })


    describe("Arity Mapping", async () => {
        describe("Singular", async () => {
            it("get singular throws if more than 1", () => {
                // TODO: Test for specific errors
                assert.throws(() => parent.hasTooManySingularString)
            })

            it("get singular throws if no value", () => {
                // TODO: Test for specific errors
                assert.throws(() => parent.hasNoSingularString)
            })

            it("set singular to undefined throws", () => {
                assert.throws(() => { parent.hasString = undefined as any })
            })
        })


        describe("Singular Nullable", async () => {
            it("get nullable", () => {
                assert.equal(parent.hasNullableString, "o2")
            })

            it("set nullable to undefined", () => {
                assert.equal(parent.dataset.size, 20)
                parent.hasNullableString = undefined
                assert.equal(parent.hasNullableString, undefined)
                assert.equal(parent.dataset.size, 19)
            })

            it("set nullable to string", () => {
                parent.hasNullableString = "o2 edited"
                assert.equal(parent.hasNullableString, "o2 edited")
            })

            // TODO: Test nullable object
        })

        // TODO: Set Arity
    })


    describe("Set Mapping", async () => {
        // TODO: test primitive types wrapping set

        it("get set of lang string", () => {
            assert.equal(parent.hasLangStringSet.size, 3)
            for (const langString of parent.hasLangStringSet) {
                assert.equal(["", "en", "fr"].includes(langString.lang), true)
            }
        })

        it("get set of wrapped terms", () => {
            assert.equal(parent.hasChildSet.size, 2)
        })

        it("add to set of wrapped terms", () => {
            const newChild = new Child(DataFactory.blankNode(), dataset, DataFactory)
            newChild.hasString = "child string 5"
            parent.hasChildSet.add(newChild)
            assert.equal(parent.hasChildSet.size, 3)
        })

        it("get set of wrapped terms' single literal to string", () => {
            for (const child of parent.hasChildSet) {
                assert.equal(["child string 2", "child string 3", "child string 5"].includes(child.hasString!), true)
            }
        })
    })


    describe("Recursion Mapping", async () => {
        it("get recursive wrapped term", () => {
            assert.equal(parent.term.equals(parent.hasRecursive.hasRecursive.hasRecursive.term), true)
        })

        it("set recursive property", () => {
            assert.equal(parent.dataset.size, 22)
            parent.hasRecursive = undefined
            assert.equal(parent.dataset.size, 21)
            // TODO: check for typed error singular no value
            assert.throws(() => parent.hasRecursive)
            parent.hasRecursive = "x"
            assert.equal(parent.hasRecursive.hasRecursive.hasRecursive.term.value, "x")
        })

        // TODO: test recursion in wrapping set
    })
})
