# ADR 031: Mobile First & PWA Strategy

## Status
Proposed

## Context
The application is currently a responsive web app but lacks "installable" features for mobile devices (iOS/Android).
-   **User Request**: "do this application also available for cellphones and tables".
-   **Current State**: Responsive layout exists (Tailwind `md:` classes), but no PWA manifest for installation, no touch-optimized navigation, and generic viewport settings.

## Decision
We will upgrade the application to a **Progressive Web App (PWA)** to allow installation on mobile devices.

### 1. PWA Configuration
-   **Manifest**: Complete `manifest.ts` with required fields (`short_name`, `icons`, `background_color`, `display: standalone`).
-   **Icons**: Generate and serve standard PWA icons (192x192, 512x512, apple-touch-icon).
-   **Meta Tags**: Add `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, and optimized `viewport`.

### 2. Mobile UX Enhancements
-   **Navigation**: existing `MobileNav` (Hamburger) is functional. We will enable it to persist across pages properly.
-   **Input Zoom**: Enforce `16px` font size on inputs to prevent iOS auto-zoom.
-   **Safe Areas**: Ensure content respects notch/home indicator areas (`viewport-fit=cover`).

### 3. Deployment
-   **Installability**: Users can "Add to Home Screen" from browser.
-   **Offline**: (Future) Service Workers for offline caching. For now, focus on installability.

## Consequences
-   **Native Feel**: App will look and feel more like a native app when installed.
-   **Accessibility**: Improved touch targets and readability on small screens.
-   **No Store Required**: Bypasses App Store/Play Store complexity; effective immediately.
