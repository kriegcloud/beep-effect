import TermMap from '@rdfjs/term-map'
import Parser from './Parser.js'

class Tree {
  constructor (quads) {
    this.nodes = new TermMap()
    this.objects = new TermMap()
    this.subjects = new TermMap()
    this.parser = new Parser(this)

    if (quads) {
      this.parser.parse(quads)
    }
  }
}

export default Tree
