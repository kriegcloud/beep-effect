import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface RecyclingCenter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function RecyclingCenterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecyclingCenter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RecyclingCenterClass extends LocalBusinessMixin(Resource) {
  }
  return RecyclingCenterClass as any
}
RecyclingCenterMixin.appliesTo = schema.RecyclingCenter
RecyclingCenterMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecyclingCenter>([LocalBusinessMixin, RecyclingCenterMixin], { types: [schema.RecyclingCenter] }, env)
