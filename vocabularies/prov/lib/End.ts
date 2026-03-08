import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityInfluenceMixin } from './EntityInfluence.js';
import { InstantaneousEventMixin } from './InstantaneousEvent.js';

export interface End<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.EntityInfluence<D>, Prov.InstantaneousEvent<D>, rdfine.RdfResource<D> {
  hadActivity: Prov.Activity<D> | undefined;
}

export function EndMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<End & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class EndClass extends InstantaneousEventMixin(EntityInfluenceMixin(Resource)) {
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    hadActivity: Prov.Activity | undefined;
  }
  return EndClass as any
}
EndMixin.appliesTo = prov.End
EndMixin.createFactory = (env: RdfineEnvironment) => createFactory<End>([InstantaneousEventMixin, EntityInfluenceMixin, EndMixin], { types: [prov.End] }, env)
