#!/usr/bin/env node

import * as Fs from "node:fs"
import * as Path from "node:path"
import * as Process from "node:process"

// Parse command line arguments
const args = Process.argv.slice(2)

// Help text
const helpText = `
JSDoc Analyzer - Analyze TypeScript files for missing JSDoc examples and category tags

Usage:
  node scripts/analyze-jsdoc.mjs [options] [target]

Arguments:
  target                    Path to analyze (relative to repo root)
                           Examples:
                             packages/common/identity
                             packages/iam/domain
                             apps/web
                             packages/shared/domain/src/entities

Options:
  --file=<filename>        Analyze a specific file within the target directory
                           Example: --file=User.ts
  --recursive              Recursively scan all subdirectories (default: true)
  --no-recursive           Only scan the immediate src directory
  --extensions=<ext>       Comma-separated file extensions to analyze (default: .ts,.tsx)
  --exclude=<patterns>     Comma-separated glob patterns to exclude (default: *.test.ts,*.spec.ts)
  --json                   Output results as JSON only (no formatted report)
  --help, -h               Show this help message

Examples:
  # Analyze the identity package
  node scripts/analyze-jsdoc.mjs packages/common/identity

  # Analyze a specific file in the iam domain
  node scripts/analyze-jsdoc.mjs packages/iam/domain --file=User.ts

  # Analyze the web app with only .ts files
  node scripts/analyze-jsdoc.mjs apps/web --extensions=.ts

  # Analyze shared domain entities
  node scripts/analyze-jsdoc.mjs packages/shared/domain/src/entities

  # List all packages that can be analyzed
  node scripts/analyze-jsdoc.mjs --list
`

// Parse options
const showHelp = args.includes("--help") || args.includes("-h")
const listPackages = args.includes("--list")
const jsonOutput = args.includes("--json")
const recursive = !args.includes("--no-recursive")
const fileFilter = args.find((arg) => arg.startsWith("--file="))?.replace("--file=", "")
const extensionsArg = args.find((arg) => arg.startsWith("--extensions="))?.replace("--extensions=", "")
const excludeArg = args.find((arg) => arg.startsWith("--exclude="))?.replace("--exclude=", "")

const extensions = extensionsArg ? extensionsArg.split(",") : [".ts", ".tsx"]
const excludePatterns = excludeArg ? excludeArg.split(",") : ["*.test.ts", "*.spec.ts", "*.d.ts"]

// Get target path (first non-option argument)
const targetPath = args.find((arg) => !arg.startsWith("--") && !arg.startsWith("-"))

if (showHelp) {
  Process.stdout.write(helpText)
  Process.exit(0)
}

/**
 * Get all analyzable packages and apps in the repository
 */
function getAnalyzableTargets() {
  const repoRoot = Process.cwd()
  const targets = []

  // Scan packages directory
  const packagesDir = Path.join(repoRoot, "packages")
  if (Fs.existsSync(packagesDir)) {
    const packageGroups = Fs.readdirSync(packagesDir)
    for (const group of packageGroups) {
      const groupPath = Path.join(packagesDir, group)
      if (!Fs.statSync(groupPath).isDirectory()) continue
      if (group.startsWith("_")) continue // Skip internal packages

      // Check if this is a direct package (has src/) or a group of packages
      const srcPath = Path.join(groupPath, "src")
      if (Fs.existsSync(srcPath)) {
        targets.push(`packages/${group}`)
      } else {
        // It's a group, scan subdirectories
        const subPackages = Fs.readdirSync(groupPath)
        for (const subPkg of subPackages) {
          const subPkgPath = Path.join(groupPath, subPkg)
          if (!Fs.statSync(subPkgPath).isDirectory()) continue
          const subSrcPath = Path.join(subPkgPath, "src")
          if (Fs.existsSync(subSrcPath)) {
            targets.push(`packages/${group}/${subPkg}`)
          }
        }
      }
    }
  }

  // Scan apps directory
  const appsDir = Path.join(repoRoot, "apps")
  if (Fs.existsSync(appsDir)) {
    const apps = Fs.readdirSync(appsDir)
    for (const app of apps) {
      const appPath = Path.join(appsDir, app)
      if (!Fs.statSync(appPath).isDirectory()) continue
      const srcPath = Path.join(appPath, "src")
      if (Fs.existsSync(srcPath)) {
        targets.push(`apps/${app}`)
      }
    }
  }

  return targets.sort()
}

