import type DefaultEnv from '@zazuko/env/web.js'
import type { DerivedEnvironment } from '@zazuko/env'
import type { Environment } from '@rdfjs/environment/Environment.js'
import RdfResourceImpl from './RdfResource.js'
import ResourceFactoryImpl, { Constructor, ResourceFactory } from './lib/ResourceFactory.js'
import type { Factory } from './factory.js'
import { toLiteral, fromLiteral, ToLiteral, FromLiteral } from './lib/conversion.js'

type Name<T> = T extends `${infer Prefix}Mixin` ? Prefix : never;
export type Vocabulary<T> = {
  [p in keyof T as Name<p>]: T[p] extends (...args: any) => any
    ? ReturnType<T[p]> extends Constructor<infer I>
      ? Factory<I>
      : never
    : never
}

export interface Rdfine {
  (): {
    createEntity: ResourceFactory['createEntity']
    factory: ResourceFactory
    convert: {
      toLiteral: ToLiteral
      fromLiteral: FromLiteral
    }
  }
  Resource: Constructor
}

export interface RdfineFactory {
  rdfine: Rdfine
}

export class RdfineFactory {
  init(this: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const env = this

    class Base extends RdfResourceImpl {
      static get env() {
        return env
      }
    }

    // eslint-disable-next-line prefer-const
    let factory: ResourceFactory
    this.rdfine = () => ({
      factory,
      createEntity: factory.createEntity.bind(factory),
      convert: {
        toLiteral: toLiteral.bind(null, env),
        fromLiteral: fromLiteral.bind(null, env),
      },
    })
    this.rdfine.Resource = Base
    factory = new ResourceFactoryImpl(env)
  }

  static get exports() {
    return ['_initVocabulary']
  }

  _initVocabulary(vocabulary: Record<string, any>) {
    this.rdfine().factory.addMixin(...Object.values(vocabulary))

    return Object.fromEntries(Object.entries(vocabulary).reduce((previous, [name, mixin]) => {
      if ('createFactory' in mixin) {
        return [...previous, [name.replace(/Mixin$/, ''), mixin.createFactory(this)]]
      }

      return previous
    }, [] as Array<[string, any]>)) as any
  }
}

export type RdfineEnvironment = DerivedEnvironment<typeof DefaultEnv, Environment<RdfineFactory>>
