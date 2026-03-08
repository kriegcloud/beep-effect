import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { doap } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Doap from '../index.js';
import type * as Foaf from '@rdfine/foaf';
import type * as Rdfs from '@rdfine/rdfs';
import type * as Sioc from '@rdfine/sioc';
import { ProjectMixin as FoafProjectMixin } from '@rdfine/foaf/lib/Project';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { PersonMixin as FoafPersonMixin } from '@rdfine/foaf/lib/Person';
import { ContainerMixin as SiocContainerMixin } from '@rdfine/sioc/lib/Container';
import { OrganizationMixin as FoafOrganizationMixin } from '@rdfine/foaf/lib/Organization';

export interface Project<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Project<D>, rdfine.RdfResource<D> {
  audience: RDF.Literal | undefined;
  blog: Rdfs.Resource<D> | undefined;
  'bug-database': RDF.Term | undefined;
  category: RDF.Term | undefined;
  developer: Foaf.Person<D> | undefined;
  'developer-forum': Sioc.Container<D> | undefined;
  documenter: Foaf.Person<D> | undefined;
  'download-mirror': RDF.Term | undefined;
  'download-page': RDF.Term | undefined;
  helper: Foaf.Person<D> | undefined;
  homepage: RDF.Term | undefined;
  implements: Doap.Specification<D> | undefined;
  language: RDF.Literal | undefined;
  'mailing-list': RDF.NamedNode | undefined;
  maintainer: Foaf.Person<D> | undefined;
  'old-homepage': RDF.Term | undefined;
  os: RDF.Literal | undefined;
  platform: RDF.Literal | undefined;
  'programming-language': RDF.Literal | undefined;
  release: Doap.Version<D> | undefined;
  repository: Doap.Repository<D> | undefined;
  screenshots: RDF.Term | undefined;
  'service-endpoint': Rdfs.Resource<D> | undefined;
  'support-forum': Sioc.Container<D> | undefined;
  tester: Foaf.Person<D> | undefined;
  translator: Foaf.Person<D> | undefined;
  vendor: Foaf.Organization<D> | undefined;
  wiki: RDF.NamedNode | undefined;
}

export function ProjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Project & RdfResourceCore> & Base {
  @rdfine.namespace(doap)
  class ProjectClass extends FoafProjectMixin(Resource) {
    @rdfine.property()
    audience: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    blog: Rdfs.Resource | undefined;
    @rdfine.property()
    'bug-database': RDF.Term | undefined;
    @rdfine.property()
    category: RDF.Term | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    developer: Foaf.Person | undefined;
    @rdfine.property.resource({ as: [SiocContainerMixin] })
    'developer-forum': Sioc.Container | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    documenter: Foaf.Person | undefined;
    @rdfine.property()
    'download-mirror': RDF.Term | undefined;
    @rdfine.property()
    'download-page': RDF.Term | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    helper: Foaf.Person | undefined;
    @rdfine.property()
    homepage: RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [doap.Specification] })
    implements: Doap.Specification | undefined;
    @rdfine.property()
    language: RDF.Literal | undefined;
    @rdfine.property()
    'mailing-list': RDF.NamedNode | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    maintainer: Foaf.Person | undefined;
    @rdfine.property()
    'old-homepage': RDF.Term | undefined;
    @rdfine.property()
    os: RDF.Literal | undefined;
    @rdfine.property()
    platform: RDF.Literal | undefined;
    @rdfine.property()
    'programming-language': RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [doap.Version] })
    release: Doap.Version | undefined;
    @rdfine.property.resource({ implicitTypes: [doap.Repository] })
    repository: Doap.Repository | undefined;
    @rdfine.property()
    screenshots: RDF.Term | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    'service-endpoint': Rdfs.Resource | undefined;
    @rdfine.property.resource({ as: [SiocContainerMixin] })
    'support-forum': Sioc.Container | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    tester: Foaf.Person | undefined;
    @rdfine.property.resource({ as: [FoafPersonMixin] })
    translator: Foaf.Person | undefined;
    @rdfine.property.resource({ as: [FoafOrganizationMixin] })
    vendor: Foaf.Organization | undefined;
    @rdfine.property()
    wiki: RDF.NamedNode | undefined;
  }
  return ProjectClass as any
}
ProjectMixin.appliesTo = doap.Project
ProjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<Project>([FoafProjectMixin, ProjectMixin], { types: [doap.Project] }, env)
