import prefixes from '@zazuko/prefixes'
import { Project } from 'ts-morph'
import { TypeMetaCollection } from './types/index.js'
import { generateNamespace } from './namespace.js'
import { Context, ModuleStrategy } from './index.js'

export async function generate(project: Project, types: TypeMetaCollection, strategies: ModuleStrategy[], context: Context) {
  const { log, prefix } = context

  log.debug('Generating vocabulary <%s>', prefixes[prefix])
  generateNamespace({ project }, context)
  const indexModule = project.createSourceFile('index.ts', {}, { overwrite: true })

  const writers = strategies.flatMap(strategy => strategy(types, context))

  const allGenerators = [...writers.values()]
  await allGenerators
    .filter(({ node }) => {
      if (node && !types.get(node)) {
        log.warn(`Skipping excluded type ${node.value}`)
        return false
      }

      return true
    })
    .sort((left, right) => (left.node?.value || '').localeCompare(right.node?.value || ''))
    .reduce((previous, moduleWriter) => {
      return previous.then(async () => {
        try {
          moduleWriter.writeModule({ project, types, context, indexModule, allGenerators })
        } catch (e: any) {
          context.log.error('Failed to generate module %s (type %s)\n%s', moduleWriter.constructor.name, moduleWriter.node?.value, e.message)
        }

        await project.save()
      })
    }, Promise.resolve())
}
