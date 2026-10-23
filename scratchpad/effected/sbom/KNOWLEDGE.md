# sbom — the signer half

The upstream knowledge bundle for `@effected/sbom` moved with the pure half to
[`packages/foundation/modeling/sbom/KNOWLEDGE.md`](../../../packages/foundation/modeling/sbom/KNOWLEDGE.md)
(effected-promotion wave 4-S). It still covers this lab module: the sections on signing, the identity seam,
`SigningError.kind`, unwitnessed bundles and the test doubles describe `SigstoreSigner.ts`, which stays here as the
deferred `@beep/sigstore` half until its first consumer (a release attestation step, SPEC D-05 and W4-m).
