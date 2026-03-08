import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Usergroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'has_member': Sioc.UserAccount<D> | undefined;
  'usergroup_of': Sioc.Space<D> | undefined;
}

export function UsergroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Usergroup & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class UsergroupClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    'has_member': Sioc.UserAccount | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Space] })
    'usergroup_of': Sioc.Space | undefined;
  }
  return UsergroupClass as any
}
UsergroupMixin.appliesTo = sioc.Usergroup
UsergroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<Usergroup>([UsergroupMixin], { types: [sioc.Usergroup] }, env)
