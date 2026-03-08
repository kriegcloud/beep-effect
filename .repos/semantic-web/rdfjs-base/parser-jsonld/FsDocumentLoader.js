import { readFile } from 'fs/promises'

class FsDocumentLoader {
  constructor (map) {
    const entries = (map.entries && map.entries()) || Object.entries(map)
    this.map = new Map([...entries])
  }

  async load (url) {
    const path = this.map.get(url)

    if (!path) {
      throw new Error(`unknown context url: ${url}`)
    }

    const content = (await readFile(path)).toString()

    return JSON.parse(content)
  }
}

export default FsDocumentLoader
