import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface Plumber<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function PlumberMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Plumber & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlumberClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return PlumberClass as any
}
PlumberMixin.appliesTo = schema.Plumber
PlumberMixin.createFactory = (env: RdfineEnvironment) => createFactory<Plumber>([HomeAndConstructionBusinessMixin, PlumberMixin], { types: [schema.Plumber] }, env)
