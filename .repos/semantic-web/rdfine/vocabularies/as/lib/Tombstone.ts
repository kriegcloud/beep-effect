import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Tombstone<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  deleted: Date | undefined;
  formerType: As.Object<D> | undefined;
}

export function TombstoneMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Tombstone & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class TombstoneClass extends ObjectMixin(Resource) {
    @rdfine.property.literal({ type: Date })
    deleted: Date | undefined;
    @rdfine.property.resource({ implicitTypes: [as.Object] })
    formerType: As.Object | undefined;
  }
  return TombstoneClass as any
}
TombstoneMixin.appliesTo = as.Tombstone
TombstoneMixin.createFactory = (env: RdfineEnvironment) => createFactory<Tombstone>([ObjectMixin, TombstoneMixin], { types: [as.Tombstone] }, env)
