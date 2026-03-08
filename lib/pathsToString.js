import toNT from '@rdfjs/to-ntriples'

function pathToString (path) {
  if (!path) {
    return '{}'
  }

  return `{${[...path.quads()].map(quad => toNT(quad)).join(' ')}}`
}

function pathsToString (paths) {
  if (!paths) {
    return '{}'
  }

  return `{${paths.map(path => pathToString(path)).join(' ')}}`
}

export default pathsToString
