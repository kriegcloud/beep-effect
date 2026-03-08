import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface SoftwareSourceCode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  codeRepository: RDF.NamedNode | undefined;
  codeSampleType: string | undefined;
  programmingLanguage: Schema.ComputerLanguage<D> | undefined;
  programmingLanguageLiteral: string | undefined;
  runtime: string | undefined;
  runtimePlatform: string | undefined;
  sampleType: string | undefined;
  targetProduct: Schema.SoftwareApplication<D> | undefined;
}

export function SoftwareSourceCodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SoftwareSourceCode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SoftwareSourceCodeClass extends CreativeWorkMixin(Resource) {
    @rdfine.property()
    codeRepository: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    codeSampleType: string | undefined;
    @rdfine.property.resource()
    programmingLanguage: Schema.ComputerLanguage | undefined;
    @rdfine.property.literal({ path: schema.programmingLanguage })
    programmingLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    runtime: string | undefined;
    @rdfine.property.literal()
    runtimePlatform: string | undefined;
    @rdfine.property.literal()
    sampleType: string | undefined;
    @rdfine.property.resource()
    targetProduct: Schema.SoftwareApplication | undefined;
  }
  return SoftwareSourceCodeClass as any
}
SoftwareSourceCodeMixin.appliesTo = schema.SoftwareSourceCode
SoftwareSourceCodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<SoftwareSourceCode>([CreativeWorkMixin, SoftwareSourceCodeMixin], { types: [schema.SoftwareSourceCode] }, env)
