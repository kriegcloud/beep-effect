import TermMap from '@rdfjs/term-map'

class TargetResolverRegistry {
  constructor (targetResolvers) {
    this.targetResolvers = new TermMap(targetResolvers)
  }
}

export default TargetResolverRegistry
