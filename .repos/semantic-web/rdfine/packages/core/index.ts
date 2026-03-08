import RdfResourceImpl from './RdfResource.js'

export { crossBoundaries } from './lib/path.js'
export type { Constructor, ExtendingConstructor, ResourceIndexer } from './lib/ResourceFactory.js'
export { default as ResourceFactory } from './lib/ResourceFactory.js'
export type { RdfResource, ResourceIdentifier } from './RdfResource.js'
export * from './lib/decorators/index.js'
export default RdfResourceImpl

export { RdfineFactory } from './environment.js'
