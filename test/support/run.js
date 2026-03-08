import { writeFile } from 'fs/promises'
import rdf from '@rdfjs/data-model'
import tmp from 'tmp'

async function load (code) {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix: '.mjs' }, async (err, path, fd, callback) => {
      if (err) {
        return reject(err)
      }

      try {
        await writeFile(path, code)
        const result = await import(path)
        callback()

        resolve(result)
      } catch (err) {
        callback()

        reject(err)
      }
    })
  })
}

async function run (code, { factory = rdf } = {}) {
  const result = await load(code)

  return result.default({ factory })
}

export {
  load,
  run as default
}
