import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface MovingCompany<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function MovingCompanyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MovingCompany & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MovingCompanyClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return MovingCompanyClass as any
}
MovingCompanyMixin.appliesTo = schema.MovingCompany
MovingCompanyMixin.createFactory = (env: RdfineEnvironment) => createFactory<MovingCompany>([HomeAndConstructionBusinessMixin, MovingCompanyMixin], { types: [schema.MovingCompany] }, env)
