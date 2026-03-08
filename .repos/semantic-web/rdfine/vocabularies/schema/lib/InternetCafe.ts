import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface InternetCafe<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function InternetCafeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InternetCafe & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InternetCafeClass extends LocalBusinessMixin(Resource) {
  }
  return InternetCafeClass as any
}
InternetCafeMixin.appliesTo = schema.InternetCafe
InternetCafeMixin.createFactory = (env: RdfineEnvironment) => createFactory<InternetCafe>([LocalBusinessMixin, InternetCafeMixin], { types: [schema.InternetCafe] }, env)
