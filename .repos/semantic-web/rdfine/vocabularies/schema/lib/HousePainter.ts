import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface HousePainter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function HousePainterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HousePainter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HousePainterClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return HousePainterClass as any
}
HousePainterMixin.appliesTo = schema.HousePainter
HousePainterMixin.createFactory = (env: RdfineEnvironment) => createFactory<HousePainter>([HomeAndConstructionBusinessMixin, HousePainterMixin], { types: [schema.HousePainter] }, env)
