import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ExtentMixin } from './Extent.js';

export interface CarrierExtent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Extent<D>, rdfine.RdfResource<D> {
}

export function CarrierExtentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CarrierExtent & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CarrierExtentClass extends ExtentMixin(Resource) {
  }
  return CarrierExtentClass as any
}
CarrierExtentMixin.appliesTo = rico.CarrierExtent
CarrierExtentMixin.createFactory = (env: RdfineEnvironment) => createFactory<CarrierExtent>([ExtentMixin, CarrierExtentMixin], { types: [rico.CarrierExtent] }, env)
