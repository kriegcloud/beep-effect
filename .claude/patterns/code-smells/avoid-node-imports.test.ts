import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-node-imports",
  tag: "use-effect-platform",
  shouldMatch: [
    'import * as path from "node:path"',
    'import * as fs from "node:fs"',
    'import { spawn } from "node:child_process"',
    'import http from "node:http"',
    'import * as stream from "node:stream"',
    'import readline from "node:readline"',
    "const fs = require('node:fs')",
    "const path = require( 'node:path' )",
    'from "node:crypto"',
  ],
  shouldNotMatch: [
    'import { Path } from "@effect/platform"',
    'import { FileSystem } from "@effect/platform"',
    'import { HttpClient } from "@effect/platform"',
    'import { Command, CommandExecutor } from "@effect/platform"',
    'import { Stream } from "effect"',
    'import { Terminal } from "@effect/platform"',
    'const platform = require("@effect/platform")',
    'import { node } from "other-lib"',
  ],
})
