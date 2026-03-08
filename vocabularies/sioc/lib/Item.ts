import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Item<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  about: RDF.Term | undefined;
  'addressed_to': RDF.Term | undefined;
  attachment: RDF.Term | undefined;
  content: RDF.Literal | undefined;
  'delivered_at': RDF.Literal | undefined;
  'earlier_version': Sioc.Item<D> | undefined;
  'embeds_knowledge': RDF.Term | undefined;
  generator: RDF.Term | undefined;
  'has_container': Sioc.Container<D> | undefined;
  'has_discussion': RDF.Term | undefined;
  'has_reply': Sioc.Item<D> | undefined;
  'later_version': Sioc.Item<D> | undefined;
  'latest_version': Sioc.Item<D> | undefined;
  mentions: Sioc.UserAccount<D> | undefined;
  'next_by_date': Sioc.Item<D> | undefined;
  'next_version': Sioc.Item<D> | undefined;
  'previous_by_date': Sioc.Item<D> | undefined;
  'previous_version': Sioc.Item<D> | undefined;
  'read_at': RDF.Literal | undefined;
  'reply_of': Sioc.Item<D> | undefined;
  'respond_to': RDF.Term | undefined;
  'shared_by': Sioc.UserAccount<D> | undefined;
  sibling: Sioc.Item<D> | undefined;
}

export function ItemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Item & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class ItemClass extends Resource {
    @rdfine.property()
    about: RDF.Term | undefined;
    @rdfine.property()
    'addressed_to': RDF.Term | undefined;
    @rdfine.property()
    attachment: RDF.Term | undefined;
    @rdfine.property()
    content: RDF.Literal | undefined;
    @rdfine.property()
    'delivered_at': RDF.Literal | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'earlier_version': Sioc.Item | undefined;
    @rdfine.property()
    'embeds_knowledge': RDF.Term | undefined;
    @rdfine.property()
    generator: RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Container] })
    'has_container': Sioc.Container | undefined;
    @rdfine.property()
    'has_discussion': RDF.Term | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'has_reply': Sioc.Item | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'later_version': Sioc.Item | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'latest_version': Sioc.Item | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    mentions: Sioc.UserAccount | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'next_by_date': Sioc.Item | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'next_version': Sioc.Item | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'previous_by_date': Sioc.Item | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'previous_version': Sioc.Item | undefined;
    @rdfine.property()
    'read_at': RDF.Literal | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    'reply_of': Sioc.Item | undefined;
    @rdfine.property()
    'respond_to': RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    'shared_by': Sioc.UserAccount | undefined;
    @rdfine.property.resource({ as: [ItemMixin] })
    sibling: Sioc.Item | undefined;
  }
  return ItemClass as any
}
ItemMixin.appliesTo = sioc.Item
ItemMixin.createFactory = (env: RdfineEnvironment) => createFactory<Item>([ItemMixin], { types: [sioc.Item] }, env)
