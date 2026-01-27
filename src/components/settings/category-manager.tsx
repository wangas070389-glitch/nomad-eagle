"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCustomCategory, archiveCategory } from "@/server/actions/categories"
import { useActionState, useState } from "react"
import { Trash2 } from "lucide-react"

export function CategoryManager({ categories }: { categories: any[] }) {
    const [state, action, isPending] = useActionState(createCustomCategory, null)

    // Separate System vs Custom
    const system = categories.filter(c => !c.householdId)
    const custom = categories.filter(c => c.householdId)

    const handleArchive = async (id: string) => {
        if (!confirm("Remove this category from new selections?")) return
        await archiveCategory(id)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Create custom tags for your specific spending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Create New */}
                <form action={action} className="flex gap-4 items-end border-b pb-6">
                    <div className="space-y-2 flex-1">
                        <Label>New Category Name</Label>
                        <Input name="name" placeholder="e.g. Lego Collection" required />
                    </div>
                    <div className="space-y-2 w-24">
                        <Label>Icon</Label>
                        <Input name="icon" placeholder="🧱" defaultValue="🏷️" className="text-center text-xl" maxLength={2} />
                    </div>
                    <input type="hidden" name="type" value="EXPENSE" />
                    <Button disabled={isPending}>{isPending ? "Adding..." : "Add"}</Button>
                </form>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Custom List */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-foreground">My Categories</h4>
                        {custom.length === 0 && <p className="text-sm text-muted-foreground">No custom categories yet.</p>}
                        <div className="space-y-2">
                            {custom.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-2 rounded-md border bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{c.icon}</span>
                                        <span className="font-medium text-sm">{c.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                        onClick={() => handleArchive(c.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System List */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-foreground">System Defaults (Read-only)</h4>
                        <div className="space-y-2">
                            {system.map(c => (
                                <div key={c.id} className="flex items-center gap-3 p-2 rounded-md border border-dashed text-muted-foreground">
                                    <span className="text-xl grayscale">{c.icon}</span>
                                    <span className="font-medium text-sm">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
