import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ConceptMixin } from './Concept.js';

export interface Proxy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Concept<D>, rdfine.RdfResource<D> {
  proxyFor: Rico.RecordResource<D> | undefined;
  proxyIn: Rico.RecordSet<D> | undefined;
}

export function ProxyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Proxy & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ProxyClass extends ConceptMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    proxyFor: Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    proxyIn: Rico.RecordSet | undefined;
  }
  return ProxyClass as any
}
ProxyMixin.appliesTo = rico.Proxy
ProxyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Proxy>([ConceptMixin, ProxyMixin], { types: [rico.Proxy] }, env)
