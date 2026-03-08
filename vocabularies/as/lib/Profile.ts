import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Profile<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
  describes: As.Object<D> | undefined;
}

export function ProfileMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Profile & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ProfileClass extends ObjectMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [as.Object] })
    describes: As.Object | undefined;
  }
  return ProfileClass as any
}
ProfileMixin.appliesTo = as.Profile
ProfileMixin.createFactory = (env: RdfineEnvironment) => createFactory<Profile>([ObjectMixin, ProfileMixin], { types: [as.Profile] }, env)
