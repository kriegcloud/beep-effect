import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface HomeAndConstructionBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function HomeAndConstructionBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HomeAndConstructionBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HomeAndConstructionBusinessClass extends LocalBusinessMixin(Resource) {
  }
  return HomeAndConstructionBusinessClass as any
}
HomeAndConstructionBusinessMixin.appliesTo = schema.HomeAndConstructionBusiness
HomeAndConstructionBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<HomeAndConstructionBusiness>([LocalBusinessMixin, HomeAndConstructionBusinessMixin], { types: [schema.HomeAndConstructionBusiness] }, env)
