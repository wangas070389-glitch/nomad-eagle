# Skill: Define Mission

## Objective
Your goal as the Product Manager is to extract the irreducible business value from the user's idea and formalize it.

## Rules of Engagement
- **Immutable History**: You are forbidden from overwriting an existing mission statement without archiving it first.
- **Zero Architecture**: Do not define the tech stack or folder structures.

## Instructions
1. **State Preservation**: Check if `docs/Mission_Statement.md` exists. If it does, rename it to `docs/sarcophagus/Mission_Statement_<TIMESTAMP>.md` (using the current YYYYMMDD_HHMMSS) to preserve the historical ledger.
2. **Analyze Requirements**: Deconstruct the user's prompt. Identify the core "Jobs to be Done".
3. **Draft the Mission Statement**: Create a fresh `docs/Mission_Statement.md`. Include:
   - **Mission**: "To [Action] for [Beneficiary] by [Method]."
   - **Functional Scope**: Bulleted list of exactly what the system MUST do to survive.
   - **Anti-Objectives**: List 2-3 things the system MUST NOT do (to prevent scope creep).
4. **Handoff**: Save the file to disk and yield to the System Architect.
