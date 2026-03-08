import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { wgs } from '@tpluscode/rdf-ns-builders';
import { foaf } from '../../lib/namespace.js';
import type * as Foaf from '../../index.js';
import type * as Wgs from '@rdfine/wgs';
import { SpatialThingMixin as WgsSpatialThingMixin } from '@rdfine/wgs/lib/SpatialThing';

interface SpatialThingEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  'based_near': Wgs.SpatialThing<D> | undefined;
}

declare module '@rdfine/wgs/lib/SpatialThing' {
  interface SpatialThing<D extends RDF.DatasetCore> extends SpatialThingEx<D> {
  }
}

export function SpatialThingMixinEx<Base extends rdfine.ExtendingConstructor<Wgs.SpatialThing, SpatialThingEx>>(Resource: Base): rdfine.Constructor<SpatialThingEx & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class Impl extends Resource implements SpatialThingEx {
    @rdfine.property.resource({ as: [WgsSpatialThingMixin] })
    'based_near': Wgs.SpatialThing | undefined;
  }
  return Impl
}
SpatialThingMixinEx.appliesTo = wgs.SpatialThing
