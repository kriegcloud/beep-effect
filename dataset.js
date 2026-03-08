import { Readable } from 'readable-stream'
import { decode } from 'stream-chunks'
import checkResponse from './lib/checkResponse.js'
import createWriteOptions from './lib/createWriteOptions.js'

/**
 * Parse the given text with a parser matching the media type and return the quads in a dataset.
 * @param mediaType Media type that is used to look up the parser
 * @param text Text to parse
 * @param factory Factory that is used to find the parser and create the dataset
 * @param [args] Additional arguments for the parser
 * @returns {Promise<Dataset>} Parsed quads in a dataset
 */
async function fromText (mediaType, text, { factory, ...args }) {
  const parser = factory.formats.parsers.get(mediaType)

  if (!parser) {
    throw new Error(`unknown media type: ${mediaType}`)
  }

  const dataset = factory.dataset()
  const stream = parser.import(Readable.from([text]), args)

  for await (const quad of stream) {
    dataset.add(quad)
  }

  return dataset
}

/**
 * Parse the content of the given URL and return the quads in a dataset.
 * @param url URL to fetch the content from
 * @param factory Factory that is used to fetch the content and create the dataset
 * @param [mediaType] Media type that should be used, replacing the content-type header
 * @param [args] Additional arguments for the fetch request
 * @returns {Promise<Dataset>} Parsed quads in a dataset
 */
async function fromURL (url, { factory, mediaType, ...args }) {
  const res = await factory.fetch(url, { ...args, method: 'GET' })

  await checkResponse(url, {}, res)

  if (mediaType) {
    res.headers.set('content-type', mediaType)
  }

  return res.dataset()
}

/**
 * Serialize the given dataset to a text using a serializer matching the given media type.
 * @param mediaType Media type that is used to look up the serializer
 * @param dataset Dataset to serialize
 * @param factory Factory that is used to find the serializer
 * @param prefixes Map of prefixes for the serializer
 * @param [args] Additional arguments for the serializer
 * @returns {Promise<String>} String of the serialized quads
 */
async function toText (mediaType, dataset, { factory, prefixes, ...args }) {
  const serializer = factory.formats.serializers.get(mediaType)

  if (!serializer) {
    throw new Error(`unknown media type: ${mediaType}`)
  }

  const stream = serializer.import(Readable.from(dataset), { ...args, prefixes })

  return decode(stream, 'utf-8')
}

/**
 * Serialize the given dataset and push it to the given URL.
 * @param url URL to push the content to
 * @param dataset Dataset to serialize
 * @param factory Factory that is used to push the content
 * @param prefixes Map of prefixes for the serializer
 * @param [args] Additional arguments for the fetch request
 * @returns {Promise<void>}
 */
async function toURL (url, dataset, { factory, prefixes, ...args }) {
  const options = createWriteOptions(url, Readable.from(dataset))
  const res = await factory.fetch(url, { ...args, ...options, prefixes })

  await checkResponse(url, options, res)
}

export {
  fromText,
  fromURL,
  toText,
  toURL
}
