"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Loader2 } from "lucide-react"
import { replicateUniverse } from "@/server/actions/admin"
import { useToast } from "@/components/ui/use-toast"

export function ReplicationAction({ sourceEmail }: { sourceEmail: string }) {
    const [open, setOpen] = useState(false)
    const [targetEmail, setTargetEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleReplicate = async () => {
        setLoading(true)
        try {
            const res = await replicateUniverse(sourceEmail, targetEmail)
            if (res.success) {
                toast({ title: "Replication Complete", description: "Template cloned successfully." })
                setOpen(false)
                setTargetEmail("")
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        } catch (e) {
            toast({ title: "System Error", description: "Cloning protocol failed.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Replicate To...
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Clone Universe</DialogTitle>
                    <DialogDescription>
                        Replicate the household configuration from <span className="font-mono font-bold text-slate-900 dark:text-white">{sourceEmail}</span> to a target user.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="target" className="text-right">
                            Target Email
                        </Label>
                        <Input
                            id="target"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                            placeholder="recruit@nomad.com"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleReplicate} disabled={loading || !targetEmail}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initiate Cloning"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
