import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';

export interface Optician<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function OpticianMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Optician & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OpticianClass extends Resource {
  }
  return OpticianClass as any
}
OpticianMixin.appliesTo = schema.Optician
OpticianMixin.createFactory = (env: RdfineEnvironment) => createFactory<Optician>([OpticianMixin], { types: [schema.Optician] }, env)
