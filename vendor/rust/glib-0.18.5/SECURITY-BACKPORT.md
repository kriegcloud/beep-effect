# glib 0.18.5 VariantStrIter safety backport

- Original package: [glib 0.18.5](https://crates.io/crates/glib/0.18.5), MIT.
- Source distribution: cached original crates.io archive `glib-0.18.5.crate`.
- Registry archive checksum recorded in both application Cargo locks:
  `233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5`.
- Published VCS revision: `42b9caf98e03ded086362d9653ca58fe94dc8658`, path `glib`.
- Advisory: [GHSA-wrw7-89jp-8q8g](https://github.com/advisories/GHSA-wrw7-89jp-8q8g),
  also [RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html).
- Upstream fix: [GTK-rs PR #1343](https://github.com/gtk-rs/gtk-rs-core/pull/1343),
  merged commit `05dff0ee696f9bcd8617cd48c4b812d046d440cb`.

The production change is exactly the upstream mutability correction in
`src/variant_iter.rs`: declare the C out pointer with `let mut p` and pass
`&mut p` to the variadic `g_variant_get_child`. Passing `&p` allowed writes
through an immutable reference, which optimization could disregard before
`CStr::from_ptr(p)`.

The remaining Rust changes add four focused regressions in that file's
existing test module. All other published source, package metadata, upstream
README, COPYRIGHT, and LICENSE are preserved. Published/cache metadata
`.cargo_vcs_info.json`, `.cargo-checksum.json`, and `.cargo-ok` are omitted;
the relevant published revision is recorded above instead. The crate name
and version remain `glib` 0.18.5. Registry archive checksums describe the
original archive and must never be represented as checksums of this modified
tree.

After PR #1928 merged, the archive checksum was recomputed and matched the
value above. Every published file was compared: only `src/variant_iter.rs`
differs (the two-line fix and four tests); `.cargo_vcs_info.json` is omitted.
All four focused regressions passed in `cargo test --release`; both application
roots passed `cargo check --locked` with their production Linux features and
resolve this shared source. These receipts do not imply automatic Dependabot
closure or a live application smoke test. Consult the packet Rust report and
[maintenance and reversal instructions](../README.md).

The LICENSE text is retained in full; its extra final blank line is normalized
to satisfy the repository whitespace check. This formatting-only exception
does not change the license grant or copyright. The original archive remains
the provenance source for the exact published bytes.
