import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';
import type * as Foaf from '@rdfine/foaf';
import { OnlineAccountMixin as FoafOnlineAccountMixin } from '@rdfine/foaf/lib/OnlineAccount';
import { AgentMixin as FoafAgentMixin } from '@rdfine/foaf/lib/Agent';

export interface UserAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.OnlineAccount<D>, rdfine.RdfResource<D> {
  'account_of': Foaf.Agent<D> | undefined;
  'administrator_of': Sioc.Site<D> | undefined;
  avatar: RDF.Term | undefined;
  'creator_of': RDF.Term | undefined;
  email: RDF.Term | undefined;
  'email_sha1': RDF.Literal | undefined;
  'first_name': RDF.Literal | undefined;
  follows: Sioc.UserAccount<D> | undefined;
  'last_name': RDF.Literal | undefined;
  'member_of': Sioc.Usergroup<D> | undefined;
  'moderator_of': Sioc.Forum<D> | undefined;
  'modifier_of': RDF.Term | undefined;
  'owner_of': RDF.Term | undefined;
  'subscriber_of': Sioc.Container<D> | undefined;
}

export function UserAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserAccount & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class UserAccountClass extends FoafOnlineAccountMixin(Resource) {
    @rdfine.property.resource({ as: [FoafAgentMixin] })
    'account_of': Foaf.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Site] })
    'administrator_of': Sioc.Site | undefined;
    @rdfine.property()
    avatar: RDF.Term | undefined;
    @rdfine.property()
    'creator_of': RDF.Term | undefined;
    @rdfine.property()
    email: RDF.Term | undefined;
    @rdfine.property()
    'email_sha1': RDF.Literal | undefined;
    @rdfine.property()
    'first_name': RDF.Literal | undefined;
    @rdfine.property.resource({ as: [UserAccountMixin] })
    follows: Sioc.UserAccount | undefined;
    @rdfine.property()
    'last_name': RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Usergroup] })
    'member_of': Sioc.Usergroup | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Forum] })
    'moderator_of': Sioc.Forum | undefined;
    @rdfine.property()
    'modifier_of': RDF.Term | undefined;
    @rdfine.property()
    'owner_of': RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Container] })
    'subscriber_of': Sioc.Container | undefined;
  }
  return UserAccountClass as any
}
UserAccountMixin.appliesTo = sioc.UserAccount
UserAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserAccount>([FoafOnlineAccountMixin, UserAccountMixin], { types: [sioc.UserAccount] }, env)
