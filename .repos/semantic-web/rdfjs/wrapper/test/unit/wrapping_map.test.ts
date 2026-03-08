import { describe, it } from "node:test"
import { TermWrapper } from "rdfjs-wrapper"
import { DataFactory, Literal } from "n3"
import { datasetFromRdf } from "./util/datasetFromRdf.js"
import assert from "node:assert"

class Wrapper extends TermWrapper {
    public get dict(): Map<string, string> {
        return this.map(
            "p",
            ({term}) => [
                (term as Literal).language,
                (term as Literal).value
            ],
            ([key, value], dataset, factory) =>
                new TermWrapper(factory.literal(value, key), dataset, factory)
        )
    }
}

describe("Wrapping map", () => {
    describe("size", () => {
        it("get", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@hu, "o3"@he .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.strictEqual(wrapper.dict.size, 3)
        })
        it("set not supported", () => {
            const rdf = `<s> <p> <o> .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.throws(() => {
                (wrapper.dict as any)["size"] = undefined!
            }, /^Error: not supported$/)
        })
    })

    describe("general", () => {
        it("get", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const wrapper = new Wrapper("s", datasetFromRdf(rdf), DataFactory)

            assert.strictEqual(wrapper.dict.get("en"), "o1")
            assert.strictEqual(wrapper.dict.get("fr"), "o2")
        })
        it("clear", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            wrapper.dict.clear()

            assert.strictEqual(dataset.size, 0)
        })
        it("delete reports positive", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            assert.strictEqual(wrapper.dict.delete("en"), true)
        })
        it("delete reports negative", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            assert.strictEqual(wrapper.dict.delete("XX"), false)
        })
        it("delete deletes", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            wrapper.dict.delete("en")

            assert.strictEqual(wrapper.dict.has("en"), false)
        })
        it("delete reports negative", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            wrapper.dict.delete("XX")

            assert.strictEqual(wrapper.dict.has("en"), true)
            assert.strictEqual(wrapper.dict.has("fr"), true)
        })
        it("forEach", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            const actual = {} as any
            wrapper.dict.forEach((value, key) => {
                actual[key] = value
            })

            assert.deepStrictEqual(actual, {en: "o1", fr: "o2"})
        })
        it("set", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            wrapper.dict.set("en", "ox")

            assert.deepStrictEqual(wrapper.dict.get("en"), "ox")
        })
        it("keys", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            assert.deepStrictEqual([...wrapper.dict.keys()], ["en", "fr"])
        })
        it("values", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            assert.deepStrictEqual([...wrapper.dict.values()], ["o1", "o2"])
        })
        it("toStringTag", () => {
            const rdf = `<s> <p> "o1"@en, "o2"@fr .`
            const dataset = datasetFromRdf(rdf)
            const wrapper = new Wrapper("s", dataset, DataFactory)

            assert.strictEqual(wrapper.dict.toString(), "[object WrappingMap]")
        })
    })
})
