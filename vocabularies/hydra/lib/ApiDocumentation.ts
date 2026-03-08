import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin } from './Resource.js';

export interface ApiDocumentation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Hydra.Resource<D>, rdfine.RdfResource<D> {
  description: string | undefined;
  entrypoint: Hydra.Resource<D> | undefined;
  extension: RDF.Term | undefined;
  possibleStatus: Array<Hydra.Status<D>>;
  supportedClass: Array<Hydra.Class<D> | Rdfs.Class<D>>;
  title: string | undefined;
}

export function ApiDocumentationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ApiDocumentation & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class ApiDocumentationClass extends ResourceMixin(Resource) {
    @rdfine.property.literal()
    description: string | undefined;
    @rdfine.property.resource({ implicitTypes: [hydra.Resource] })
    entrypoint: Hydra.Resource | undefined;
    @rdfine.property()
    extension: RDF.Term | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.Status] })
    possibleStatus!: Array<Hydra.Status>;
    @rdfine.property.resource({ values: 'array' })
    supportedClass!: Array<Hydra.Class | Rdfs.Class>;
    @rdfine.property.literal()
    title: string | undefined;
  }
  return ApiDocumentationClass as any
}
ApiDocumentationMixin.appliesTo = hydra.ApiDocumentation
ApiDocumentationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ApiDocumentation>([ResourceMixin, ApiDocumentationMixin], { types: [hydra.ApiDocumentation] }, env)
