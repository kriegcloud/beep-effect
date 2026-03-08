import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface PublicSwimmingPool<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function PublicSwimmingPoolMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PublicSwimmingPool & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PublicSwimmingPoolClass extends SportsActivityLocationMixin(Resource) {
  }
  return PublicSwimmingPoolClass as any
}
PublicSwimmingPoolMixin.appliesTo = schema.PublicSwimmingPool
PublicSwimmingPoolMixin.createFactory = (env: RdfineEnvironment) => createFactory<PublicSwimmingPool>([SportsActivityLocationMixin, PublicSwimmingPoolMixin], { types: [schema.PublicSwimmingPool] }, env)
