# Sacred Hero Database

Sacred Hero Database is a desktop companion for managing character saves from
**Sacred Plus** and **Sacred Underworld**. It helps you keep a local library of
characters and save versions, review their progress, and choose which saved
version is active in your game. Both games work the same way with the app; the
only difference is the number of active character slots.

The app is intended for players who want to keep more than the character slots
available in-game: import saves into a database, keep older versions, and swap
characters between the database and the game's active slots. It does not
replace the game or edit character stats.

## What you can do

- **See active characters** in the game's save slots and refresh the list.
- **Back up an active character** into the database.
- **Import `.pax` save files** from either game by dragging them into the Import
  screen or browsing for files. Imported characters are grouped by name and
  class. A version already in the database is skipped rather than imported
  again.
- **Browse your database** to see each character's latest version, class, level,
  and number of saved versions. Select a character to view additional details
  and its version history.
- **Restore a saved version** to an active game slot. When replacing an
  occupied slot, the app offers to back up the character currently in that slot
  first.
- **Remove a character from a game slot**. The app backs it up first by
  default; you can opt out in the confirmation dialog. Without a backup, the
  game's save file will be permanently deleted.

The database and imported save copies are stored locally on your computer. They
are separate from the game's active save files; deleting a character from the
database deletes its saved versions there, while removing a character from a
slot affects the game's save file.

## Download and update the app

The app is currently distributed for 64-bit Windows. Open the
[latest GitHub release](https://github.com/Virian/sacred-hero-database/releases/latest)
and download the `.msi` installer from its **Assets**. Run the installer and
follow its prompts. The `.sig` and `latest.json` files are updater metadata,
not installers.

When the app starts, it checks for updates and automatically downloads one if
available. To disable automatic update checks and downloads, open **Settings**
and clear **Automatically download application updates**. The app does not
install updates without your confirmation. Once an update is ready, an
information icon appears next to the app version; open **Settings** and choose
**Install and restart** to install it and relaunch the app. An internet
connection is required to check for and download updates.

## Settings and getting started

1. Open **Settings** and set **Game installation path** to the Sacred game
   folder for the game you play. You can type or paste the path, or choose
   **Browse...**. The app may detect the path automatically on Windows; check
   it if active characters do not appear.
2. Choose **Active character slots**:
   - **8 slots (Sacred Underworld)** when using Underworld.
   - **6 slots (Sacred Plus Compatibility)** when using Sacred Plus.
3. Choose whether to enable **Automatically download application updates**.
   This is on by default; turn it off to disable automatic update checks and
   downloads.
4. Choose **Save**. Use **Cancel** to discard unsaved changes.

The slot setting controls how many active game slots the app displays and
manages. It does not limit the number of characters or versions in your
database. After setup, use **Characters** to inspect active slots, **Import** to
add save files, and **Database** to manage your saved characters and versions.

## Development

### Prerequisites

- Node.js 24 and Corepack.
- pnpm 12.21.0, as pinned in `package.json`.
- The stable Rust toolchain.
- The [Tauri prerequisites for your operating system](https://v2.tauri.app/start/prerequisites/).

Windows is not required to develop or run the automated checks; CI also checks
the project on Linux. Windows is useful when testing against a local Sacred
game installation, and automatic game-path detection is Windows-only.

### Initial setup

```powershell
corepack enable
corepack pnpm install --frozen-lockfile
```

Run the desktop app in development mode:

```powershell
pnpm tauri dev
```

The UI is built with React, TypeScript, and Vite. The desktop shell and
game-save/database operations are implemented in Rust with Tauri and SQLite.
Frontend code and tests are under `src/`; Rust code and its tests are under
`src-tauri/`. The frontend calls the Rust backend through Tauri commands.

### Database migrations

SQLx embeds the migrations in `src-tauri/migrations/` into each build and
records a checksum when applying each migration. If a later build has different
bytes for an already-applied migration, startup fails with an error such as
`migration 0 was previously applied but has been modified`.

The checksum includes line endings: LF and CRLF versions of otherwise identical
SQL are different. Git checkout settings such as `core.autocrlf` can therefore
make a local Windows build embed different migration bytes from a CI or release
build. The release workflow runs on Windows, so verify the actual checked-out
line endings when diagnosing a checksum mismatch. Keep migration bytes
consistent across builds that may open the same database, including with
previously published releases.

Once a migration has shipped, do not edit it; add a new migration for schema
changes. If startup reports a checksum mismatch, verify which database file was
opened and compare the migration bytes used by each build. Do not delete the
database as a routine fix, since it may contain user data.

### Tests and checks

Run the frontend unit tests once:

```powershell
pnpm test -- --run
```

Run the Rust tests from the Rust project directory:

```powershell
cd src-tauri
cargo test
```

The CI checks also run:

```powershell
pnpm lint
pnpm format:check
cd src-tauri
cargo fmt --all -- --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
```

To create a local production build, run `pnpm tauri build`. This builds the app
for the current development environment; it is not a release or download.

### Updating packages

JavaScript and TypeScript dependencies are managed by pnpm. Review available
updates with:

```powershell
pnpm outdated
```

Update a specific package, or interactively update packages to their latest
versions:

```powershell
pnpm update <package> --latest
pnpm update --interactive --latest
```

Commit the corresponding changes to `package.json` and `pnpm-lock.yaml`. Avoid
hand-editing the lockfile. After updating, run the tests and checks above.
`pnpm install --frozen-lockfile` should succeed from the resulting checkout.

Rust dependencies are declared in `src-tauri/Cargo.toml` and pinned in
`src-tauri/Cargo.lock`. Run `cargo update` from `src-tauri` to refresh
lockfile-compatible versions, or `cargo update -p <crate>` to update one crate.
If changing a dependency requirement in `Cargo.toml`, regenerate and commit
`Cargo.lock` as well. After Rust or Tauri updates, run `cargo test`,
`cargo check`, and the frontend checks; keep the Tauri JavaScript and Rust
plugin versions compatible.
