import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import { owl } from '../../lib/namespace.js';
import type * as Owl from '../../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { ListMixin as RdfListMixin } from '@rdfine/rdf/lib/List';

interface ResourceEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  annotatedProperty: Rdfs.Resource<D> | undefined;
  annotatedSource: Rdfs.Resource<D> | undefined;
  annotatedTarget: Rdfs.Resource<D> | undefined;
  deprecated: Rdfs.Resource<D> | undefined;
  members: Rdf.List<D> | undefined;
  versionInfo: Rdfs.Resource<D> | undefined;
}

declare module '@rdfine/rdfs/lib/Resource' {
  interface Resource<D extends RDF.DatasetCore> extends ResourceEx<D> {
  }
}

export function ResourceMixinEx<Base extends rdfine.ExtendingConstructor<Rdfs.Resource, ResourceEx>>(Resource: Base): rdfine.Constructor<ResourceEx & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class Impl extends Resource implements ResourceEx {
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    annotatedProperty: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    annotatedSource: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    annotatedTarget: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    deprecated: Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [RdfListMixin] })
    members: Rdf.List | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    versionInfo: Rdfs.Resource | undefined;
  }
  return Impl
}
ResourceMixinEx.appliesTo = rdfs.Resource
