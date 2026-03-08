import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LandformMixin } from './Landform.js';

export interface Volcano<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Landform<D>, rdfine.RdfResource<D> {
}

export function VolcanoMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Volcano & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VolcanoClass extends LandformMixin(Resource) {
  }
  return VolcanoClass as any
}
VolcanoMixin.appliesTo = schema.Volcano
VolcanoMixin.createFactory = (env: RdfineEnvironment) => createFactory<Volcano>([LandformMixin, VolcanoMixin], { types: [schema.Volcano] }, env)
