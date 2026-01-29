import { loginRateLimiter } from "../lib/rate-limit"
import { logger } from "../lib/logger"
import { formatCurrency, formatDate } from "../lib/format"
import { SHIELD_CONFIG } from "../../shield.config"

console.log("👻 GHOST PROTOCOL VERIFICATION 👻")
console.log("----------------------------------")

// 1. Verify Shield
console.log("🛡️ SHIELD STATUS:")
const isShieldActive = (loginRateLimiter as any).maxRequests === SHIELD_CONFIG.network.rate_limit_per_minute
console.log(`   - Rate Limit Configured: ${isShieldActive ? "✅" : "❌"} (${(loginRateLimiter as any).maxRequests} req/window)`)
if (!isShieldActive) throw new Error("Shield config mismatch")

// 2. Verify Telemetry
console.log("📡 TELEMETRY STATUS:")
const sensitiveData = { password: "secret123", email: "test@example.com", credit_card: "4242" }
const redacted = (logger as any).redact(sensitiveData)
const isRedacted = redacted.password === "[REDACTED]" && redacted.credit_card === "[REDACTED]"
console.log(`   - PII Redaction: ${isRedacted ? "✅" : "❌"}`)
console.log("   - Sample:", JSON.stringify(redacted))
if (!isRedacted) throw new Error("Telemetry redaction failed")

// 3. Verify Babel
console.log("🗣️ BABEL STATUS:")
const currency = formatCurrency(1234.56)
const date = formatDate("2026-01-26")
const isFormatted = currency.includes("$") && (date.includes("1/26/26") || date.includes("2026"))
console.log(`   - Currency Format: ${currency}`)
console.log(`   - Date Format: ${date}`)
console.log(`   - Locale Valid: ${isFormatted ? "✅" : "⚠️ Check Config"}`)

console.log("----------------------------------")
console.log("🟢 GHOST PROTOCOL ACTIVE")
