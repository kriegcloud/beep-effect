import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface SoftwareApplication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  applicationCategory: string | undefined;
  applicationCategoryTerm: RDF.NamedNode | undefined;
  applicationSubCategory: string | undefined;
  applicationSubCategoryTerm: RDF.NamedNode | undefined;
  applicationSuite: string | undefined;
  availableOnDevice: string | undefined;
  countriesNotSupported: string | undefined;
  countriesSupported: string | undefined;
  device: string | undefined;
  downloadUrl: RDF.NamedNode | undefined;
  featureList: string | undefined;
  featureListTerm: RDF.NamedNode | undefined;
  fileSize: string | undefined;
  installUrl: RDF.NamedNode | undefined;
  memoryRequirements: string | undefined;
  memoryRequirementsTerm: RDF.NamedNode | undefined;
  operatingSystem: string | undefined;
  permissions: string | undefined;
  processorRequirements: string | undefined;
  releaseNotes: string | undefined;
  releaseNotesTerm: RDF.NamedNode | undefined;
  requirements: string | undefined;
  requirementsTerm: RDF.NamedNode | undefined;
  screenshot: Schema.ImageObject<D> | undefined;
  softwareAddOn: Schema.SoftwareApplication<D> | undefined;
  softwareHelp: Schema.CreativeWork<D> | undefined;
  softwareRequirements: string | undefined;
  softwareRequirementsTerm: RDF.NamedNode | undefined;
  softwareVersion: string | undefined;
  storageRequirements: string | undefined;
  storageRequirementsTerm: RDF.NamedNode | undefined;
  supportingData: Schema.DataFeed<D> | undefined;
}

export function SoftwareApplicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SoftwareApplication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SoftwareApplicationClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal()
    applicationCategory: string | undefined;
    @rdfine.property({ path: schema.applicationCategory })
    applicationCategoryTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    applicationSubCategory: string | undefined;
    @rdfine.property({ path: schema.applicationSubCategory })
    applicationSubCategoryTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    applicationSuite: string | undefined;
    @rdfine.property.literal()
    availableOnDevice: string | undefined;
    @rdfine.property.literal()
    countriesNotSupported: string | undefined;
    @rdfine.property.literal()
    countriesSupported: string | undefined;
    @rdfine.property.literal()
    device: string | undefined;
    @rdfine.property()
    downloadUrl: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    featureList: string | undefined;
    @rdfine.property({ path: schema.featureList })
    featureListTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    fileSize: string | undefined;
    @rdfine.property()
    installUrl: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    memoryRequirements: string | undefined;
    @rdfine.property({ path: schema.memoryRequirements })
    memoryRequirementsTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    operatingSystem: string | undefined;
    @rdfine.property.literal()
    permissions: string | undefined;
    @rdfine.property.literal()
    processorRequirements: string | undefined;
    @rdfine.property.literal()
    releaseNotes: string | undefined;
    @rdfine.property({ path: schema.releaseNotes })
    releaseNotesTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    requirements: string | undefined;
    @rdfine.property({ path: schema.requirements })
    requirementsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    screenshot: Schema.ImageObject | undefined;
    @rdfine.property.resource()
    softwareAddOn: Schema.SoftwareApplication | undefined;
    @rdfine.property.resource()
    softwareHelp: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    softwareRequirements: string | undefined;
    @rdfine.property({ path: schema.softwareRequirements })
    softwareRequirementsTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    softwareVersion: string | undefined;
    @rdfine.property.literal()
    storageRequirements: string | undefined;
    @rdfine.property({ path: schema.storageRequirements })
    storageRequirementsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    supportingData: Schema.DataFeed | undefined;
  }
  return SoftwareApplicationClass as any
}
SoftwareApplicationMixin.appliesTo = schema.SoftwareApplication
SoftwareApplicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SoftwareApplication>([CreativeWorkMixin, SoftwareApplicationMixin], { types: [schema.SoftwareApplication] }, env)
