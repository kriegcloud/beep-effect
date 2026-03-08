import path from 'path'
import { RealFileSystemHost } from '@ts-morph/common'

export default class FileSystem extends RealFileSystemHost {
  private readonly outDir: string

  constructor(outDir: string) {
    super()
    this.outDir = outDir
  }

  getCurrentDirectory(): string {
    return path.resolve(process.cwd(), this.outDir)
  }
}
