import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceOfWorshipMixin } from './PlaceOfWorship.js';

export interface HinduTemple<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlaceOfWorship<D>, rdfine.RdfResource<D> {
}

export function HinduTempleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HinduTemple & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HinduTempleClass extends PlaceOfWorshipMixin(Resource) {
  }
  return HinduTempleClass as any
}
HinduTempleMixin.appliesTo = schema.HinduTemple
HinduTempleMixin.createFactory = (env: RdfineEnvironment) => createFactory<HinduTemple>([PlaceOfWorshipMixin, HinduTempleMixin], { types: [schema.HinduTemple] }, env)
