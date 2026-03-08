import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { GeoShapeMixin } from './GeoShape.js';

export interface GeoCircle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.GeoShape<D>, rdfine.RdfResource<D> {
  geoMidpoint: Schema.GeoCoordinates<D> | undefined;
  geoRadius: Schema.Distance<D> | undefined;
  geoRadiusLiteral: number | string | undefined;
}

export function GeoCircleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GeoCircle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GeoCircleClass extends GeoShapeMixin(Resource) {
    @rdfine.property.resource()
    geoMidpoint: Schema.GeoCoordinates | undefined;
    @rdfine.property.resource()
    geoRadius: Schema.Distance | undefined;
    @rdfine.property.literal({ path: schema.geoRadius })
    geoRadiusLiteral: number | string | undefined;
  }
  return GeoCircleClass as any
}
GeoCircleMixin.appliesTo = schema.GeoCircle
GeoCircleMixin.createFactory = (env: RdfineEnvironment) => createFactory<GeoCircle>([GeoShapeMixin, GeoCircleMixin], { types: [schema.GeoCircle] }, env)
