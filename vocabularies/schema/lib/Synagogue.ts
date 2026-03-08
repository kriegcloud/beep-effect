import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceOfWorshipMixin } from './PlaceOfWorship.js';

export interface Synagogue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlaceOfWorship<D>, rdfine.RdfResource<D> {
}

export function SynagogueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Synagogue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SynagogueClass extends PlaceOfWorshipMixin(Resource) {
  }
  return SynagogueClass as any
}
SynagogueMixin.appliesTo = schema.Synagogue
SynagogueMixin.createFactory = (env: RdfineEnvironment) => createFactory<Synagogue>([PlaceOfWorshipMixin, SynagogueMixin], { types: [schema.Synagogue] }, env)
