# db-admin Agent Notes

- Internal migration aggregation package for repo-owned database proof targets.
- Import slice table schemas into db-admin for migration generation only; production apps must not depend on `_internal/db-admin`.
- Use current `@beep/postgres`, `@beep/drizzle`, and `@beep/test-utils` primitives for live database proof work.
- Treat older Effect v3 db-admin packages as capability references, not topology templates.
