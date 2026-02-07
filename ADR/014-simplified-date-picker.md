# 14. Simplified Transaction Date Picker

Date: 2026-02-07

## Status

Accepted

## Context

**Current State**: The "Add Transaction" dialog uses the native `datetime-local` input.
**Problem**: High friction, visual noise, and unnecessary precision for most transactions.

## Decision

We will replace the native input with a **Smart Date Picker**.

### Design
1.  **UI Component**: A specialized `SmartDatePicker` component (using `shadcn/ui` Calendar + Popover).
2.  **Presets**:
    -   **Today**: Sets date to `new Date()` (Current Time).
    -   **Yesterday**: Sets date to `new Date() - 24h`.
    -   **Calendar Icon**: Opens full monthly picker.

### Red Team Recommendations (Adopted)
1.  **Time Precision**: The picker must NOT strip the time component.
    -   When choosing "Today", use `new Date()` to capture the exact entry time.
    -   When choosing a past date via Calendar, preserve the current time of day (or default to 12:00 PM) to avoid all transactions stacking at 00:00:00.
2.  **Mobile Usability**: Ensure the Calendar Popover is responsive and touch-friendly.

### Implementation
-   **Library**: `date-fns` for manipulation. `react-day-picker` (via shadcn).
-   **Component**: `SmartDatePicker` receiving `value` (Date object or ISO string) and `onChange`.
-   **Output**: Always returns a full ISO String with Time.
