import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';
import { ContainerMixin } from './Container.js';

export interface Forum<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sioc.Container<D>, rdfine.RdfResource<D> {
  'has_moderator': Sioc.UserAccount<D> | undefined;
  'num_threads': number | undefined;
}

export function ForumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Forum & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class ForumClass extends ContainerMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    'has_moderator': Sioc.UserAccount | undefined;
    @rdfine.property.literal({ type: Number })
    'num_threads': number | undefined;
  }
  return ForumClass as any
}
ForumMixin.appliesTo = sioc.Forum
ForumMixin.createFactory = (env: RdfineEnvironment) => createFactory<Forum>([ContainerMixin, ForumMixin], { types: [sioc.Forum] }, env)
