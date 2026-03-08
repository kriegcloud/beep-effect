import TermMap from '@rdfjs/term-map'
import distinct from './distinct.js'
import sort from './sort.js'

function sortObjects ({
  dataset,
  objects,
  score,
  termCallback = object => object.term
} = {}) {
  const objectMap = new TermMap(objects.map(object => [termCallback(object), object]))
  const terms = objects.map(object => termCallback(object))
  const toSort = { dataset, terms }
  const sorted = sort(distinct(score(toSort)))
  const sortedObjects = sorted.map(({ term }) => objectMap.get(term))

  return sortedObjects
}

export default sortObjects
