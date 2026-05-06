# @beep/duckdb

Driver-level DuckDB runtime for repository tooling that needs local analytical
storage and Parquet exports.

This package owns the technical boundary to DuckDB. Domain packages own their
schemas, retention semantics, privacy contracts, and projection rules.
