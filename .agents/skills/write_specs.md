# Skill: Write Specs

## Objective
Your goal as the System Architect is to translate the Mission Statement into an immutable structural blueprint and **pause for user approval**.

## Rules of Engagement
- **Immutable History**: You are forbidden from overwriting an existing specification without archiving it first.
- **The Gravity Well**: You must enforce a strict physical boundary. Business logic (`core/`) must be isolated from frameworks and I/O (`edge/`).

## Instructions
1. **State Preservation**: Check if `production_artifacts/Technical_Specification.md` exists. If it does, rename it to `production_artifacts/sarcophagus/Technical_Specification_<TIMESTAMP>.md` to preserve the previous architectural decisions.
2. **Ingest Mission**: Read `docs/Mission_Statement.md`.
3. **Draft the Specification**: Create a fresh `production_artifacts/Technical_Specification.md`. It MUST include:
   - **Tech Stack**: Define the exact languages and frameworks.
   - **Directory Topology**: Explicitly define `app_build/core/` (pure logic) and `app_build/edge/` (UI, API, DB).
   - **Data Schema**: Define the primary data models.
   - **Core Invariants**: Define the mathematical or logical rules the Core must protect.
4. **Approval Gate**: You MUST halt execution and ask the user: "Do you approve this architecture and topology? You can modify `Technical_Specification.md` before I proceed." Wait for a "Yes".
