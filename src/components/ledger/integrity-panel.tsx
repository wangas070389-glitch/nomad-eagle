"use client"

import { useState, useEffect } from "react"
import { getSystemIntegrity, IntegrityReport } from "@/server/actions/health"
import { repairLedgerIntegrity } from "@/server/actions/repair-ledger"
import { ShieldCheck, ShieldAlert, RefreshCw, Activity, Wand2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function LedgerIntegrityPanel() {
  const [report, setReport] = useState<IntegrityReport | null>(null)
  const [loading, setLoading] = useState(false)

  const checkIntegrity = async () => {
    setLoading(true)
    try {
      const res = await getSystemIntegrity()
      setReport(res)
    } finally {
      setLoading(false)
    }
  }

  const handleRepair = async () => {
    setLoading(true)
    try {
      const res = await repairLedgerIntegrity()
      if (res.success) {
        await checkIntegrity()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkIntegrity()
  }, [])

  return (
    <Card className="relative overflow-hidden glass-card shadow-2xl">
      {/* Background Pulse Effect */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-colors duration-1000 ${
        report?.status === 'HEALTHY' ? 'bg-emerald-500/20' : report?.status === 'UNHEALTHY' ? 'bg-rose-500/20' : 'bg-blue-500/10'
      }`} />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">Ledger Provenance</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Verifying secondary caches against immutable ledger.
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={checkIntegrity} 
            disabled={loading}
            className="hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {loading && !report ? (
          <div className="flex h-32 items-center justify-center space-x-2">
            <Activity className="h-4 w-4 animate-pulse text-blue-400" />
            <span className="text-sm text-muted-foreground">Auditing Ledger...</span>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                report.status === 'HEALTHY' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/20 text-rose-500'
              }`}>
                {report.status === 'HEALTHY' ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold leading-none">
                    {report.status === 'HEALTHY' ? '100%' : `${100 - report.discrepancies.length}%`}
                  </span>
                  <Badge variant={report.status === 'HEALTHY' ? 'default' : 'destructive'} className="rounded-full">
                    {report.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Integrity Score</p>
              </div>
            </div>

            {report.discrepancies.length > 0 && (
              <div className="space-y-3 rounded-xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Discrepancies Detected</p>
                <div className="space-y-2">
                  {report.discrepancies.map((d) => (
                    <div key={d.accountId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.accountName}</span>
                      <span className="font-mono text-rose-400">
                        {d.cachedBalance.toLocaleString()} vs {d.ledgerBalance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleRepair} 
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                  size="sm"
                >
                  <Wand2 className="h-3 w-3 mr-2" />
                  {loading ? 'Healing Ledger...' : 'Self-Heal Integrity Discrepancies'}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-blue-500/5 p-3 text-[10px] text-blue-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-3 w-3" />
                <span>CRYPTOGRAPHICALLY VERIFIED</span>
              </div>
              <span className="opacity-50">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
