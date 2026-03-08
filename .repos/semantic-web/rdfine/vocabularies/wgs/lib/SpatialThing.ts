import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { wgs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Wgs from '../index.js';

export interface SpatialThing<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  alt: number | undefined;
  lat: number | undefined;
  long: number | undefined;
}

export function SpatialThingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SpatialThing & RdfResourceCore> & Base {
  @rdfine.namespace(wgs)
  class SpatialThingClass extends Resource {
    @rdfine.property.literal({ type: Number })
    alt: number | undefined;
    @rdfine.property.literal({ type: Number })
    lat: number | undefined;
    @rdfine.property.literal({ type: Number })
    long: number | undefined;
  }
  return SpatialThingClass as any
}
SpatialThingMixin.appliesTo = wgs.SpatialThing
SpatialThingMixin.createFactory = (env: RdfineEnvironment) => createFactory<SpatialThing>([SpatialThingMixin], { types: [wgs.SpatialThing] }, env)
