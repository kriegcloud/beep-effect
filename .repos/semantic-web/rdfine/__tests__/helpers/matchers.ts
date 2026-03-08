import { SourceFile } from 'ts-morph'
import Parser from '@rdfjs/parser-jsonld'
import toStream from 'string-to-stream'
import $rdf from '@zazuko/env'
import { Assertion, AssertionError } from 'chai'
// eslint-disable-next-line import/no-extraneous-dependencies
import { addSerializer } from 'jest-snapshot'
import { DatasetCore } from '@rdfjs/types'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import fromStream from 'rdf-dataset-ext/fromStream.js'

const parser = new Parser()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Chai {
    interface TypeComparison {
      validJsonLd(): void
    }
  }
}
Assertion.addMethod('validJsonLd', async function (this: Chai.AssertionStatic) {
  const received: string | Record<string, any> = this._obj

  const jsonld = typeof received === 'string' ? received : JSON.stringify(received)

  try {
    await fromStream($rdf.dataset(), parser.import(toStream(jsonld)))
  } catch (e: any) {
    throw new AssertionError(`Failed to parse JSON-LD: ${e.message}`)
  }
})

addSerializer({
  test(val) {
    return typeof val === 'object' && val && 'toCanonical' in val
  },
  serialize(val: DatasetCore) {
    return toCanonical(val)
  },
})

addSerializer({
  test(val) {
    return typeof val === 'object' && 'saveSync' in val
  },
  serialize(val: SourceFile) {
    val.saveSync()
    return val.getProject().getFileSystem().readFileSync(val.getFilePath())
  },
})