if (listPackages) {
  const targets = getAnalyzableTargets()
  Process.stdout.write("Available targets for analysis:\n\n")
  targets.forEach((t) => Process.stdout.write(`  ${t}\n`))
  Process.stdout.write(`\nTotal: ${targets.length} targets\n`)
  Process.exit(0)
}

if (!targetPath) {
  Process.stdout.write("Error: No target path specified.\n")
  Process.stdout.write("Use --help for usage information or --list to see available targets.\n")
  Process.exit(1)
}

/**
 * Analyzes TypeScript files for missing JSDoc examples and category tags
 */
class JSDocAnalyzer {
  constructor(options = {}) {
    this.options = {
      extensions: options.extensions || [".ts", ".tsx"],
      excludePatterns: options.excludePatterns || ["*.test.ts", "*.spec.ts", "*.d.ts"],
      recursive: options.recursive !== false,
      jsonOutput: options.jsonOutput || false
    }
    this.results = {
      targetPath: "",
      totalFiles: 0,
      totalExports: 0,
      missingExamples: 0,
      missingCategories: 0,
      fileDetails: [],
      missingItems: []
    }
  }

  /**
   * Check if a filename matches any exclude pattern
   */
  shouldExclude(filename) {
    return this.options.excludePatterns.some((pattern) => {
      // Simple glob matching for *.ext patterns
      if (pattern.startsWith("*")) {
        return filename.endsWith(pattern.slice(1))
      }
      return filename === pattern
    })
  }

  /**
   * Check if a file has a valid extension
   */
  hasValidExtension(filename) {
    return this.options.extensions.some((ext) => filename.endsWith(ext))
  }

  /**
   * Get all TypeScript files in the target directory
   */
  getFiles(targetDir) {
    const files = []

    const scanDir = (dir) => {
      if (!Fs.existsSync(dir)) return

      const entries = Fs.readdirSync(dir)
      for (const entry of entries) {
        const fullPath = Path.join(dir, entry)
        const stat = Fs.statSync(fullPath)

        if (stat.isDirectory()) {
          // Skip node_modules, dist, .git, etc.
          if (["node_modules", "dist", ".git", "coverage", ".turbo"].includes(entry)) {
            continue
          }
          if (this.options.recursive) {
            scanDir(fullPath)
          }
        } else if (stat.isFile()) {
          if (this.hasValidExtension(entry) && !this.shouldExclude(entry)) {
            files.push(fullPath)
          }
        }
      }
    }

    scanDir(targetDir)
    return files
  }

