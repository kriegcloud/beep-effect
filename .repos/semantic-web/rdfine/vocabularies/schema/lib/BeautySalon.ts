import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';

export interface BeautySalon<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, rdfine.RdfResource<D> {
}

export function BeautySalonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BeautySalon & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BeautySalonClass extends HealthAndBeautyBusinessMixin(Resource) {
  }
  return BeautySalonClass as any
}
BeautySalonMixin.appliesTo = schema.BeautySalon
BeautySalonMixin.createFactory = (env: RdfineEnvironment) => createFactory<BeautySalon>([HealthAndBeautyBusinessMixin, BeautySalonMixin], { types: [schema.BeautySalon] }, env)
