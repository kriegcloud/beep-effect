import { describe, it } from "node:test"
import { DataFactory } from "n3"
import { datasetFromRdf } from "./util/datasetFromRdf.js"
import { ObjectMapping, TermMapping, TermWrapper, ValueMapping } from "rdfjs-wrapper"
import assert from "node:assert"

class Wrapper extends TermWrapper {
    public get list(): string[] {
        return this.singular("p", ObjectMapping.asList(this, "p", ValueMapping.literalToString, TermMapping.stringToLiteral))
    }
}

describe("RDF List", () => {
    describe("not implemented", () => {
        it("copyWithin", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.copyWithin(undefined!, undefined!)
            }, /^Error: not implemented$/)
        })

        it("fill", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.fill(undefined!)
            }, /^Error: not implemented$/)
        })

        it("flat", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.flat()
            }, /^Error: not implemented$/)
        })

        it("reverse", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.reverse()
            }, /^Error: not implemented$/)
        })

        it("sort", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.sort()
            }, /^Error: not implemented$/)
        })

        it("splice", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                wrapper.list.splice(undefined!)
            }, /^Error: not implemented$/)
        })
    })

    describe("general", () => {
        it("not list", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.deepStrictEqual([...wrapper.list], [])
        })

        it("empty", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.deepStrictEqual([...wrapper.list], [])
        })

        it("one item", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.deepStrictEqual([...wrapper.list], ["o1"])
        })

        it("two items", () => {
            const rdf = `<s> <p> ( "o1" "o2" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.deepStrictEqual([...wrapper.list], ["o1", "o2"])
        })

        it("[Symbol.unscopables]", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.deepStrictEqual(wrapper.list[Symbol.unscopables], [][Symbol.unscopables])
        })
    })

    describe("length", () => {
        it("not list is zero", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.strictEqual(wrapper.list.length, 0)
        })

        it("empty is zero", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.strictEqual(wrapper.list.length, 0)
        })

        it("one is one", () => {
            const rdf = `<s> <p> ( "o" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.strictEqual(wrapper.list.length, 1)
        })

        it("set not supported", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => wrapper.list.length = undefined!)
        })
    })

    describe("pop", () => {
        it("not list undefined", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const actual = wrapper.list.pop()

            assert.strictEqual(actual, undefined)
            assert.deepStrictEqual([...wrapper.list], [])
        })

        it("empty undefined", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const actual = wrapper.list.pop()

            assert.strictEqual(actual, undefined)
        })

        it("one returns last", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const actual = wrapper.list.pop()

            assert.strictEqual(actual, "o1")
        })

        it("one removes last", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)
            wrapper.list.pop()

            assert.deepStrictEqual([...wrapper.list], [])
        })

        it("two returns last", () => {
            const rdf = `<s> <p> ( "o1" "o2" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)
            const popped = wrapper.list.pop()

            assert.strictEqual(popped, "o2")
        })

        it("two removes last", () => {
            const rdf = `<s> <p> ( "o1" "o2" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)
            wrapper.list.pop()

            assert.deepStrictEqual([...wrapper.list], ["o1"])
        })
    })

    describe("push", () => {
        it("not list", {skip: "not implemented yet"}, () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.push("o1")
        })

        it("empty returns new length", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const pushed = wrapper.list.push("o1")

            assert.strictEqual(pushed, 1)
        })

        it("empty grows", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.push("o1")

            assert.deepStrictEqual([...wrapper.list], ["o1"])
        })

        it("one returns new length", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const pushed = wrapper.list.push("o2")

            assert.strictEqual(pushed, 2)
        })

        it("two returns new length", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const pushed = wrapper.list.push("o2", "o3")

            assert.strictEqual(pushed, 3)
        })

        it("one grows", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.push("o2")

            assert.deepStrictEqual([...wrapper.list], ["o1", "o2"])
        })

        it("two returns two", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.push("o2", "o3")

            assert.deepStrictEqual([...wrapper.list], ["o1", "o2", "o3"])
        })
    })

    describe("shift", () => {
        it("not list", {skip: "not implemented yet"}, () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.shift()
        })

        it("empty undefined", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const shifted = wrapper.list.shift()

            assert.strictEqual(shifted, undefined)
        })

        it("one returns first", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const shifted = wrapper.list.shift()

            assert.strictEqual(shifted, "o1")
        })

        it("one shrinks", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.shift()

            assert.deepStrictEqual([...wrapper.list], [])
        })

        it("two returns first", () => {
            const rdf = `<s> <p> ( "o1" "o2" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const shifted = wrapper.list.shift()

            assert.strictEqual(shifted, "o1")
        })

        it("two shrinks", () => {
            const rdf = `<s> <p> ( "o1" "o2" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.shift()

            assert.deepStrictEqual([...wrapper.list], ["o2"])
        })
    })

    describe("unshift", () => {
        it("not list throws", {skip: "not implemented yet"}, () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                return wrapper.list.unshift("o1");
            })
        })

        it("empty returns new length", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const unshifted = wrapper.list.unshift("o1")

            assert.strictEqual(unshifted, 1)
        })

        it("empty grows", () => {
            const rdf = `<s> <p> () .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.unshift("o1")

            assert.deepStrictEqual([...wrapper.list], ["o1"])
        })

        it("one returns new length", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const unshifted = wrapper.list.unshift("o2")

            assert.strictEqual(unshifted, 2)
        })

        it("two returns new length", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            const unshifted = wrapper.list.unshift("o2", "o3")

            assert.strictEqual(unshifted, 3)
        })

        it("one grows", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.unshift("o2")

            assert.deepStrictEqual([...wrapper.list], ["o2", "o1"])
        })

        it("two grows", () => {
            const rdf = `<s> <p> ( "o1" ) .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            wrapper.list.unshift("o2", "o3")

            assert.deepStrictEqual([...wrapper.list], ["o2", "o3", "o1"])
        })
    })
})
