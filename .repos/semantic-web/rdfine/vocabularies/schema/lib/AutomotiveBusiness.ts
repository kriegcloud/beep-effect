import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface AutomotiveBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function AutomotiveBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutomotiveBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutomotiveBusinessClass extends LocalBusinessMixin(Resource) {
  }
  return AutomotiveBusinessClass as any
}
AutomotiveBusinessMixin.appliesTo = schema.AutomotiveBusiness
AutomotiveBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutomotiveBusiness>([LocalBusinessMixin, AutomotiveBusinessMixin], { types: [schema.AutomotiveBusiness] }, env)
