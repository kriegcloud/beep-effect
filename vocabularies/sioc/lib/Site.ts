import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';
import { SpaceMixin } from './Space.js';

export interface Site<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sioc.Space<D>, rdfine.RdfResource<D> {
  'has_administrator': Sioc.UserAccount<D> | undefined;
  'host_of': Sioc.Container<D> | undefined;
}

export function SiteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Site & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class SiteClass extends SpaceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [sioc.UserAccount] })
    'has_administrator': Sioc.UserAccount | undefined;
    @rdfine.property.resource({ implicitTypes: [sioc.Container] })
    'host_of': Sioc.Container | undefined;
  }
  return SiteClass as any
}
SiteMixin.appliesTo = sioc.Site
SiteMixin.createFactory = (env: RdfineEnvironment) => createFactory<Site>([SpaceMixin, SiteMixin], { types: [sioc.Site] }, env)
