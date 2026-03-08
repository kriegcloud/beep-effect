import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface ArchiveComponent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  holdingArchive: Schema.ArchiveOrganization<D> | undefined;
  itemLocation: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  itemLocationLiteral: string | undefined;
}

export function ArchiveComponentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ArchiveComponent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ArchiveComponentClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    holdingArchive: Schema.ArchiveOrganization | undefined;
    @rdfine.property.resource()
    itemLocation: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.itemLocation })
    itemLocationLiteral: string | undefined;
  }
  return ArchiveComponentClass as any
}
ArchiveComponentMixin.appliesTo = schema.ArchiveComponent
ArchiveComponentMixin.createFactory = (env: RdfineEnvironment) => createFactory<ArchiveComponent>([CreativeWorkMixin, ArchiveComponentMixin], { types: [schema.ArchiveComponent] }, env)
