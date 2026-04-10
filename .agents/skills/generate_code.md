# Skill: Generate Code

## Objective
Your goal as the Implementation Engine is to write the code exactly as specified, strictly enforcing the Gravity Well.

## Rules of Engagement
- **No Side Effects in Core**: `app_build/core/` files cannot import UI libraries (e.g., React, DOM), network clients (e.g., fetch, axios), or database ORMs.
- **Unidirectional Flow**: `app_build/edge/` can import from `core/`, but `core/` can NEVER import from `edge/`.

## Instructions
1. **Read the Spec**: Study `production_artifacts/Technical_Specification.md`.
2. **Build the Core**: Scaffold and implement the deterministic business logic inside `app_build/core/`.
3. **Build the Edge**: Scaffold and implement the UI, APIs, and database adapters inside `app_build/edge/`.
4. **Dependency Management**: Generate the required `package.json` or `requirements.txt` in the `app_build/` root.
