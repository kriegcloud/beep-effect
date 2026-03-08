import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Guide<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  reviewAspect: string | undefined;
}

export function GuideMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Guide & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GuideClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    reviewAspect: string | undefined;
  }
  return GuideClass as any
}
GuideMixin.appliesTo = schema.Guide
GuideMixin.createFactory = (env: RdfineEnvironment) => createFactory<Guide>([CreativeWorkMixin, GuideMixin], { types: [schema.Guide] }, env)
