import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LandformMixin } from './Landform.js';

export interface Mountain<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Landform<D>, rdfine.RdfResource<D> {
}

export function MountainMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Mountain & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MountainClass extends LandformMixin(Resource) {
  }
  return MountainClass as any
}
MountainMixin.appliesTo = schema.Mountain
MountainMixin.createFactory = (env: RdfineEnvironment) => createFactory<Mountain>([LandformMixin, MountainMixin], { types: [schema.Mountain] }, env)
