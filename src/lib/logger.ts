import { TELEMETRY_CONFIG } from "../../telemetry.config"

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG"

class Logger {
    private redactFields: string[]

    constructor() {
        this.redactFields = [...TELEMETRY_CONFIG.logging.redact]
    }

    private redact(data: any): any {
        if (typeof data !== 'object' || data === null) return data

        if (Array.isArray(data)) {
            return data.map(item => this.redact(item))
        }

        const cleaned: any = {}
        for (const [key, value] of Object.entries(data)) {
            if (this.redactFields.includes(key)) {
                cleaned[key] = "[REDACTED]"
            } else if (typeof value === 'object') {
                cleaned[key] = this.redact(value)
            } else {
                cleaned[key] = value
            }
        }
        return cleaned
    }

    log(level: LogLevel, message: string, context?: any) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: context ? this.redact(context) : undefined,
            environment: process.env.NODE_ENV
        }

        // In a real implementation, this would send to OpenTelemetry/Datadog
        // For now, we print structured JSON to stdout
        if (TELEMETRY_CONFIG.logging.format === "JSON") {
            console.log(JSON.stringify(entry))
        } else {
            console.log(`[${entry.timestamp}] ${level}: ${message}`, entry.context || "")
        }
    }

    info(message: string, context?: any) { this.log("INFO", message, context) }
    warn(message: string, context?: any) { this.log("WARN", message, context) }
    error(message: string, context?: any) { this.log("ERROR", message, context) }
    debug(message: string, context?: any) { this.log("DEBUG", message, context) }
}

export const logger = new Logger()
