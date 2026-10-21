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

The security fix is the upstream mutability correction in
`src/variant_iter.rs`: declare the C out pointer with `let mut p` and pass
`&mut p` to the variadic `g_variant_get_child`. Passing `&p` allowed writes
through an immutable reference, which optimization could disregard before
`CStr::from_ptr(p)`.

Four focused regressions are added in that file's existing test module.
The vendored crate also carries 34 mechanical Rust 1.99 compatibility edits:
31 explicit lifetime annotations and three redundant trait-object type
parenthesis removals. Two existing test macros also replace deprecated
`max_value()` calls with the equivalent `MAX` constants (seven expanded
warnings). These edits preserve inferred lifetimes, signatures, API and
behavior while satisfying the existing CI warning policy. Changed files are
`collections/list.rs`, `collections/slist.rs`, `enums.rs`, `main_context.rs`,
`object.rs`, `param_spec.rs`, `subclass/types.rs`, `translate.rs`, `value.rs`,
`value_array.rs`, `variant.rs`, and `variant_type.rs` under `src/`.
Package metadata, upstream README, COPYRIGHT and LICENSE legal text are
preserved. Published/cache metadata
`.cargo_vcs_info.json`, `.cargo-checksum.json`, and `.cargo-ok` are omitted;
the relevant published revision is recorded above instead. The crate name
and version remain `glib` 0.18.5. Registry archive checksums describe the
original archive and must never be represented as checksums of this modified
tree.

After PR #1928 merged, the archive checksum was recomputed and matched the
value above. Published-file comparison identifies `src/variant_iter.rs`
(the security fix and four tests), the 12 mechanical compatibility files
listed above and LICENSE final-blank-line normalization;
`.cargo_vcs_info.json` is omitted.
All four focused regressions passed in `cargo test --release`; both application
roots passed `cargo check --locked` with their production Linux features and
resolve this shared source. These receipts do not imply automatic Dependabot
closure or a live application smoke test. Consult the packet Rust report and
[maintenance and reversal instructions](../README.md).

The LICENSE text is retained in full; its extra final blank line is normalized
to satisfy the repository whitespace check. This formatting-only exception
does not change the license grant or copyright. The original archive remains
the provenance source for the exact published bytes.
