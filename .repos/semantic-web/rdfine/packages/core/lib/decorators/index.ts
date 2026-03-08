import type { RdfResource } from '../../RdfResource.js'
import type { Constructor } from '../ResourceFactory.js'

// From the TC39 Decorators proposal
export interface ClassElement {
  kind: 'field'|'method'
  key: PropertyKey
  placement: 'static'|'prototype'|'own'
  // eslint-disable-next-line @typescript-eslint/ban-types
  initializer?: Function
  extras?: ClassElement[]
  finisher?: <T extends RdfResource>(clazz: Constructor<T>) => undefined | Constructor<T>
  descriptor?: PropertyDescriptor
}

// From the TC39 Decorators proposal
export interface ClassDescriptor {
  kind: 'class'
  elements: ClassElement[]
  finisher?: <T extends RdfResource>(clazz: Constructor<T>) => undefined | Constructor<T>
}

export { namespace } from './namespace.js'
export { property } from './property/index.js'
