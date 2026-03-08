import { Project } from 'ts-morph'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { ExtensionIndexModule } from '../../lib/ExtensionMixinGenerator/ExtensionIndexModule.js'

describe('ExtensionIndexModule', () => {
  chai.use(jestSnapshotPlugin())
  before(() => import('../../../../__tests__/helpers/matchers.js'))

  it('generates exports for extended terms', () => {
    // given
    const project = new Project({
      useInMemoryFileSystem: true,
    })
    const module = new ExtensionIndexModule('rdfs', ['Class', 'Property'])

    // when
    module.writeModule({ project })

    // then
    expect(project.getSourceFile('extensions/rdfs.ts')).toMatchSnapshot()
  })
})
