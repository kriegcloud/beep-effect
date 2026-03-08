import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { ResourceExMixin } from '../extensions/ResourceEx.js';

export interface Resource<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  first: Hydra.Resource<D> | undefined;
  freetextQuery: string | undefined;
  last: Hydra.Resource<D> | undefined;
  next: Hydra.Resource<D> | undefined;
  operation: Array<Hydra.Operation<D>>;
  previous: Hydra.Resource<D> | undefined;
  search: Hydra.IriTemplate<D> | undefined;
  view: Array<Hydra.Resource<D>>;
}

export function ResourceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Resource & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class ResourceClass extends ResourceExMixin(RdfsResourceMixin(Resource)) {
    @rdfine.property.resource({ as: [ResourceMixin] })
    first: Hydra.Resource | undefined;
    @rdfine.property.literal()
    freetextQuery: string | undefined;
    @rdfine.property.resource({ as: [ResourceMixin] })
    last: Hydra.Resource | undefined;
    @rdfine.property.resource({ as: [ResourceMixin] })
    next: Hydra.Resource | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.Operation] })
    operation!: Array<Hydra.Operation>;
    @rdfine.property.resource({ as: [ResourceMixin] })
    previous: Hydra.Resource | undefined;
    @rdfine.property.resource({ implicitTypes: [hydra.IriTemplate] })
    search: Hydra.IriTemplate | undefined;
    @rdfine.property.resource({ values: 'array' })
    view!: Array<Hydra.Resource>;
  }
  return ResourceClass as any
}
ResourceMixin.appliesTo = hydra.Resource
ResourceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Resource>([RdfsResourceMixin, ResourceMixin], { types: [hydra.Resource] }, env)
