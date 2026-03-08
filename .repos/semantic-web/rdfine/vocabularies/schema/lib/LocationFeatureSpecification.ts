import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PropertyValueMixin } from './PropertyValue.js';

export interface LocationFeatureSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PropertyValue<D>, rdfine.RdfResource<D> {
  hoursAvailable: Schema.OpeningHoursSpecification<D> | undefined;
  validFrom: Date | undefined;
  validThrough: Date | undefined;
}

export function LocationFeatureSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LocationFeatureSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LocationFeatureSpecificationClass extends PropertyValueMixin(Resource) {
    @rdfine.property.resource()
    hoursAvailable: Schema.OpeningHoursSpecification | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validFrom: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validThrough: Date | undefined;
  }
  return LocationFeatureSpecificationClass as any
}
LocationFeatureSpecificationMixin.appliesTo = schema.LocationFeatureSpecification
LocationFeatureSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<LocationFeatureSpecification>([PropertyValueMixin, LocationFeatureSpecificationMixin], { types: [schema.LocationFeatureSpecification] }, env)
