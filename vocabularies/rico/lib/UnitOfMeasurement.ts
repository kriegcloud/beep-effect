import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ConceptMixin } from './Concept.js';

export interface UnitOfMeasurement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Concept<D>, rdfine.RdfResource<D> {
  isUnitOfMeasurementOf: Rico.Extent<D> | undefined;
}

export function UnitOfMeasurementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UnitOfMeasurement & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class UnitOfMeasurementClass extends ConceptMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Extent] })
    isUnitOfMeasurementOf: Rico.Extent | undefined;
  }
  return UnitOfMeasurementClass as any
}
UnitOfMeasurementMixin.appliesTo = rico.UnitOfMeasurement
UnitOfMeasurementMixin.createFactory = (env: RdfineEnvironment) => createFactory<UnitOfMeasurement>([ConceptMixin, UnitOfMeasurementMixin], { types: [rico.UnitOfMeasurement] }, env)
