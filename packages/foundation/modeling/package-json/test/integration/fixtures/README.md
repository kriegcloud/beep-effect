# Package manifest parser inputs

Each `package.fixture.json` is JSON data imported by
`../PackageJsonFile.int.test.ts`. That test serializes the objects into its
`MemoryFileSystem` at virtual `package.json` paths and exercises the package
manifest parser. The fixture directories are not installation roots; their
scripts and dependency ranges are examples to parse, not commands to execute.

The explicit fixture filename preserves JSON imports while preventing these
historical examples from being mistaken for active repository package manifests.
The rename preserves every input byte. Existing parser assertions still cover
minimal, full, scoped, boilerplate and custom-field manifests. Vulnerable ranges
may remain in these historical examples; this change does not claim to upgrade
them. Do not install these directories or execute the example scripts.
