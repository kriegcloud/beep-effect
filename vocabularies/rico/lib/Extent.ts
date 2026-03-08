import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Extent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  hasExtentType: Rico.ExtentType<D> | undefined;
  hasUnitOfMeasurement: Rico.UnitOfMeasurement<D> | undefined;
  isExtentOf: Rico.Thing<D> | undefined;
  quantity: number | undefined;
  textualValue: RDF.Literal | undefined;
  unitOfMeasurement: RDF.Literal | undefined;
}

export function ExtentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Extent & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ExtentClass extends ThingMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.ExtentType] })
    hasExtentType: Rico.ExtentType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.UnitOfMeasurement] })
    hasUnitOfMeasurement: Rico.UnitOfMeasurement | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isExtentOf: Rico.Thing | undefined;
    @rdfine.property.literal({ type: Number })
    quantity: number | undefined;
    @rdfine.property()
    textualValue: RDF.Literal | undefined;
    @rdfine.property()
    unitOfMeasurement: RDF.Literal | undefined;
  }
  return ExtentClass as any
}
ExtentMixin.appliesTo = rico.Extent
ExtentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Extent>([ThingMixin, ExtentMixin], { types: [rico.Extent] }, env)
