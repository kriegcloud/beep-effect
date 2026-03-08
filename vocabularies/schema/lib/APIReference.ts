import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TechArticleMixin } from './TechArticle.js';

export interface APIReference<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TechArticle<D>, rdfine.RdfResource<D> {
  assembly: string | undefined;
  assemblyVersion: string | undefined;
  executableLibraryName: string | undefined;
  programmingModel: string | undefined;
  targetPlatform: string | undefined;
}

export function APIReferenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<APIReference & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class APIReferenceClass extends TechArticleMixin(Resource) {
    @rdfine.property.literal()
    assembly: string | undefined;
    @rdfine.property.literal()
    assemblyVersion: string | undefined;
    @rdfine.property.literal()
    executableLibraryName: string | undefined;
    @rdfine.property.literal()
    programmingModel: string | undefined;
    @rdfine.property.literal()
    targetPlatform: string | undefined;
  }
  return APIReferenceClass as any
}
APIReferenceMixin.appliesTo = schema.APIReference
APIReferenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<APIReference>([TechArticleMixin, APIReferenceMixin], { types: [schema.APIReference] }, env)
