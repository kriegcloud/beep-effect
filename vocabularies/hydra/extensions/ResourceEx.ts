import type { Constructor } from '@tpluscode/rdfine'
import { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import { hydra } from '@tpluscode/rdf-ns-builders'
import { namespace, property } from '@tpluscode/rdfine';
import type * as RDF from '@rdfjs/types';
import * as Hydra from '../index.js';

export interface ResourceEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  collection: Array<Hydra.Collection<Hydra.Resource<D>, D>>;
}

declare module '@rdfine/hydra' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Resource extends ResourceEx {
  }
}

export function ResourceExMixin<Base extends Constructor<Partial<Omit<Hydra.Resource, keyof ResourceEx>> & RdfResourceCore>>(base: Base): Constructor<RdfResourceCore & ResourceEx> & Base {
  @namespace(hydra)
  class ResourceExClass extends base implements ResourceEx {
    @property.resource({ values: 'array', implicitTypes: [hydra.Collection] })
    collection!: Array<Hydra.Collection<any, any>>;
  }

  return ResourceExClass
}

ResourceExMixin.appliesTo = hydra.Resource
