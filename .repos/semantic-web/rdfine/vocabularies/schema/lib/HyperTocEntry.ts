import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface HyperTocEntry<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  associatedMedia: Schema.MediaObject<D> | undefined;
  tocContinuation: Schema.HyperTocEntry<D> | undefined;
  utterances: string | undefined;
}

export function HyperTocEntryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HyperTocEntry & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HyperTocEntryClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    associatedMedia: Schema.MediaObject | undefined;
    @rdfine.property.resource()
    tocContinuation: Schema.HyperTocEntry | undefined;
    @rdfine.property.literal()
    utterances: string | undefined;
  }
  return HyperTocEntryClass as any
}
HyperTocEntryMixin.appliesTo = schema.HyperTocEntry
HyperTocEntryMixin.createFactory = (env: RdfineEnvironment) => createFactory<HyperTocEntry>([CreativeWorkMixin, HyperTocEntryMixin], { types: [schema.HyperTocEntry] }, env)
