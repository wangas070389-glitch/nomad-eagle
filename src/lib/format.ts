import { BABEL_CONFIG } from "../../babel.config"

export function formatCurrency(amount: number | string | undefined): string {
    if (amount === undefined || amount === null) return ""
    const num = typeof amount === "string" ? parseFloat(amount) : amount

    return new Intl.NumberFormat(BABEL_CONFIG.strategy.default_locale, {
        style: "currency",
        currency: "USD", // Ideally this comes from user profile mixed with config fallbacks
        currencyDisplay: BABEL_CONFIG.formatting.currency_display as any
    }).format(num)
}

export function formatDate(date: Date | string | undefined): string {
    if (!date) return ""
    const d = new Date(date)

    return new Intl.DateTimeFormat(BABEL_CONFIG.strategy.default_locale, {
        dateStyle: BABEL_CONFIG.formatting.date_format as any
    }).format(d)
}

export const currentLocale = BABEL_CONFIG.strategy.default_locale
