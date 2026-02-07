# Red Team Analysis: Dependency Locking (Report 015)

**Date**: 2026-02-07
**Target**: ADR 015 (Calendar Downgrade)

## 1. Vulnerability: Supply Chain Drift
**Risk**: Installing packages without specified versions (`npm install foo`) fetches `latest`.
-   **Incident**: `react-day-picker` released v9 recently, breaking the `shadcn` template.
-   **Analysis**: This was a "Blind Install" vulnerability.

## 2. Risk of Downgrade
**Scenario**: Downgrading to v8.
-   **Security**: v8 is mature. No known critical CVEs for our usage.
-   **Functionality**: v8 supports all features we used in `SmartDatePicker` (single selection, navigation).
-   **Verdict**: Safe.

## 3. Alternative: Upgrade to v9
**Analysis**:
-   v9 renames `IconLeft` -> `Chevron`.
-   v9 changes many CSS classes (`rdp-` prefix handling).
-   **Risk**: If we patch the `Icon` error, we might still have **broken styles** (invisible calendar) because the classes don't match.
-   **Conclusion**: Downgrade is the *only* safe option without a full UI audit.

## 4. Recommendation
**Enforce Strict Versioning** for UI libraries.
-   Execute the downgrade immediately.
-   Lock the version in `package.json`.

## 5. Incident Log (2026-02-07)
**Issue**: CI Build Failure due to Dependency Race Condition.
**Analysis**: The `npm install` process was run asynchronously and had not completed writing `package.json` updates before the `git commit` command was executed. This resulted in the remote repository remaining on the old, conflicting version (`date-fns` v4) despite the local environment being fixed.
**Correction**: Ensured synchronous execution of `npm install` and verified file system state before committing.
**Lesson**: Always verify `git status` before committing after a background install operation.
