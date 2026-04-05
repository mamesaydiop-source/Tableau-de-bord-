# CLAUDE.md — AI Assistant Guide for Tableau-de-bord-

## Project Overview

**Tableau-de-bord-** is a task-tracking dashboard application (French: *Suivi de tâche*). The project is in its initialization phase — source code, dependencies, and tooling have not yet been added.

This file provides guidance for AI assistants (Claude Code and others) working in this repository.

---

## Current Repository State

As of the initial commit, the repository contains only:

```
/
├── .git/
├── README.md
└── CLAUDE.md  ← this file
```

No source code, package manager configuration, framework, or CI/CD setup is present yet.

---

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `claude/<feature>` | AI-assisted feature/documentation branches |

### Development Rules

- **Never push directly to `main`** without a pull request.
- Create feature branches from `main` using the naming convention `<type>/<short-description>` (e.g., `feat/task-list`, `fix/date-filter`, `docs/setup-guide`).
- Write clear, descriptive commit messages in English or French (be consistent within the project once established).
- Always push with tracking: `git push -u origin <branch-name>`.

---

## Development Conventions (to be followed as the project grows)

### Language

- The project is French-facing (UI labels, variable names in domain objects may be French).
- Code comments and commit messages: choose one language (English or French) and stay consistent.

### Coding Style

These rules should be enforced once the stack is chosen:

- **Indentation:** 2 spaces (recommended for JS/TS projects).
- **Line endings:** LF (`\n`).
- **Trailing whitespace:** Strip before committing.
- **File encoding:** UTF-8.

### Adding Dependencies

- Prefer well-maintained, widely-adopted libraries.
- Document the reason for each new dependency.
- Pin versions in lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, etc.).

---

## AI Assistant Instructions

### When Exploring the Codebase

- Read `CLAUDE.md` first (this file).
- Check `README.md` for high-level project description.
- Inspect `package.json` (or equivalent) for the tech stack and scripts once it exists.

### When Making Changes

1. Work on the designated feature branch — **never commit directly to `main`**.
2. Read files before editing them.
3. Do not add features, abstractions, or refactors beyond the scope of the task.
4. Do not add comments or docstrings to code you did not change.
5. Keep changes minimal and focused.

### When Adding New Files

- Prefer editing existing files over creating new ones.
- Do not create `*.md` documentation files unless explicitly requested.
- Place source files in the appropriate directory once the project structure is established.

### Risky Actions — Always Confirm First

- Deleting files or directories.
- Force-pushing any branch.
- Modifying CI/CD pipelines.
- Pushing to `main`.

---

## Updating This File

Update `CLAUDE.md` whenever:

- A technology stack is chosen and configured.
- New development workflows or conventions are established.
- A testing framework is added.
- CI/CD is configured.
- The directory structure changes significantly.

Keep this file accurate and concise — it is the first thing an AI assistant reads when working in this repository.
