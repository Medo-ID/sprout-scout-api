# Sprout Scout API

A learning project: a Node.js + TypeScript backend API with PostgreSQL that helps amateur gardeners track plants, watering schedules, sunlight guidance, and basic garden management.

> NOTE: This project is for learning purposes. The API is mostly implemented but not production ready. Tests exist (unit + integration) but coverage is not complete. The remaining major feature is the "tasks scheduler".

## Goals

- Practice building a robust backend API using Node.js and TypeScript.
- Learn testing strategies: unit tests, mocking, and integration tests.
- Explore real-world issues that appear when testing against a relational DB (deadlocks, race conditions), and learn how to mitigate them.

## Tech stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Jest + Supertest for testing
- pg (node-postgres) for DB access
- Zod for validation

## High level features

- User registration and authentication (local)
- Garden management (create/read/update/delete)
- Plants catalog and syncing from an external API
- Plant tracking for watering and sunlight guidance
- Tasks (CRUD) — scheduler implementation is the remaining work

## What still needs work

- Implement the tasks scheduler (one remaining major feature).
- Expand test coverage (some code paths still untested).

## Setup (for contributors)

1. Install dependencies

```bash
pnpm install
```

2. Create a `.env` file in the project root with environment variables. At minimum provide values for:

General

- NODE_ENV (development or test)
- PORT

Database (development)

- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT

Database (test)

- TESTDB_HOST
- TESTDB_USER
- TESTDB_PASSWORD
- TESTDB_NAME
- TESTDB_PORT

Auth / JWT

- ACCESS_SECRET
- REFRESH_SECRET
- JWT_EXPIRES_IN (optional, e.g. `15m`)
- REFRESH_EXPIRES_IN (optional, e.g. `7d`)

External API

- EXTERNAL_API_KEY (used by the external plant API client)

3. Prepare PostgreSQL databases

Create development and test databases referred to by your `.env`. Apply migrations located at `src/config/db_migration.sql`:

```bash
# Example (adjust host/user/db/port as needed)
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f src/config/db_migration.sql
psql -h "$TESTDB_HOST" -U "$TESTDB_USER" -d "$TESTDB_NAME" -f src/config/db_migration.sql
```

4. Run the app (development)

```bash
pnpm run dev   # if available, or compile and run
pnpm build
node dist/server.js
```

5. Run tests

- Parallel (fast):

```bash
pnpm test
```

- Serial (more stable for integration test DB concurrency issues):

```bash
pnpm test -i --runInBand
```

Tip: If you see intermittent Postgres deadlocks or race conditions while running tests in parallel, re-run with `--runInBand` to isolate and debug.

## Testing notes and important guidance

- Integration tests use a real Postgres test database. Tests call helpers in `src/config/database.ts` to initialize and reset the test DB.
- Parallel Jest workers can cause contention on a single test DB. This project adopts a pragmatic approach to reduce failures:
  - Replaced `TRUNCATE` with `DELETE FROM` in test reset helpers to reduce aggressive locking.
  - Use `pg_advisory_lock` to serialize reset operations across workers.
  - Added a retry/backoff loop when encountering Postgres deadlock errors (error code `40P01`).
- These mitigations lower the chance of deadlocks, but the most robust strategy is to either run integration tests serially in CI or provision per-worker/test-instance databases.

## Issues I encountered (and solutions that helped)

Below are several concrete problems I ran into while writing tests and what I did to fix or mitigate them. This is useful for contributors and for future improvements.

1. Deadlocks and race conditions when resetting the DB (TRUNCATE)

- Symptom: Postgres deadlocks (40P01) when multiple Jest workers call TRUNCATE/DDL concurrently.
- Why: TRUNCATE and some DDL acquire AccessExclusiveLock which easily deadlocks across interleaved transactions.
- What I did: switched to `DELETE FROM` and used `pg_advisory_lock` plus retry/backoff. This dramatically reduced flakes.
- Stronger options: run integration tests serially (`--runInBand`) or create per-worker test DBs.

2. FK violation when inserting auth_providers shortly after user creation

- Symptom: insertion into `auth_providers` failed because the `users` row wasn't visible/committed.
- Why: racing resets or timing issues between DB operations in tests.
- What I did: restored repository-based insert flow (so unit tests can mock repo calls) and ensured critical insert paths are atomic where needed.

3. Unit tests failing due to implementation changes (raw SQL vs repository)

- Symptom: unit tests expecting `userRepo.insert()` to be called stopped working after switching to direct SQL.
- Why: test mocks/expectations were tied to the repository interface.
- What I did: reverted to repo-based implementation for register paths to keep unit tests consistent. If you refactor to raw SQL, update unit tests accordingly.

4. External API mocking and response shape

- Symptom: tests failed when services returned unexpected shapes or when test-only short-circuits prevented mocks from being used.
- Fix: Remove test-only short-circuits from service logic; rely on mocking `fetch` in tests and validate the expected response shape.

5. Zod schema issues

- Symptom: used non-existent helpers like `z.email()` or `z.file()` which caused validation problems.
- Fix: use correct Zod patterns (`z.string().email()` and `z.string().url().optional()` for picture_url) or create custom refinements.

6. Leaking handles in tests

- Symptom: Jest warns of open handles at the end of suite runs.
- Fix: ensure DB pool is closed with `closeTestDB()` and avoid long-running timers in test contexts.

## Recommendations (next improvements)

- Per-worker test DBs: the most robust solution for parallel test runs. Create a unique test database per worker (e.g. append process.env.JEST_WORKER_ID or PID to the TESTDB_NAME) and provision them in a `globalSetup` script. Drop them in `globalTeardown`.
- Split test suites: run unit tests in parallel but run integration tests in their own job using `--runInBand` in CI.
- Add `globalSetup` / `globalTeardown` in Jest to ensure DB migrations and teardown are handled once per worker.
- Add OpenAPI/Swagger for clearer API docs.

## How to contribute

1. Fork the repo and create a feature branch.
2. Run tests locally and add unit + integration tests for any new behaviour.
3. Open a PR describing the change and reference any related issues. I welcome help to complete the tasks scheduler and to harden CI test strategy (per-worker DBs).

## Commands quick reference

Install

```bash
pnpm install
```

Run tests (parallel)

```bash
pnpm test
```

Run tests (serial — more stable for integration DB issues)

```bash
pnpm test -i --runInBand
```

Run a single test file

```bash
pnpm exec jest path/to/test --runInBand
```

## Final notes

This repository is a work in progress and a learning exercise. If you find bugs, flaky tests, or improvements, please open issues or PRs — contributions are very welcome. If you'd like help implementing per-worker DB provisioning or a Jest global setup/teardown flow for CI, I can add that next.

Happy coding 🌱
