import type { NamespaceBuilder } from '@rdfjs/namespace'
import type { Constructor } from '../ResourceFactory.js'
import type { RdfResourceCore } from '../../RdfResource.js'
import type { ClassDescriptor } from './index.js'

function setNamespace(clazz: Constructor, ns: NamespaceBuilder) {
  clazz.__ns = ns
}

const legacyNamespace =
  (ns: NamespaceBuilder, clazz: Constructor) => {
    setNamespace(clazz, ns)

    return clazz as any
  }

const standardNamespace =
  (ns: NamespaceBuilder, descriptor: ClassDescriptor) => {
    const { kind, elements } = descriptor
    return {
      kind,
      elements,
      // This callback is called once the class is otherwise fully defined
      finisher(clazz: Constructor) {
        setNamespace(clazz, ns)
      },
    }
  }

export const namespace = (stringOrNamespace: NamespaceBuilder) =>
  (classOrDescriptor: Constructor<RdfResourceCore<any>>|ClassDescriptor) =>
    (typeof classOrDescriptor === 'function')
      ? legacyNamespace(stringOrNamespace, classOrDescriptor)
      : standardNamespace(stringOrNamespace, classOrDescriptor)
