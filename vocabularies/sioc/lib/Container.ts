import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';

export interface Container<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  'container_of': Sioc.Item<D> | undefined;
  'has_host': Sioc.Site<D> | undefined;
  'has_parent': Sioc.Container<D> | undefined;
  'has_subscriber': Sioc.UserAccount<D> | undefined;
  'last_item_date': RDF.Literal | undefined;
  'num_items': number | undefined;
  'parent_of': Sioc.Container<D> | undefined;
}

export function ContainerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Container & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class ContainerClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [sioc.Item] })
    'container_of': Sioc.Item | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Site] })
    'has_host': Sioc.Site | undefined;
    @rdfine.property.resource({ as: [ContainerMixin] })
    'has_parent': Sioc.Container | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    'has_subscriber': Sioc.UserAccount | undefined;
    @rdfine.property()
    'last_item_date': RDF.Literal | undefined;
    @rdfine.property.literal({ type: Number })
    'num_items': number | undefined;
    @rdfine.property.resource({ as: [ContainerMixin] })
    'parent_of': Sioc.Container | undefined;
  }
  return ContainerClass as any
}
ContainerMixin.appliesTo = sioc.Container
ContainerMixin.createFactory = (env: RdfineEnvironment) => createFactory<Container>([ContainerMixin], { types: [sioc.Container] }, env)
