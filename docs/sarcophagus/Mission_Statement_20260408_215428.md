# Mission Statement: In-Place Relational Pulse

To **unify financial planning and execution** for **household capital managers** by **collapsing the allocation engine directly into the spreadsheet cells**, ensuring every discrete flow (income or expense) is relationally anchored to a deterministic budget boundary.

## Functional Scope

*   **Cell-Level Context Actions**: Transforming spreadsheet cells (Triple View: Planned/Actual/Runway) into interactive triggers (buttons) that launch the reconciliation/entry workflow in-situ.
*   **Sidebar De-Cluttering**: Elimination of the redundant, standalone "Manual Allocation" UI card to reduce cognitive load and maximize spreadsheet screen real-estate.
*   **Unified Flow Schema**: Upgrading Income and Expense flows to natively support and enforce "Budget & Category" relational mapping, ensuring 100% logical coverage of the capital pipeline.
*   **Simplified Category Reference**: Refactoring the "Category Budgets" grid into a "Just Categories" minimalist management layer, offloading active budget tracking to the primary spreadsheet.
*   **Contextual Handshaking**: Ensuring that when a user clicks a cell, the system pre-fills the "Relational Handshake" based on the row entity, eliminating manual selection friction.

## Anti-Objectives

*   **Feature Bloat**: Do not add "Bulk Import" logic at this stage; the focus is on high-friction, high-intentionality manual interaction.
*   **Pane-Based UI**: Do not keep active allocation forms as static sidebar elements; interaction should be transient/modal but triggered directly from the spreadsheet data points.

## Success Metrics

*   **Zero-Motion Handshake**: 100% of manual entry triggers are contextual; the user never has to "find" the target entity in a dropdown.
*   **Single-Pane Sovereignty**: The Plan Page provides full lifecycle management (Plan -> Execute -> Reconcile) without requiring layout switching.
