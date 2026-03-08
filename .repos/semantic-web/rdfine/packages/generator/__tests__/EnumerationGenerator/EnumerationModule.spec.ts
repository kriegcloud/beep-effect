import cf, { AnyPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { rdf } from '@tpluscode/rdf-ns-builders'
import { Project, SourceFile } from 'ts-morph'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { EnumerationModule } from '../../lib/EnumerationGenerator/EnumerationModule.js'
import { fakeLog } from '../_helpers/util.js'
import { FakeTypeCollection } from '../_helpers/FakeTypeCollection.js'
import { ex } from '../_helpers/prefix.js'

describe('EnumerationModule', () => {
  let project: Project
  let graph: AnyPointer
  let indexModule: SourceFile

  chai.use(jestSnapshotPlugin())
  before(() => import('../../../../__tests__/helpers/matchers.js'))
  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
    })
    indexModule = project.createSourceFile('index.ts')

    graph = cf({ dataset: $rdf.dataset() })
  })

  it('writes a module with enumeration members', () => {
    // given
    const types = new FakeTypeCollection([
      [ex.Member1, { type: 'EnumerationMember', termName: 'Member1', prefixedName: 'ex.Member1' }],
      [ex.Member2, { type: 'EnumerationMember', termName: 'Member2', prefixedName: 'ex.Member2' }],
    ])

    const enumeration = graph.node(ex.Enum)
      .addIn(rdf.type, [ex.Member1, ex.Member2])
    const module = new EnumerationModule(enumeration, {
      name: 'Enum',
      module: './Enum',
      qualifiedName: 'Ex.Enum',
      type: 'Enumeration',
    })

    // when
    module.writeModule({
      indexModule,
      project,
      types,
      context: {
        log: fakeLog(),
        prefix: 'ex',
      },
    })

    // then
    expect(project.getSourceFile('./lib/Enum.ts')).toMatchSnapshot()
  })

  it('uses plain NamedNode for enumerations without members', () => {
    // given
    const types = new FakeTypeCollection([
    ])

    const enumeration = graph.node(ex.Enum)
      .addIn(rdf.type, [ex.Member1, ex.Member2])
    const module = new EnumerationModule(enumeration, {
      name: 'Enum',
      module: './Enum',
      qualifiedName: 'Ex.Enum',
      type: 'Enumeration',
    })

    // when
    module.writeModule({
      indexModule,
      project,
      types,
      context: {
        log: fakeLog(),
        prefix: 'ex',
      },
    })

    // then
    expect(project.getSourceFile('./lib/Enum.ts')).toMatchSnapshot()
  })
})
