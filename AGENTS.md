# AGENTS.md

## Purpose

Project-specific instructions for Codex agents working in this repository.

## Scope

- Applies to this repository only.
- If this file conflicts with global rules, prefer this file for repo work.

## Core Rules

- No nonsense.
- UX has to be brilliant.
- Use multi agents where required.
- Default to parallel agent execution for independent tasks.
- Use a lead agent to merge, validate, and resolve conflicts.
- Maximize capability over cost and latency unless explicitly overridden.

## Working Rules

- Make focused, minimal changes.
- Do not modify unrelated files.
- Keep code style consistent with existing patterns.
- Run relevant checks before finishing when possible.
- Prefer parallel reads, analysis, and validation when tasks are independent.
- Serialize only when one step depends on another.
- Proceed automatically when the next step is clear from repo context.
- Ask questions only when ambiguity creates material execution risk.
- Default Playwright browser checks to `1980x1080` unless the task explicitly requires another viewport.

## Preferred Commands

- Install: `npm install`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`
- <br />
