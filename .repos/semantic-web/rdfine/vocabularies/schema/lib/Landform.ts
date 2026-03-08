import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface Landform<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
}

export function LandformMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Landform & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LandformClass extends PlaceMixin(Resource) {
  }
  return LandformClass as any
}
LandformMixin.appliesTo = schema.Landform
LandformMixin.createFactory = (env: RdfineEnvironment) => createFactory<Landform>([PlaceMixin, LandformMixin], { types: [schema.Landform] }, env)
