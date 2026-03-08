import { deepStrictEqual } from 'assert'
import toNT from '@rdfjs/to-ntriples'
import fromFile from 'rdf-utils-fs/fromFile.js'
import chunks from 'stream-chunks/chunks.js'
import Tree from '../../index.js'

function termSetToString (termSet) {
  if (!termSet) {
    return ''
  }

  return [...termSet]
    .map(term => term.termType === 'BlankNode' ? '_:' : toNT(term))
    .sort()
    .join(' ')
}

function termString (term) {
  if (term.termType === 'BlankNode') {
    return ''
  }

  return toNT(term)
}

async function testTree (basename, expected) {
  const quads = await chunks(fromFile(`test/assets/${basename}.ttl`))
  const tree = new Tree(quads)

  deepStrictEqual(treeToJson(tree), expected)
}

function treeToJson (tree) {
  const subjects = [...tree.subjects.values()]
    .map(subject => {
      return {
        term: termString(subject.term),
        predicates: termSetToString(subject.predicates.keys()),
        lists: [...subject.predicates.values()]
          .filter(p => p.lists.size)
          .map(p => `${termString(p.term)} ${termSetToString(p.lists)}`)
          .join(','),
        items: (subject.items || []).map(node => termString(node.item.term)).join(' '),
        isListValue: subject.isListValue
      }
    })
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

  const objects = [...tree.objects.values()]
    .map(object => {
      return {
        term: termString(object.term)
      }
    })
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

  return {
    subjects,
    objects
  }
}

export {
  testTree
}
