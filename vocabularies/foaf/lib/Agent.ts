import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';

export interface Agent<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  account: Foaf.OnlineAccount<D> | undefined;
  age: RDF.Literal | undefined;
  aimChatID: RDF.Literal | undefined;
  birthday: RDF.Literal | undefined;
  gender: RDF.Literal | undefined;
  holdsAccount: Foaf.OnlineAccount<D> | undefined;
  icqChatID: RDF.Literal | undefined;
  interest: Foaf.Document<D> | undefined;
  jabberID: RDF.Literal | undefined;
  made: RDF.NamedNode | undefined;
  mbox: RDF.NamedNode | undefined;
  'mbox_sha1sum': RDF.Literal | undefined;
  msnChatID: RDF.Literal | undefined;
  openid: Foaf.Document<D> | undefined;
  skypeID: RDF.Literal | undefined;
  status: RDF.Literal | undefined;
  tipjar: Foaf.Document<D> | undefined;
  'topic_interest': RDF.NamedNode | undefined;
  weblog: Foaf.Document<D> | undefined;
  yahooChatID: RDF.Literal | undefined;
}

export function AgentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Agent & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class AgentClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [foaf.OnlineAccount] })
    account: Foaf.OnlineAccount | undefined;
    @rdfine.property()
    age: RDF.Literal | undefined;
    @rdfine.property()
    aimChatID: RDF.Literal | undefined;
    @rdfine.property()
    birthday: RDF.Literal | undefined;
    @rdfine.property()
    gender: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.OnlineAccount] })
    holdsAccount: Foaf.OnlineAccount | undefined;
    @rdfine.property()
    icqChatID: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    interest: Foaf.Document | undefined;
    @rdfine.property()
    jabberID: RDF.Literal | undefined;
    @rdfine.property()
    made: RDF.NamedNode | undefined;
    @rdfine.property()
    mbox: RDF.NamedNode | undefined;
    @rdfine.property()
    'mbox_sha1sum': RDF.Literal | undefined;
    @rdfine.property()
    msnChatID: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    openid: Foaf.Document | undefined;
    @rdfine.property()
    skypeID: RDF.Literal | undefined;
    @rdfine.property()
    status: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    tipjar: Foaf.Document | undefined;
    @rdfine.property()
    'topic_interest': RDF.NamedNode | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    weblog: Foaf.Document | undefined;
    @rdfine.property()
    yahooChatID: RDF.Literal | undefined;
  }
  return AgentClass as any
}
AgentMixin.appliesTo = foaf.Agent
AgentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Agent>([AgentMixin], { types: [foaf.Agent] }, env)
