import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface Electrician<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function ElectricianMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Electrician & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ElectricianClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return ElectricianClass as any
}
ElectricianMixin.appliesTo = schema.Electrician
ElectricianMixin.createFactory = (env: RdfineEnvironment) => createFactory<Electrician>([HomeAndConstructionBusinessMixin, ElectricianMixin], { types: [schema.Electrician] }, env)
