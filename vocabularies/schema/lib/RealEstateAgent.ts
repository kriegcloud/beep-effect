import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface RealEstateAgent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function RealEstateAgentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RealEstateAgent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RealEstateAgentClass extends LocalBusinessMixin(Resource) {
  }
  return RealEstateAgentClass as any
}
RealEstateAgentMixin.appliesTo = schema.RealEstateAgent
RealEstateAgentMixin.createFactory = (env: RdfineEnvironment) => createFactory<RealEstateAgent>([LocalBusinessMixin, RealEstateAgentMixin], { types: [schema.RealEstateAgent] }, env)
