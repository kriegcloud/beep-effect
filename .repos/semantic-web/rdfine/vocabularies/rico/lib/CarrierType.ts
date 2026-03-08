import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface CarrierType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isCarrierTypeOf: Rico.Instantiation<D> | undefined;
}

export function CarrierTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CarrierType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CarrierTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    isCarrierTypeOf: Rico.Instantiation | undefined;
  }
  return CarrierTypeClass as any
}
CarrierTypeMixin.appliesTo = rico.CarrierType
CarrierTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<CarrierType>([TypeMixin, CarrierTypeMixin], { types: [rico.CarrierType] }, env)
