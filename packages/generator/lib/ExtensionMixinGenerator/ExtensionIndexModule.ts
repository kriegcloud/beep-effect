import { Project } from 'ts-morph'
import { GeneratedModule } from '../index.js'

export class ExtensionIndexModule implements GeneratedModule {
  constructor(public prefix: string, public terms: string[]) {
  }

  writeModule({ project }: { project: Project }): void {
    const extensionsModule = project.createSourceFile(`extensions/${this.prefix}.ts`, {}, { overwrite: true })

    for (const extendedTerm of this.terms.sort((l, r) => l.localeCompare(r))) {
      extensionsModule.addExportDeclaration({
        namedExports: [`${extendedTerm}MixinEx`],
        moduleSpecifier: `./${this.prefix}/${extendedTerm}.js`,
      })
    }
  }
}
