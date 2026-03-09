const targets = [
  { target: "bun-darwin-arm64", outfile: "dist/effect-solutions-darwin-arm64" },
  { target: "bun-darwin-x64", outfile: "dist/effect-solutions-darwin-x64" },
  // Baseline x64 to avoid AVX2-only builds on older Linux hosts
  {
    target: "bun-linux-x64-baseline",
    outfile: "dist/effect-solutions-linux-x64",
  },
  { target: "bun-linux-arm64", outfile: "dist/effect-solutions-linux-arm64" },
]

for (const { target, outfile } of targets) {
  const result = Bun.spawnSync([
    "bun",
    "build",
    "src/cli.ts",
    "--compile",
    `--target=${target}`,
    `--outfile=${outfile}`,
  ])

  if (!result.success) {
    console.error(`Failed to build ${target}:`, new TextDecoder().decode(result.stderr))
    process.exit(result.exitCode ?? 1)
  } else {
    console.log(`Built ${outfile} (${target})`)
  }
}
