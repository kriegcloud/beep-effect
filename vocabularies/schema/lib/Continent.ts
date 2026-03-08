import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LandformMixin } from './Landform.js';

export interface Continent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Landform<D>, rdfine.RdfResource<D> {
}

export function ContinentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Continent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ContinentClass extends LandformMixin(Resource) {
  }
  return ContinentClass as any
}
ContinentMixin.appliesTo = schema.Continent
ContinentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Continent>([LandformMixin, ContinentMixin], { types: [schema.Continent] }, env)
