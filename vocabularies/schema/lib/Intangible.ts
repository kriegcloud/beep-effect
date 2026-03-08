import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Intangible<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
}

export function IntangibleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Intangible & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class IntangibleClass extends ThingMixin(Resource) {
  }
  return IntangibleClass as any
}
IntangibleMixin.appliesTo = schema.Intangible
IntangibleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Intangible>([ThingMixin, IntangibleMixin], { types: [schema.Intangible] }, env)
