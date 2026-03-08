import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Coordinates<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  altimetricSystem: RDF.Literal | undefined;
  altitude: RDF.Literal | undefined;
  geodesicSystem: RDF.Literal | undefined;
  isOrWasCoordinatesOf: Rico.PhysicalLocation<D> | undefined;
  latitude: RDF.Literal | undefined;
  longitude: RDF.Literal | undefined;
}

export function CoordinatesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Coordinates & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CoordinatesClass extends ThingMixin(Resource) {
    @rdfine.property()
    altimetricSystem: RDF.Literal | undefined;
    @rdfine.property()
    altitude: RDF.Literal | undefined;
    @rdfine.property()
    geodesicSystem: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.PhysicalLocation] })
    isOrWasCoordinatesOf: Rico.PhysicalLocation | undefined;
    @rdfine.property()
    latitude: RDF.Literal | undefined;
    @rdfine.property()
    longitude: RDF.Literal | undefined;
  }
  return CoordinatesClass as any
}
CoordinatesMixin.appliesTo = rico.Coordinates
CoordinatesMixin.createFactory = (env: RdfineEnvironment) => createFactory<Coordinates>([ThingMixin, CoordinatesMixin], { types: [rico.Coordinates] }, env)
