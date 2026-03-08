import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface Festival<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function FestivalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Festival & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FestivalClass extends EventMixin(Resource) {
  }
  return FestivalClass as any
}
FestivalMixin.appliesTo = schema.Festival
FestivalMixin.createFactory = (env: RdfineEnvironment) => createFactory<Festival>([EventMixin, FestivalMixin], { types: [schema.Festival] }, env)
