import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { wgs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Wgs from '../index.js';
import { SpatialThingMixin } from './SpatialThing.js';

export interface Point<D extends RDF.DatasetCore = RDF.DatasetCore> extends Wgs.SpatialThing<D>, rdfine.RdfResource<D> {
}

export function PointMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Point & RdfResourceCore> & Base {
  @rdfine.namespace(wgs)
  class PointClass extends SpatialThingMixin(Resource) {
  }
  return PointClass as any
}
PointMixin.appliesTo = wgs.Point
PointMixin.createFactory = (env: RdfineEnvironment) => createFactory<Point>([SpatialThingMixin, PointMixin], { types: [wgs.Point] }, env)
