export const BABEL_CONFIG = {
    // 1. LOCALE STRATEGY
    strategy: {
        default_locale: "en-US",
        supported_locales: ["en-US", "es-MX", "pt-BR", "fr-FR"],
        fallback_strategy: "DEFAULT_LOCALE", // or "KEY_NAME"
    },
    // 2. FORMATTING RULES
    formatting: {
        currency_display: "narrowSymbol", // e.g., '$'
        date_format: "short", // e.g., 01/26/26
        number_system: "latn",
    },
    // 3. STORAGE & SYNC
    storage: {
        format: "ICU_MESSAGE_FORMAT", // Support for plurals and genders
        path: "./locales",
        hot_reload: true, // Update text without rebuild
    },
    // 4. LAYOUT
    layout: {
        rtl_support: true, // Enable for ar, he, etc.
        adaptive_spacing: true, // German/Finnish require +20% width
    },
} as const;
