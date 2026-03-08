import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Map<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  mapType: Schema.MapCategoryType | undefined;
}

export function MapMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Map & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MapClass extends CreativeWorkMixin(Resource) {
    @rdfine.property()
    mapType: Schema.MapCategoryType | undefined;
  }
  return MapClass as any
}
MapMixin.appliesTo = schema.Map
MapMixin.createFactory = (env: RdfineEnvironment) => createFactory<Map>([CreativeWorkMixin, MapMixin], { types: [schema.Map] }, env)
