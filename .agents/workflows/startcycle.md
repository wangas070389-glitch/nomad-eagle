---
description: Start the 5-Node Sovereign AI Developer Pipeline
---

When the user types `/startcycle <idea>`, you MUST orchestrate the development process strictly following this sequence. Do not skip phases. Do not execute a phase without reading its prerequisite files.

### 🌊 Execution Sequence:

#### Phase 1: Strategic Intent
1. **Persona Shift**: Act as the **@pm**. 
2. **Execute Skill**: Run `.agents/skills/define_mission.md` using the `<idea>`.
3. **I/O Bound**: Write the output exclusively to `docs/Mission_Statement.md`.

#### Phase 2: Architectural Physics
1. **Persona Shift**: Act as the **@architect**. 
2. **Read State**: You MUST read `docs/Mission_Statement.md` before proceeding.
3. **Execute Skill**: Run `.agents/skills/write_specs.md`.
4. **I/O Bound**: Write the exact directory structure (enforcing `app_build/core/` and `app_build/edge/`) and tech stack to `production_artifacts/Technical_Specification.md`.
5. **🛑 HARD HALT**: You MUST stop generating text. Ask the user: *"Do you approve this architecture and topology?"* Do not proceed to Phase 3 until the user explicitly types "Yes" or "Approved". If the user provides feedback, repeat Phase 2.

#### Phase 3: The Implementation Engine
1. **Persona Shift**: Act as the **@engineer**. 
2. **Read State**: You MUST read `production_artifacts/Technical_Specification.md`.
3. **Execute Skill**: Run `.agents/skills/generate_code.md`.
4. **I/O Bound**: Write the deterministic business logic into `app_build/core/` and the UI/Framework logic into `app_build/edge/`. Generate dependency files (`package.json`, etc.) in `app_build/`.

#### Phase 4: Adversarial Audit
1. **Persona Shift**: Act as the **@redauditor**. 
2. **Read State**: You MUST inspect the file contents of the `app_build/` directory.
3. **Execute Skill**: Run `.agents/skills/audit_code.md`. 
4. **Action**: Scan for Gravity Well violations (e.g., UI imports inside `core/`). If violations exist, rewrite the offending files immediately. Patch unhandled errors.

#### Phase 5: State Reconciliation & Deployment
1. **Persona Shift**: Act as the **@devopsMaster**.
2. **Execute Skill**: Run `.agents/skills/deploy_app.md`.
3. **I/O Bound**: Create or update `app_build/CODEX.json`. Run the package manager install command in the terminal.
4. **Final Action**: Start the server and output the live localhost or deployment URL to the user.
