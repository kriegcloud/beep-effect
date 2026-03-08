import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface HVACBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function HVACBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HVACBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HVACBusinessClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return HVACBusinessClass as any
}
HVACBusinessMixin.appliesTo = schema.HVACBusiness
HVACBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<HVACBusiness>([HomeAndConstructionBusinessMixin, HVACBusinessMixin], { types: [schema.HVACBusiness] }, env)