  /**
   * Extract exported members from a TypeScript file using more comprehensive parsing
   */
  extractExports(content, filepath) {
    const exports = []
    const lines = content.split("\n")
    const processedFunctions = new Set() // Track functions to avoid counting overloads

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip comments and empty lines
      if (line.startsWith("//") || line.startsWith("*") || !line) continue

      // More comprehensive export patterns including multi-line declarations
      // Note: Using [\w$]+ to include $ character in export names (e.g., Array$, Object$)
      const exportPatterns = [
        /^export\s+const\s+([\w$]+)[\s:=]/,
        /^export\s+function\s+([\w$]+)\s*[(<]/,
        /^export\s+type\s+([\w$]+)[\s=<]/,
        /^export\s+interface\s+([\w$]+)[\s<{]/,
        /^export\s+class\s+([\w$]+)[\s<{]/,
        /^export\s+enum\s+([\w$]+)[\s{]/,
        /^export\s+namespace\s+([\w$]+)[\s{]/,
        /^export\s+declare\s+const\s+([\w$]+)[\s:]/,
        /^export\s+declare\s+function\s+([\w$]+)\s*[(<]/,
        /^export\s+declare\s+type\s+([\w$]+)[\s=<]/,
        /^export\s+declare\s+interface\s+([\w$]+)[\s<{]/,
        /^export\s+declare\s+class\s+([\w$]+)[\s<{]/,
        /^export\s+declare\s+enum\s+([\w$]+)[\s{]/,
        /^export\s+declare\s+namespace\s+([\w$]+)[\s{]/,
        // Handle object destructuring exports
        /^export\s+\{\s*([\w$]+)/
      ]

      for (const pattern of exportPatterns) {
        const match = line.match(pattern)
        if (match) {
          const exportName = match[1]

          // Skip re-exports and internal exports
          if (line.includes("from ") || exportName.startsWith("_")) {
            continue
          }

          // Skip certain common re-export patterns
          if (line.includes("export {") && line.includes("}")) {
            continue
          }

          // For function overloads, only count the first declaration (with JSDoc)
          if (line.includes("function ")) {
            if (processedFunctions.has(exportName)) {
              continue // Skip this overload
            }
            processedFunctions.add(exportName)
          }

          // Find associated JSDoc block
          const jsdoc = this.findJSDocBlock(lines, i)

          // Skip internal exports - they don't need categories or examples
          if (jsdoc.isInternal) {
            break
          }

          const exportType = this.getExportType(line)

          exports.push({
            name: exportName,
            line: i + 1,
            type: exportType,
            hasExample: jsdoc.hasExample,
            hasCategory: jsdoc.hasCategory,
            jsdocStart: jsdoc.start,
            filepath,
            exportLine: line
          })
          break
        }
      }
    }

    return exports
  }

  /**
   * Find JSDoc block preceding an export - improved to handle gaps and better detection
   */
  findJSDocBlock(lines, exportLineIndex) {
    let hasExample = false
    let hasCategory = false
    let isInternal = false
    let jsdocStartLine = -1
    let jsdocEndLine = -1
    let emptyLinesCount = 0

    // Look backwards for JSDoc block, allowing for empty lines
    for (let i = exportLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim()

      // Empty line - count them but continue searching
      if (!line) {
        emptyLinesCount++
        // Allow up to 3 empty lines between JSDoc and export
        if (emptyLinesCount > 3 && jsdocEndLine === -1) {
          break
        }
        continue
      }

      // Reset empty line count when we find content
      if (line) {
        emptyLinesCount = 0
      }

      // End of JSDoc block
      if (line === "*/") {
        jsdocEndLine = i
        continue
      }

      // Start of JSDoc block
      if (line.startsWith("/**")) {
        jsdocStartLine = i

        // Single line JSDoc /** comment */
        if (line.endsWith("*/")) {
          if (line.includes("@example")) hasExample = true
          if (line.includes("@category")) hasCategory = true
          if (line.includes("@internal")) isInternal = true
          break
        }

        // Multi-line JSDoc block - scan the entire block
        // Note: jsdocEndLine is found first (going backwards), then jsdocStartLine
        if (jsdocEndLine !== -1) {
          for (let j = jsdocStartLine; j <= jsdocEndLine; j++) {
            const blockLine = lines[j].trim()
            if (blockLine.includes("@example")) {
              hasExample = true
            }
            if (blockLine.includes("@category")) {
              hasCategory = true
            }
            if (blockLine.includes("@internal")) {
              isInternal = true
            }
          }
        }
        break
      }

      // Hit another export/declaration - stop searching if we haven't found JSDoc yet
      if (
        line && (line.startsWith("export ") ||
          line.startsWith("import ") ||
          line.startsWith("const ") ||
          line.startsWith("function ") ||
          line.startsWith("class ") ||
          line.startsWith("interface ") ||
          line.startsWith("type ") ||
          line.startsWith("enum "))
      ) {
        break
      }
    }

    return { hasExample, hasCategory, isInternal, start: jsdocStartLine }
  }

  /**
   * Determine the type of export with better detection
   */
  getExportType(line) {
    if (line.includes("const ")) return "const"
    if (line.includes("function ")) return "function"
    if (line.includes("type ")) return "type"
    if (line.includes("interface ")) return "interface"
    if (line.includes("class ")) return "class"
    if (line.includes("enum ")) return "enum"
    if (line.includes("namespace ")) return "namespace"
    if (line.includes("declare ")) return "declare"
    return "unknown"
  }

  /**
   * Analyze a single file
   */
  analyzeFile(filepath, baseDir) {
    const content = Fs.readFileSync(filepath, "utf8")
    const relativePath = Path.relative(baseDir, filepath)
    const exports = this.extractExports(content, filepath)

    const fileStats = {
      filename: relativePath,
      filepath,
      totalExports: exports.length,
      missingExamples: exports.filter((e) => !e.hasExample).length,
      missingCategories: exports.filter((e) => !e.hasCategory).length,
      exports: exports.map((e) => ({
        name: e.name,
        type: e.type,
        line: e.line,
        hasExample: e.hasExample,
        hasCategory: e.hasCategory
      }))
    }

    // Track missing items for detailed reporting
    exports.forEach((exp) => {
      if (!exp.hasExample || !exp.hasCategory) {
        this.results.missingItems.push({
          file: relativePath,
          filepath,
          name: exp.name,
          type: exp.type,
          line: exp.line,
          missingExample: !exp.hasExample,
          missingCategory: !exp.hasCategory
        })
      }
    })

    return fileStats
  }

  /**
   * Run analysis on the target directory or a specific file
   */
  analyze(target, specificFile = null) {
    const repoRoot = Process.cwd()
    let targetDir = Path.isAbsolute(target) ? target : Path.join(repoRoot, target)

    // If target doesn't exist, try adding /src
    if (!Fs.existsSync(targetDir)) {
      const withSrc = Path.join(targetDir, "src")
      if (Fs.existsSync(withSrc)) {
        targetDir = withSrc
      } else {
        Process.stdout.write(`Error: Target directory not found: ${target}\n`)
        Process.stdout.write(`Tried: ${targetDir}\n`)
        Process.stdout.write(`Also tried: ${withSrc}\n`)
        Process.stdout.write(`\nUse --list to see available targets.\n`)
        Process.exit(1)
      }
    }

    // Check if target is a file
    if (Fs.statSync(targetDir).isFile()) {
      targetDir = Path.dirname(targetDir)
      specificFile = Path.basename(target)
    }

    // Find src directory if not already in one
    const srcDir = targetDir.endsWith("/src") || targetDir.includes("/src/")
      ? targetDir
      : Fs.existsSync(Path.join(targetDir, "src"))
        ? Path.join(targetDir, "src")
        : targetDir

    this.results.targetPath = Path.relative(repoRoot, srcDir)

    if (specificFile) {
      // Find the specific file
      const files = this.getFiles(srcDir)
      const targetFile = files.find((f) => {
        const basename = Path.basename(f)
        const relativePath = Path.relative(srcDir, f)
        return basename === specificFile || relativePath === specificFile
      })

      if (!targetFile) {
        Process.stdout.write(`Error: File '${specificFile}' not found in ${srcDir}\n`)
        Process.stdout.write(`\nAvailable files:\n`)
        files.slice(0, 20).forEach((f) => {
          Process.stdout.write(`  ${Path.relative(srcDir, f)}\n`)
        })
        if (files.length > 20) {
          Process.stdout.write(`  ... and ${files.length - 20} more\n`)
        }
        Process.exit(1)
      }

      // Analyze only the target file
      const fileStats = this.analyzeFile(targetFile, srcDir)
      this.generateFileReport(fileStats)
      return
    }

    const files = this.getFiles(srcDir)

    if (files.length === 0) {
      Process.stdout.write(`No TypeScript files found in ${srcDir}\n`)
      Process.exit(1)
    }

    if (!this.options.jsonOutput) {
      Process.stdout.write(`Analyzing ${files.length} TypeScript files in ${this.results.targetPath}...\n\n`)
    }

    this.results.totalFiles = files.length

    for (const filepath of files) {
      const fileStats = this.analyzeFile(filepath, srcDir)
      this.results.fileDetails.push(fileStats)

      this.results.totalExports += fileStats.totalExports
      this.results.missingExamples += fileStats.missingExamples
      this.results.missingCategories += fileStats.missingCategories
    }

    if (this.options.jsonOutput) {
      Process.stdout.write(JSON.stringify(this.results, null, 2))
    } else {
      this.generateReport()
    }
  }

  /**
   * Generate report for a single file
   */
  generateFileReport(fileStats) {
    const { exports, filename, missingCategories, missingExamples, totalExports } = fileStats

    if (this.options.jsonOutput) {
      Process.stdout.write(JSON.stringify(fileStats, null, 2))
      return
    }

    Process.stdout.write("=".repeat(60) + "\n")
    Process.stdout.write(`         ${filename.toUpperCase()} DOCUMENTATION REPORT\n`)
    Process.stdout.write("=".repeat(60) + "\n\n")

    // Summary
    Process.stdout.write("SUMMARY\n")
    Process.stdout.write("-".repeat(20) + "\n")
    Process.stdout.write(`Total exports: ${totalExports}\n`)

    if (totalExports === 0) {
      Process.stdout.write("No exports found in this file.\n")
      return
    }

    Process.stdout.write(
      `Missing examples: ${missingExamples} (${((missingExamples / totalExports) * 100).toFixed(1)}%)\n`
    )
    Process.stdout.write(
      `Missing categories: ${missingCategories} (${((missingCategories / totalExports) * 100).toFixed(1)}%)\n\n`
    )

    // Missing examples
    if (missingExamples > 0) {
      Process.stdout.write("MISSING EXAMPLES\n")
      Process.stdout.write("-".repeat(30) + "\n")
      const missingExampleItems = exports.filter((e) => !e.hasExample)
      missingExampleItems.forEach((item, index) => {
        Process.stdout.write(`${index + 1}. ${item.name} (${item.type}) - Line ${item.line}\n`)
      })
      Process.stdout.write("\n")
    }

    // Missing categories
    if (missingCategories > 0) {
      Process.stdout.write("MISSING CATEGORIES\n")
      Process.stdout.write("-".repeat(30) + "\n")
      const missingCategoryItems = exports.filter((e) => !e.hasCategory)
      missingCategoryItems.forEach((item, index) => {
        Process.stdout.write(`${index + 1}. ${item.name} (${item.type}) - Line ${item.line}\n`)
      })
      Process.stdout.write("\n")
    }

    // Breakdown by type
    Process.stdout.write("BREAKDOWN BY TYPE\n")
    Process.stdout.write("-".repeat(25) + "\n")
    const typeStats = {}
    exports.forEach((exp) => {
      if (!typeStats[exp.type]) {
        typeStats[exp.type] = { total: 0, missingExample: 0, missingCategory: 0 }
      }
      typeStats[exp.type].total++
      if (!exp.hasExample) typeStats[exp.type].missingExample++
      if (!exp.hasCategory) typeStats[exp.type].missingCategory++
    })

    Object.entries(typeStats).forEach(([type, stats]) => {
      Process.stdout.write(
        `${type}: ${stats.total} total, ${stats.missingExample} missing examples, ${stats.missingCategory} missing categories\n`
      )
    })

    Process.stdout.write("\n" + "=".repeat(60) + "\n")
    Process.stdout.write(`Analysis complete for ${filename}!\n`)
    Process.stdout.write("=".repeat(60) + "\n")
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    const { fileDetails, missingCategories, missingExamples, missingItems, targetPath, totalExports, totalFiles } = this.results

    Process.stdout.write("=".repeat(60) + "\n")
    Process.stdout.write("         JSDOC ANALYSIS REPORT\n")
    Process.stdout.write("=".repeat(60) + "\n")
    Process.stdout.write(`Target: ${targetPath}\n`)
    Process.stdout.write("\n")

    // Summary Statistics
    Process.stdout.write("SUMMARY STATISTICS\n")
    Process.stdout.write("-".repeat(30) + "\n")
    Process.stdout.write(`Total files analyzed: ${totalFiles}\n`)
    Process.stdout.write(`Total exported members: ${totalExports}\n`)

    if (totalExports === 0) {
      Process.stdout.write("\nNo exports found in the analyzed files.\n")
      return
    }

    Process.stdout.write(
      `Missing @example: ${missingExamples} (${((missingExamples / totalExports) * 100).toFixed(1)}%)\n`
    )
    Process.stdout.write(
      `Missing @category: ${missingCategories} (${((missingCategories / totalExports) * 100).toFixed(1)}%)\n`
    )
    Process.stdout.write("\n")

    // Top files needing attention (sorted by total missing items)
    Process.stdout.write("TOP FILES NEEDING ATTENTION\n")
    Process.stdout.write("-".repeat(40) + "\n")
    const sortedFiles = fileDetails
      .filter((f) => f.missingExamples > 0 || f.missingCategories > 0)
      .sort((a, b) => (b.missingExamples + b.missingCategories) - (a.missingExamples + a.missingCategories))
      .slice(0, 15)

    if (sortedFiles.length === 0) {
      Process.stdout.write("All files are fully documented!\n")
    } else {
      sortedFiles.forEach((file, index) => {
        Process.stdout.write(`${index + 1}. ${file.filename}\n`)
        Process.stdout.write(
          `   ${file.missingExamples} missing examples, ${file.missingCategories} missing categories\n`
        )
        Process.stdout.write(`   ${file.totalExports} total exports\n`)
      })
    }

    Process.stdout.write("\n")

    // Files with perfect documentation
    const perfectFiles = fileDetails.filter((f) => f.missingExamples === 0 && f.missingCategories === 0 && f.totalExports > 0)
    if (perfectFiles.length > 0) {
      Process.stdout.write("PERFECTLY DOCUMENTED FILES\n")
      Process.stdout.write("-".repeat(35) + "\n")
      perfectFiles.forEach((file) => {
        Process.stdout.write(`   ${file.filename} (${file.totalExports} exports)\n`)
      })
      Process.stdout.write("\n")
    }

    // Show a sample of missing items for the top file
    if (sortedFiles.length > 0) {
      const topFile = sortedFiles[0]
      const topFileMissingItems = missingItems.filter((item) => item.file === topFile.filename).slice(0, 10)
      if (topFileMissingItems.length > 0) {
        Process.stdout.write(`SAMPLE MISSING ITEMS FROM ${topFile.filename}\n`)
        Process.stdout.write("-".repeat(35) + "\n")
        topFileMissingItems.forEach((item) => {
          const missing = []
          if (item.missingExample) missing.push("example")
          if (item.missingCategory) missing.push("category")
          Process.stdout.write(`   ${item.name} (${item.type}, line ${item.line}): missing ${missing.join(", ")}\n`)
        })
        Process.stdout.write("\n")
      }
    }

    // Detailed breakdown by type
    Process.stdout.write("BREAKDOWN BY EXPORT TYPE\n")
    Process.stdout.write("-".repeat(35) + "\n")
    const typeStats = {}
    missingItems.forEach((item) => {
      if (!typeStats[item.type]) {
        typeStats[item.type] = { total: 0, missingExample: 0, missingCategory: 0 }
      }
      typeStats[item.type].total++
      if (item.missingExample) typeStats[item.type].missingExample++
      if (item.missingCategory) typeStats[item.type].missingCategory++
    })

    if (Object.keys(typeStats).length === 0) {
      Process.stdout.write("No missing documentation by type.\n")
    } else {
      Object.entries(typeStats).forEach(([type, stats]) => {
        Process.stdout.write(
          `${type}: ${stats.missingExample} missing examples, ${stats.missingCategory} missing categories\n`
        )
      })
    }

    Process.stdout.write("\n")

    // Progress tracking
    const documentedExamples = totalExports - missingExamples
    const documentedCategories = totalExports - missingCategories
    Process.stdout.write("DOCUMENTATION PROGRESS\n")
    Process.stdout.write("-".repeat(30) + "\n")
    Process.stdout.write(
      `Examples: ${documentedExamples}/${totalExports} (${
        ((documentedExamples / totalExports) * 100).toFixed(1)
      }% complete)\n`
    )
    Process.stdout.write(
      `Categories: ${documentedCategories}/${totalExports} (${
        ((documentedCategories / totalExports) * 100).toFixed(1)
      }% complete)\n`
    )
    Process.stdout.write("\n")

    Process.stdout.write("=".repeat(60) + "\n")
    Process.stdout.write(`Analysis complete! ${missingExamples + missingCategories} items need attention.\n`)
    Process.stdout.write("=".repeat(60) + "\n")

    // Save detailed results to JSON for further analysis
    const sanitizedPath = targetPath.replace(/\//g, "-").replace(/^-/, "")
    const outputFile = `jsdoc-analysis-${sanitizedPath}.json`
    Fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2))
    Process.stdout.write(`\nDetailed results saved to: ${outputFile}\n`)
  }
}

// Run the analysis
const analyzer = new JSDocAnalyzer({
  extensions,
  excludePatterns,
  recursive,
  jsonOutput
})

analyzer.analyze(targetPath, fileFilter)